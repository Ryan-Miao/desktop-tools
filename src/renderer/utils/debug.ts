import { storageService } from '../services/StorageService';

/**
 * Debug utility that only logs when debug mode is enabled
 */
class DebugLogger {
  private isEnabled(): boolean {
    try {
      const settings = storageService.getAppSettings();
      return settings.debugMode ?? false;
    } catch {
      return false;
    }
  }

  log(...args: any[]) {
    if (this.isEnabled()) {
      console.log('[Debug]', ...args);
    }
  }

  warn(...args: any[]) {
    if (this.isEnabled()) {
      console.warn('[Debug]', ...args);
    }
  }

  error(...args: any[]) {
    // Always log errors, regardless of debug mode
    console.error('[Error]', ...args);
  }

  info(...args: any[]) {
    if (this.isEnabled()) {
      console.info('[Debug]', ...args);
    }
  }

  table(...args: any[]) {
    if (this.isEnabled()) {
      console.table(...args);
    }
  }

  group(label: string) {
    if (this.isEnabled()) {
      console.group(label);
    }
  }

  groupEnd() {
    if (this.isEnabled()) {
      console.groupEnd();
    }
  }

  time(label: string) {
    if (this.isEnabled()) {
      console.time(label);
    }
  }

  timeEnd(label: string) {
    if (this.isEnabled()) {
      console.timeEnd(label);
    }
  }
}

// Export singleton instance
export const debug = new DebugLogger();
