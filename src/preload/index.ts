import { contextBridge, ipcRenderer } from 'electron';
import { IPCChannels } from '@shared/constants/channels';

// Expose protected methods that allow to renderer process to use
// ipcRenderer without exposing to entire object
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    invoke(channel: string, ...args: any[]) {
      return ipcRenderer.invoke(channel, ...args);
    },
    send(channel: string, ...args: any[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: string, listener: (...args: any[]) => void) {
      ipcRenderer.on(channel, (_event, ...args) => listener(...args));
    },
    off(channel: string, listener: (...args: any[]) => void) {
      ipcRenderer.removeListener(channel, listener);
    },
    removeAllListeners(channel: string) {
      ipcRenderer.removeAllListeners(channel);
    }
  },
  channels: IPCChannels
});

// Expose electronAPI for convenient access
contextBridge.exposeInMainWorld('electronAPI', {
  // Logging methods
  writeLog: (formattedLog: string) => ipcRenderer.invoke(IPCChannels.LOG_WRITE, formattedLog),
  getLogDirectory: () => ipcRenderer.invoke(IPCChannels.LOG_GET_DIRECTORY),
  setLogDirectory: (directory: string) => ipcRenderer.invoke(IPCChannels.LOG_SET_DIRECTORY, directory),
  readRecentLogs: (lines?: number) => ipcRenderer.invoke(IPCChannels.LOG_READ_RECENT, lines),
  clearLogs: () => ipcRenderer.invoke(IPCChannels.LOG_CLEAR)
});
