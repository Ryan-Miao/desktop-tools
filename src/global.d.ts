// 全局类型定义
export {};

declare global {
  interface Window {
    electron?: {
      ipcRenderer: {
        invoke(channel: string, ...args: any[]): Promise<any>;
        send(channel: string, ...args: any[]): void;
        on(channel: string, listener: (...args: any[]) => void): void;
        off(channel: string, listener: (...args: any[]) => void): void;
        removeAllListeners(channel: string): void;
      };
      channels?: {
        PLUGIN_LOAD: string;
        PLUGIN_UNLOAD: string;
        PLUGIN_MESSAGE: string;
        PLUGIN_LIST: string;
        WINDOW_SHOW: string;
        WINDOW_HIDE: string;
        WINDOW_MINIMIZE: string;
        WINDOW_MAXIMIZE: string;
        WINDOW_CLOSE: string;
        WINDOW_START_DRAG: string;
        FLOATING_CLOCK_OPEN: string;
        FLOATING_CLOCK_CLOSE: string;
        FLOATING_CLOCK_TOGGLE: string;
        DB_QUERY: string;
        DB_EXECUTE: string;
        DB_GET_CLOCK_SETTINGS: string;
        DB_UPDATE_CLOCK_SETTINGS: string;
        DB_GET_STATS: string;
        DB_SAVE_KEYBOARD_STATS: string;
        DB_SAVE_MOUSE_CLICK_STATS: string;
        DB_SAVE_MOUSE_MOVE_STATS: string;
        DB_EXPORT_STATS: string;
        INPUT_MONITOR_GET_STATS: string;
        INPUT_MONITOR_RESET: string;
        INPUT_MONITOR_SAVE: string;
        SYSTEM_NOTIFICATION: string;
        SYSTEM_CLIPBOARD: string;
        BACKUP_CREATE: string;
        BACKUP_RESTORE: string;
      };
    };
  }

  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: string;
      WEB_MODE?: string;
      VITE_APP_NAME?: string;
    }
  }
}
