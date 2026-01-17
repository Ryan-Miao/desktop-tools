import { ipcMain, BrowserWindow, dialog } from 'electron';
import path from 'path';
import type MainProcess from '../index';
import { BackupService } from '../services/BackupService';
import logService from '../services/LogService';
import { IPCChannels } from '@shared/constants/channels';
import { WindowConfig } from '@shared/types/plugin';

export function setupIPCHandlers(mainProcess: MainProcess) {
  const db = mainProcess.getDatabase();
  const pluginManager = mainProcess.getPluginManager();
  const windowManager = mainProcess.getWindowManager();
  const mainWindow = mainProcess.getMainWindow();
  const backupService = new BackupService(db);

  // ==================== Plugin Handlers ====================

  // Plugin lifecycle
  ipcMain.handle(IPCChannels.PLUGIN_LOAD, async (_, pluginId: string) => {
    await pluginManager.load(pluginId);
    return { loaded: true };
  });

  ipcMain.handle(IPCChannels.PLUGIN_UNLOAD, async (_, pluginId: string) => {
    await pluginManager.unload(pluginId);
    return { unloaded: true };
  });

  ipcMain.handle(IPCChannels.PLUGIN_RELOAD, async (_, pluginId: string) => {
    await pluginManager.reload(pluginId);
    return { reloaded: true };
  });

  ipcMain.handle(IPCChannels.PLUGIN_LOAD_ALL, async () => {
    await pluginManager.loadAll();
    return { loadedAll: true };
  });

  ipcMain.handle(IPCChannels.PLUGIN_UNLOAD_ALL, async () => {
    await pluginManager.unloadAll();
    return { unloadedAll: true };
  });

  // Plugin activation
  ipcMain.handle(IPCChannels.PLUGIN_ACTIVATE, async (_, pluginId: string) => {
    await pluginManager.activate(pluginId);
    return { activated: true };
  });

  ipcMain.handle(IPCChannels.PLUGIN_DEACTIVATE, async (_, pluginId: string) => {
    await pluginManager.deactivate(pluginId);
    return { deactivated: true };
  });

  // Plugin query
  ipcMain.handle(IPCChannels.PLUGIN_LIST, async () => {
    return pluginManager.getAll().map(p => p.manifest);
  });

  ipcMain.handle(IPCChannels.PLUGIN_GET, async (_, pluginId: string) => {
    const plugin = pluginManager.get(pluginId);
    return plugin ? plugin.manifest : null;
  });

  ipcMain.handle(IPCChannels.PLUGIN_GET_STATE, async (_, pluginId: string) => {
    return await pluginManager.getState(pluginId);
  });

  ipcMain.handle(IPCChannels.PLUGIN_GET_ALL_STATES, async () => {
    return await pluginManager.getAllStates();
  });

  // Plugin management
  ipcMain.handle(IPCChannels.PLUGIN_INSTALL, async (_, pluginPath: string) => {
    await pluginManager.install(pluginPath);
    return { installed: true };
  });

  ipcMain.handle(IPCChannels.PLUGIN_UNINSTALL, async (_, pluginId: string) => {
    await pluginManager.uninstall(pluginId);
    return { uninstalled: true };
  });

  ipcMain.handle(IPCChannels.PLUGIN_EXPORT, async (event, pluginId: string) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) {
      throw new Error('Could not find window');
    }

    // 选择保存位置
    const result = await dialog.showSaveDialog(win, {
      defaultPath: `${pluginId}.zip`,
      filters: [
        { name: 'Plugin Files', extensions: ['zip'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      title: '导出插件'
    });

    if (result.canceled || !result.filePath) {
      return { exported: false, canceled: true };
    }

    await pluginManager.export(pluginId, result.filePath);
    return { exported: true, path: result.filePath };
  });

  ipcMain.handle(IPCChannels.PLUGIN_IMPORT, async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) {
      throw new Error('Could not find window');
    }

    // 选择插件文件
    const result = await dialog.showOpenDialog(win, {
      filters: [
        { name: 'Plugin Files', extensions: ['zip'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      title: '导入插件',
      properties: ['openFile']
    });

    if (result.canceled || result.filePaths.length === 0) {
      return { imported: false, canceled: true };
    }

    const pluginPath = result.filePaths[0];
    await pluginManager.install(pluginPath);
    return { imported: true, path: pluginPath };
  });

  ipcMain.handle(IPCChannels.PLUGIN_UPDATE, async (_, pluginId: string) => {
    await pluginManager.update(pluginId);
    return { updated: true };
  });

  // Remote plugin
  ipcMain.handle(IPCChannels.PLUGIN_FETCH_REMOTE, async (_, url: string) => {
    await pluginManager.fetchFromRemote(url);
    return { fetched: true };
  });

  ipcMain.handle(IPCChannels.PLUGIN_CHECK_UPDATES, async () => {
    await pluginManager.checkUpdates();
    return { checked: true };
  });

  // Plugin message
  ipcMain.handle(IPCChannels.PLUGIN_MESSAGE, async (_, pluginId: string, channel: string, data: any) => {
    const plugin = pluginManager.get(pluginId);
    if (plugin?.handleMessage) {
      return await plugin.handleMessage(channel, data);
    }
    return null;
  });

  // ==================== Database Handlers ====================

  // Clock settings
  ipcMain.handle(IPCChannels.DB_GET_CLOCK_SETTINGS, async () => {
    return db.getClockSettings();
  });

  ipcMain.handle(IPCChannels.DB_UPDATE_CLOCK_SETTINGS, async (_, settings) => {
    db.updateClockSettings(settings);
    return { updated: true };
  });

  // Stats
  ipcMain.handle(IPCChannels.DB_GET_STATS, async (_, startDate: Date, endDate: Date) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const keyboardStats = db.getKeyboardStats(start, end);
    const mouseClickStats = db.getMouseClickStats(start, end);
    const mouseMoveStats = db.getMouseMoveStats(start, end);

    // Combine stats by timestamp
    const combinedStats: Map<string, any> = new Map();

    keyboardStats.forEach((stat: any) => {
      const timestamp = stat.timestamp.substring(0, 13);
      combinedStats.set(timestamp, {
        date: stat.timestamp,
        keyboard_count: stat.count,
        mouse_click_count: 0,
        mouse_move_distance: 0
      });
    });

    mouseClickStats.forEach((stat: any) => {
      const timestamp = stat.timestamp.substring(0, 13);
      const existing = combinedStats.get(timestamp);
      if (existing) {
        existing.mouse_click_count += stat.count;
      } else {
        combinedStats.set(timestamp, {
          date: stat.timestamp,
          keyboard_count: 0,
          mouse_click_count: stat.count,
          mouse_move_distance: 0
        });
      }
    });

    mouseMoveStats.forEach((stat: any) => {
      const timestamp = stat.timestamp.substring(0, 13);
      const existing = combinedStats.get(timestamp);
      if (existing) {
        existing.mouse_move_distance += stat.distance;
      } else {
        combinedStats.set(timestamp, {
          date: stat.timestamp,
          keyboard_count: 0,
          mouse_click_count: 0,
          mouse_move_distance: stat.distance
        });
      }
    });

    return Array.from(combinedStats.values()).sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  });

  // Save stats handlers
  ipcMain.handle(IPCChannels.DB_SAVE_KEYBOARD_STATS, async (_, count: number) => {
    db.saveKeyboardStats(count);
    return { saved: true };
  });

  ipcMain.handle(IPCChannels.DB_SAVE_MOUSE_CLICK_STATS, async (_, button: string, count: number) => {
    db.saveMouseClickStats(button, count);
    return { saved: true };
  });

  ipcMain.handle(IPCChannels.DB_SAVE_MOUSE_MOVE_STATS, async (_, distance: number) => {
    db.saveMouseMoveStats(distance);
    return { saved: true };
  });

  // Export stats
  ipcMain.handle(IPCChannels.DB_EXPORT_STATS, async (_, data) => {
    return await db.exportStats(data);
  });

  // Plugin data
  ipcMain.handle(IPCChannels.DB_GET_PLUGIN_DATA, async (_, pluginId: string) => {
    return db.getPluginData(pluginId);
  });

  ipcMain.handle(IPCChannels.DB_GET_ALL_PLUGIN_DATA, async () => {
    return db.getAllPluginData();
  });

  ipcMain.handle(IPCChannels.DB_SAVE_PLUGIN_DATA, async (_, pluginId: string, pluginName: string, pluginVersion: string, dataJson: string) => {
    db.savePluginData(pluginId, pluginName, pluginVersion, dataJson);
    return { saved: true };
  });

  ipcMain.handle(IPCChannels.DB_DELETE_PLUGIN_DATA, async (_, pluginId: string) => {
    db.deletePluginData(pluginId);
    return { deleted: true };
  });

  // ==================== Backup Handlers ====================

  ipcMain.handle(IPCChannels.BACKUP_CREATE, async () => {
    return backupService.createBackup();
  });

  ipcMain.handle(IPCChannels.BACKUP_RESTORE, async () => {
    return backupService.restoreBackup();
  });

  ipcMain.handle(IPCChannels.BACKUP_PREVIEW, async (_, backupPath: string) => {
    return backupService.previewBackup(backupPath);
  });

  ipcMain.handle(IPCChannels.BACKUP_CREATE_SELECTIVE, async (_, options) => {
    return backupService.createBackup(options);
  });

  ipcMain.handle(IPCChannels.BACKUP_RESTORE_SELECTIVE, async (_, options) => {
    return backupService.restoreBackup(options);
  });

  // ==================== System Handlers ====================

  ipcMain.handle(IPCChannels.SYSTEM_NOTIFICATION, async (_, { title, body }) => {
    const { Notification } = require('electron');
    new Notification({ title, body }).show();
    return { shown: true };
  });

  ipcMain.handle(IPCChannels.SYSTEM_CLIPBOARD, async (_, { type, value }) => {
    const { clipboard } = require('electron');
    if (type === 'write') {
      clipboard.writeText(value);
      return { written: true };
    } else if (type === 'read') {
      return clipboard.readText();
    }
    return null;
  });

  ipcMain.handle(IPCChannels.SYSTEM_GET_VERSION, async () => {
    return {
      version: require('../../../package.json').version
    };
  });

  // ==================== Log Handlers ====================

  // 单向日志写入（用于统一日志框架）
  ipcMain.on('log:write', async (_, entry) => {
    try {
      await logService.write(entry);
    } catch (error) {
      console.error('[log:write] Failed to write log:', error);
    }
  });

  // 日志查询
  ipcMain.handle('log:query', async (_, options) => {
    try {
      return logService.query(options);
    } catch (error) {
      console.error('[log:query] Failed to query logs:', error);
      return [];
    }
  });

  // 日志统计
  ipcMain.handle('log:stats', async () => {
    try {
      return logService.getStats();
    } catch (error) {
      console.error('[log:stats] Failed to get stats:', error);
      return { total: 0, byLevel: {}, byModule: {} };
    }
  });

  // 设置日志级别
  ipcMain.handle('log:setLevel', async (_, level) => {
    try {
      logService.setMinLevel(level);
      return { success: true, level: logService.getMinLevel() };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // 保留旧的LOG_WRITE接口（向后兼容）
  ipcMain.handle(IPCChannels.LOG_WRITE, async (_, formattedLog) => {
    try {
      // 调试：打印到控制台
      console.log('[LOG_WRITE] Received log:', formattedLog);

      // formattedLog 可能是 JSON 字符串或普通字符串
      let entry;
      try {
        entry = JSON.parse(formattedLog);
      } catch {
        // 如果不是 JSON，当作普通字符串处理
        entry = {
          timestamp: new Date().toISOString(),
          level: 1, // INFO
          message: formattedLog,
          data: undefined
        };
      }

      console.log('[LOG_WRITE] Writing entry:', entry);
      await logService.write(entry);

      console.log('[LOG_WRITE] Write successful');
      return { success: true };
    } catch (error) {
      console.error('[LOG_WRITE] Failed to write log:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle(IPCChannels.LOG_GET_DIRECTORY, async () => {
    return logService.getLogDirectory();
  });

  ipcMain.handle(IPCChannels.LOG_SET_DIRECTORY, async (_, directory) => {
    try {
      logService.setLogDirectory(directory);
      return { success: true, directory: logService.getLogDirectory() };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle(IPCChannels.LOG_READ_RECENT, async (_, lines = 100) => {
    return logService.readRecentLogs(lines);
  });

  ipcMain.handle(IPCChannels.LOG_CLEAR, async () => {
    logService.clearLogs();
    return { cleared: true };
  });

  // 日志清理
  ipcMain.handle('log:clean-old', async () => {
    logService.forceCleanup();
    return { cleaned: true };
  });

  // 获取日志文件大小
  ipcMain.handle('log:get-size', async () => {
    return {
      totalSize: logService.getTotalLogSize(),
      totalSizeKB: (logService.getTotalLogSize() / 1024).toFixed(2),
      totalSizeMB: (logService.getTotalLogSize() / 1024 / 1024).toFixed(2)
    };
  });

  // 获取日志文件信息
  ipcMain.handle('log:get-file-info', async () => {
    return logService.getLogFileInfo();
  });

  // ==================== 独立插件窗口 ====================

  // 打开独立插件窗口
  ipcMain.handle('plugin:open-standalone', async (_, pluginId: string, pluginTitle: string) => {
    try {
      const windowId = `standalone-${pluginId}`;

      // 使用 WindowManager 创建窗口（自动处理重复窗口检查）
      const windowConfig: WindowConfig = {
        width: 900,
        height: 700,
        minWidth: 600,
        minHeight: 400,
        transparent: false,        // 不透明 - 插件可自己设计透明度
        frame: false,              // 无边框 - 去掉原生菜单栏
        skipTaskbar: false,        // 显示任务栏图标
        backgroundColor: '#ffffff', // 白色背景
        resizable: true,
        maximizable: true,
        minimizable: true,
        closable: true,
        alwaysOnTop: false
      };

      await windowManager.createPluginWindow(windowId, pluginId, windowConfig);

      return { success: true, windowId };
    } catch (error) {
      logger.error(`Failed to open standalone window for plugin: ${pluginId}`, { error });
      return { success: false, error: (error as Error).message };
    }
  });

  // ==================== Setup Auto Backup ====================

  backupService.setupAutoBackup(24);
}
