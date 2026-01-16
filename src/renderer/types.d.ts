// Global type definitions for window.electron
interface ElectronAPI {
  ipcRenderer: {
    invoke(channel: string, ...args: any[]): Promise<any>;
    send(channel: string, ...args: any[]): void;
    on(channel: string, listener: (...args: any[]) => void): void;
  };
  channels?: {
    PLUGIN_LIST?: string;
    WINDOW_MINIMIZE?: string;
    WINDOW_CLOSE?: string;
  };
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}

export {};
