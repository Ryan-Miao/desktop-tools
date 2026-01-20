/**
 * Unified Storage Service
 *
 * High-performance storage layer with:
 * - In-memory caching
 * - Debounced batch writes
 * - Automatic fallback
 * - Error recovery
 */

import { logger } from '../shared/logger';
import { fileStorageService } from '../renderer/services/FileStorageService';
import { debounce } from '../renderer/utils/debounce';

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  dirty: boolean;
}

interface StorageOptions {
  ttl?: number; // Time to live for cache entries (milliseconds)
  persistImmediately?: boolean; // Skip debouncing for critical saves
  fallbackToLocalStorage?: boolean; // Fallback to localStorage if IPC fails
}

class UnifiedStorageService {
  private cache: Map<string, CacheEntry> = new Map();
  private saveQueue: Map<string, any> = new Map();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes
  private persistTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly debounceMs = 1000; // 1 second debounce

  /**
   * Get data from storage with caching
   */
  async get<T>(key: string, options: StorageOptions = {}): Promise<T | null> {
    const { ttl = this.defaultTTL } = options;

    // Check cache first
    const cached = this.cache.get(key);
    if (cached) {
      const age = Date.now() - cached.timestamp;

      // Return cached data if still valid
      if (age < ttl) {
        logger.debug(`[UnifiedStorage] Cache hit: ${key}`);
        return cached.data as T;
      }

      // Cache expired, remove it
      this.cache.delete(key);
      logger.debug(`[UnifiedStorage] Cache expired: ${key}`);
    }

    // Load from storage
    logger.debug(`[UnifiedStorage] Loading from storage: ${key}`);
    const data = await fileStorageService.loadPluginData<T>(key);

    if (data !== null) {
      // Update cache
      this.cache.set(key, {
        data,
        timestamp: Date.now(),
        dirty: false,
      });
    }

    return data;
  }

