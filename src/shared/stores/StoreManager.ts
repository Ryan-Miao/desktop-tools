/**
 * Store Manager
 *
 * Centralized management for all Zustand stores
 * Provides unified persistence, hydration, and state inspection
 */

import { logger } from '../logger';
import { StoreApi } from 'zustand';

export type StoreInstance = StoreApi<any> & {
  persist?: {
    setOptions: (options: any) => void;
    rehydrate: () => Promise<void>;
  };
};

export interface StoreConfig {
  name: string;
  store: StoreInstance;
  persistKey?: string;
  version?: number;
  onHydration?: (state: any) => void;
  onMigration?: (oldState: any, version: number) => any;
}

class StoreManager {
  private static stores: Map<string, StoreConfig> = new Map();
  private static isPersisting = false;
  private static persistQueue: Set<string> = new Set();
  private static persistTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Register a store with the manager
   */
  static register(config: StoreConfig) {
    const { name } = config;

    if (this.stores.has(name)) {
      logger.warn(`[StoreManager] Store "${name}" already registered, overwriting`);
    }

    this.stores.set(name, config);
    logger.info(`[StoreManager] Registered store: ${name}`);

    // Setup persistence if persistKey is provided
    if (config.persistKey) {
      this.setupPersistence(config);
    }
  }

  /**
   * Unregister a store
   */
  static unregister(name: string) {
    if (this.stores.delete(name)) {
      logger.info(`[StoreManager] Unregistered store: ${name}`);
    }
  }

  /**
   * Get a registered store
   */
  static getStore(name: string): StoreInstance | undefined {
    const config = this.stores.get(name);
    return config?.store;
  }

  /**
   * Get store state
   */
  static getState(name: string): any | undefined {
    const store = this.getStore(name);
    return store?.getState();
  }

  /**
   * Get all registered store names
   */
  static getStoreNames(): string[] {
    return Array.from(this.stores.keys());
  }

  /**
   * Persist all stores that have persistence configured
   */
  static async persistAll(): Promise<void> {
    if (this.isPersisting) {
      logger.warn('[StoreManager] Persist already in progress, adding to queue');
      return;
    }

    this.isPersisting = true;

    try {
      const persistPromises = Array.from(this.stores.values())
        .filter((config) => config.persistKey)
        .map(async (config) => {
          try {
            await this.persistStore(config.name);
          } catch (error) {
            logger.error(`[StoreManager] Failed to persist store "${config.name}"`, { error });
          }
        });

      await Promise.all(persistPromises);
      logger.debug('[StoreManager] All stores persisted');
    } finally {
      this.isPersisting = false;
    }
  }

  /**
   * Persist a specific store (debounced)
   */
  static persistStore(name: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Add to queue
      this.persistQueue.add(name);

      // Clear existing timer
      if (this.persistTimer) {
        clearTimeout(this.persistTimer);
      }

      // Set new timer (debounce by 1 second)
      this.persistTimer = setTimeout(async () => {
        const storesToPersist = Array.from(this.persistQueue);
        this.persistQueue.clear();

        try {
          await Promise.all(
            storesToPersist.map((storeName) => this._persistStoreImmediate(storeName))
          );
          resolve();
        } catch (error) {
          reject(error);
        }
      }, 1000);
    });
  }

  /**
   * Internal: Immediate persist without debouncing
   */
  private static async _persistStoreImmediate(name: string): Promise<void> {
    const config = this.stores.get(name);
    if (!config || !config.persistKey) {
      return;
    }

    try {
      const state = config.store.getState();
      const dataToSave = {
        version: config.version || 1,
        state,
        timestamp: Date.now(),
      };

      // Save to localStorage
      localStorage.setItem(config.persistKey, JSON.stringify(dataToSave));
      logger.debug(`[StoreManager] Persisted store: ${name}`);
    } catch (error) {
      logger.error(`[StoreManager] Failed to persist store "${name}"`, { error });
      throw error;
    }
  }

  /**
   * Hydrate all stores from storage
   */
  static async hydrateAll(): Promise<void> {
    const hydratePromises = Array.from(this.stores.values()).map(async (config) => {
      if (config.persistKey) {
        try {
          await this.hydrateStore(config.name);
        } catch (error) {
          logger.error(`[StoreManager] Failed to hydrate store "${config.name}"`, { error });
        }
      }
    });

    await Promise.all(hydratePromises);
    logger.info('[StoreManager] All stores hydrated');
  }

  /**
   * Hydrate a specific store from storage
   */
  static async hydrateStore(name: string): Promise<void> {
    const config = this.stores.get(name);
    if (!config || !config.persistKey) {
      return;
    }

    try {
      const stored = localStorage.getItem(config.persistKey);
      if (!stored) {
        logger.debug(`[StoreManager] No stored data for store: ${name}`);
        return;
      }

      const { version, state, timestamp } = JSON.parse(stored);

      // Check version and migrate if needed
      let finalState = state;
      if (config.onMigration && version !== (config.version || 1)) {
        finalState = config.onMigration(state, version);
        logger.info(`[StoreManager] Migrated store "${name}" from version ${version}`);
      }

      // Set state in store
      config.store.setState(finalState);

      // Call hydration callback
      if (config.onHydration) {
        config.onHydration(finalState);
      }

      logger.info(
        `[StoreManager] Hydrated store: ${name} (saved at ${new Date(timestamp).toISOString()})`
      );
    } catch (error) {
      logger.error(`[StoreManager] Failed to hydrate store "${name}"`, { error });
    }
  }

  /**
   * Setup persistence for a store
   */
  private static setupPersistence(config: StoreConfig) {
    // Subscribe to state changes and trigger persistence
    config.store.subscribe((state, prevState) => {
      // Only persist if state actually changed (deep comparison could be added here)
      if (state !== prevState) {
        this.persistStore(config.name);
      }
    });
  }

  /**
   * Clear all persisted data
   */
  static clearAll(): void {
    this.stores.forEach((config) => {
      if (config.persistKey) {
        localStorage.removeItem(config.persistKey);
      }
    });
    logger.info('[StoreManager] Cleared all persisted store data');
  }

  /**
   * Clear persisted data for a specific store
   */
  static clearStore(name: string): void {
    const config = this.stores.get(name);
    if (config?.persistKey) {
      localStorage.removeItem(config.persistKey);
      logger.info(`[StoreManager] Cleared persisted data for: ${name}`);
    }
  }

  /**
   * Export all store states (for backup/debugging)
   */
  static exportAll(): Record<string, any> {
    const exportData: Record<string, any> = {};

    this.stores.forEach((config, name) => {
      const state = config.store.getState();
      exportData[name] = {
        version: config.version || 1,
        state,
      };
    });

    return exportData;
  }

  /**
   * Import store states (for restore/debugging)
   */
  static async importAll(data: Record<string, any>): Promise<void> {
    for (const [name, storeData] of Object.entries(data)) {
      const config = this.stores.get(name);
      if (config) {
        try {
          const { version, state } = storeData as { version: number; state: any };

          // Migrate if needed
          let finalState = state;
          if (config.onMigration && version !== (config.version || 1)) {
            finalState = config.onMigration(state, version);
          }

          config.store.setState(finalState);
          logger.info(`[StoreManager] Imported state for: ${name}`);
        } catch (error) {
          logger.error(`[StoreManager] Failed to import state for "${name}"`, { error });
        }
      }
    }
  }

  /**
   * Get diagnostic information about all stores
   */
  static getDiagnostics(): {
    count: number;
    stores: Array<{ name: string; hasPersistence: boolean; version: number; stateKeys: string[] }>;
  } {
    const stores = Array.from(this.stores.entries()).map(([name, config]) => ({
      name,
      hasPersistence: !!config.persistKey,
      version: config.version || 1,
      stateKeys: Object.keys(config.store.getState()),
    }));

    return {
      count: stores.length,
      stores,
    };
  }
}

export default StoreManager;