  /**
   * Set data in storage with caching and debounced persistence
   */
  async set(key: string, value: any, options: StorageOptions = {}): Promise<boolean> {
    const { persistImmediately = false, fallbackToLocalStorage = true } = options;

    // Update cache immediately
    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      dirty: true,
    });

    // Add to save queue
    this.saveQueue.set(key, value);

    if (persistImmediately) {
      // Immediate persistence for critical saves
      return await this._persistImmediate(key, value, fallbackToLocalStorage);
    } else {
      // Debounced persistence for batched writes
      this._schedulePersist();
      return true;
    }
  }

  /**
   * Schedule a debounced persist operation
   */
  private _schedulePersist(): void {
    if (this.persistTimer) {
      clearTimeout(this.persistTimer);
    }

    this.persistTimer = setTimeout(async () => {
      await this._flushSaveQueue();
    }, this.debounceMs);
  }

  /**
   * Flush the save queue immediately
   */
  private async _flushSaveQueue(): Promise<void> {
    if (this.saveQueue.size === 0) {
      return;
    }

    logger.debug(`[UnifiedStorage] Flushing save queue (${this.saveQueue.size} items)`);

    const itemsToSave = Array.from(this.saveQueue.entries());
    this.saveQueue.clear();

    // Save all items in parallel
    await Promise.all(
      itemsToSave.map(async ([key, value]) => {
        try {
          await this._persistImmediate(key, value, true);
        } catch (error) {
          logger.error(`[UnifiedStorage] Failed to save ${key}`, { error });
          // Re-add to queue on failure
          this.saveQueue.set(key, value);
        }
      })
    );
  }

  /**
   * Persist a single key immediately
   */
  private async _persistImmediate(
    key: string,
    value: any,
    fallbackToLocalStorage: boolean
  ): Promise<boolean> {
    try {
      const success = await fileStorageService.savePluginData(key, value);

      if (success) {
        // Update cache entry as clean
        const cached = this.cache.get(key);
        if (cached) {
          cached.dirty = false;
        }
        logger.debug(`[UnifiedStorage] Persisted: ${key}`);
        return true;
      } else {
        throw new Error('Storage service returned false');
      }
    } catch (error) {
      logger.error(`[UnifiedStorage] Failed to persist ${key}`, { error });

      // Fallback to localStorage
      if (fallbackToLocalStorage) {
        try {
          localStorage.setItem(key, JSON.stringify(value));
          logger.info(`[UnifiedStorage] Fell back to localStorage for: ${key}`);
          return true;
        } catch (fallbackError) {
          logger.error(`[UnifiedStorage] LocalStorage fallback failed for ${key}`, {
            error: fallbackError,
          });
          return false;
        }
      }

      return false;
    }
  }

  /**
   * Delete data from storage
   */
  async delete(key: string, options: StorageOptions = {}): Promise<boolean> {
    const { fallbackToLocalStorage = true } = options;

    // Remove from cache
    this.cache.delete(key);

    // Remove from save queue
    this.saveQueue.delete(key);

    try {
      const success = await fileStorageService.deletePluginData(key);

      if (!success && fallbackToLocalStorage) {
        // Also remove from localStorage fallback
        localStorage.removeItem(key);
      }

      return success;
    } catch (error) {
      logger.error(`[UnifiedStorage] Failed to delete ${key}`, { error });

      if (fallbackToLocalStorage) {
        localStorage.removeItem(key);
        return true;
      }

      return false;
    }
  }

  /**
   * Check if a key exists
   */
  async has(key: string): Promise<boolean> {
    // Check cache first
    if (this.cache.has(key)) {
      return true;
    }

    // Check storage
    const data = await fileStorageService.loadPluginData(key);
    return data !== null;
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
    logger.info('[UnifiedStorage] Cache cleared');
  }

  /**
   * Invalidate specific cache entry
   */
  invalidateCache(key: string): void {
    this.cache.delete(key);
    logger.debug(`[UnifiedStorage] Cache invalidated: ${key}`);
  }

  /**
   * Force flush all pending writes
   */
  async flush(): Promise<void> {
    if (this.persistTimer) {
      clearTimeout(this.persistTimer);
      this.persistTimer = null;
    }

    await this._flushSaveQueue();
    logger.info('[UnifiedStorage] All pending writes flushed');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    dirtyEntries: number;
    queuedSaves: number;
    entries: Array<{ key: string; age: number; dirty: boolean }>;
  } {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      age: Date.now() - entry.timestamp,
      dirty: entry.dirty,
    }));

    const dirtyEntries = entries.filter((e) => e.dirty).length;

    return {
      size: this.cache.size,
      dirtyEntries,
      queuedSaves: this.saveQueue.size,
      entries,
    };
  }

  /**
   * Preload multiple keys into cache
   */
  async preload(keys: string[]): Promise<void> {
    await Promise.all(
      keys.map(async (key) => {
        try {
          await this.get(key);
        } catch (error) {
          logger.warn(`[UnifiedStorage] Failed to preload ${key}`, { error });
        }
      })
    );

    logger.info(`[UnifiedStorage] Preloaded ${keys.length} keys`);
  }

  /**
   * Export all cached data
   */
  exportCache(): Record<string, any> {
    const exportData: Record<string, any> = {};

    this.cache.forEach((entry, key) => {
      exportData[key] = entry.data;
    });

    return exportData;
  }

  /**
   * Import data into cache
   */
  importCache(data: Record<string, any>): void {
    Object.entries(data).forEach(([key, value]) => {
      this.cache.set(key, {
        data: value,
        timestamp: Date.now(),
        dirty: true, // Mark as dirty so it gets persisted
      });

      // Also add to save queue
      this.saveQueue.set(key, value);
    });

    logger.info(`[UnifiedStorage] Imported ${Object.keys(data).length} cache entries`);

    // Schedule persist
    this._schedulePersist();
  }
}

// Singleton instance
export const unifiedStorageService = new UnifiedStorageService();

// Auto-flush on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', async () => {
    await unifiedStorageService.flush();
  });
}

export default UnifiedStorageService;
