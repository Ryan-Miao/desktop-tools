import { ipcMain, BrowserWindow, dialog } from "electron";
import type MainProcess from "../index";
import { BackupService } from "../services/BackupService";
import { FileStorageService } from "../services/FileStorageService";
import logService from "../services/LogService";
import { IPCChannels } from "@shared/constants/channels";
import { WindowConfig } from "@shared/types/plugin";
import { logger } from "../../shared/logger";

export function setupIPCHandlers(mainProcess: MainProcess) {
  const db = mainProcess.getDatabase();
  const pluginManager = mainProcess.getPluginManager();
  const windowManager = mainProcess.getWindowManager();
  const backupService = new BackupService(db);
  const fileStorage = new FileStorageService();

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
    return pluginManager.getAll().map((p) => p.manifest);
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

  // Get plugin component source code for dynamic loading
  ipcMain.handle("plugin:get-component-source", async (_, pluginId: string) => {
    const fs = await import("fs");
    const path = await import("path");
    const { app } = await import("electron");

    // Helper function to search for component file in a directory
    const searchComponentFile = (
      pluginDir: string,
      manifest?: any,
    ): string | null => {
      // Build list of possible source files to try
      const possibleFiles = [];

      if (manifest?.entry) {
        // Try to infer source file from entry point
        // dist/index.js → src/index.ts
        possibleFiles.push(
          manifest.entry.replace(/^dist\//, "src/").replace(/\.js$/, ".ts"),
          manifest.entry.replace(/^dist\//, "src/").replace(/\.js$/, ".tsx"),
        );
      }

      // Try plugin ID-based naming (e.g., QRCodePlugin.tsx from qrcode)
      const pluginName = pluginId.split(".").pop();
      if (pluginName) {
        const capitalized =
          pluginName.charAt(0).toUpperCase() + pluginName.slice(1);
        possibleFiles.push(`src/${capitalized}Plugin.tsx`);
      }

      // Generic fallbacks
      possibleFiles.push(
        "src/index.tsx",
        "src/Component.tsx",
        "src/App.tsx",
        "JSONFormatter.tsx",
        "Component.tsx",
        "index.tsx",
        "App.tsx",
      );

      for (const filename of possibleFiles) {
        const componentPath = path.join(pluginDir, filename);
        if (fs.existsSync(componentPath)) {
          return fs.readFileSync(componentPath, "utf-8");
        }
      }

      return null;
    };

    // 1. Try userData/plugins directory first (user-installed plugins)
    const userDataPluginsDir = path.join(app.getPath("userData"), "plugins");
    const userDataPluginDir = path.join(userDataPluginsDir, pluginId);

    if (fs.existsSync(userDataPluginDir)) {
      const manifestPath = path.join(userDataPluginDir, "manifest.json");
      const manifest = fs.existsSync(manifestPath)
        ? JSON.parse(fs.readFileSync(manifestPath, "utf-8"))
        : undefined;

      const source = searchComponentFile(userDataPluginDir, manifest);
      if (source) return source;
    }

    // 2. Fallback to built-in plugins directory
    const builtinPluginsDir = path.join(process.cwd(), "plugins");
    const builtinPluginDir = path.join(builtinPluginsDir, pluginId);

    if (fs.existsSync(builtinPluginDir)) {
      const manifestPath = path.join(builtinPluginDir, "manifest.json");
      const manifest = fs.existsSync(manifestPath)
        ? JSON.parse(fs.readFileSync(manifestPath, "utf-8"))
        : undefined;

      const source = searchComponentFile(builtinPluginDir, manifest);
      if (source) return source;
    }

    throw new Error(`Plugin component not found for: ${pluginId}`);
  });

  // Plugin management
  ipcMain.handle(IPCChannels.PLUGIN_INSTALL, async (_, pluginPath: string) => {
    await pluginManager.install(pluginPath);
    return { installed: true };
  });

  ipcMain.handle(IPCChannels.PLUGIN_UNINSTALL, async (_, pluginId: string) => {
    try {
      await pluginManager.uninstall(pluginId);
      return { uninstalled: true };
    } catch (error) {
      // 记录错误
      logger.error(`Failed to uninstall plugin: ${pluginId}`, { error });
      // 重新抛出错误，让渲染进程处理
      throw error;
    }
  });

  ipcMain.handle(IPCChannels.PLUGIN_EXPORT, async (event, pluginId: string) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) {
      throw new Error("Could not find window");
    }

    // 选择保存位置
    const result = await dialog.showSaveDialog(win, {
      defaultPath: `${pluginId}.zip`,
      filters: [
        { name: "Plugin Files", extensions: ["zip"] },
        { name: "All Files", extensions: ["*"] },
      ],
      title: "导出插件",
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
      throw new Error("Could not find window");
    }

    // 选择插件文件
    const result = await dialog.showOpenDialog(win, {
      filters: [
        { name: "Plugin Files", extensions: ["zip"] },
        { name: "All Files", extensions: ["*"] },
      ],
      title: "导入插件",
      properties: ["openFile"],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return { imported: false, canceled: true };
    }

    const pluginPath = result.filePaths[0]!;
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
  ipcMain.handle(
    IPCChannels.PLUGIN_MESSAGE,
    async (_, pluginId: string, channel: string, data: any) => {
      const plugin = pluginManager.get(pluginId);
      if (plugin?.handleMessage) {
        return await plugin.handleMessage(channel, data);
      }
      return null;
    },
  );

  // ==================== Database Handlers ====================

  // Clock settings
  ipcMain.handle(IPCChannels.DB_GET_CLOCK_SETTINGS, async () => {
    return await db.getClockSettings();
  });

  ipcMain.handle(IPCChannels.DB_UPDATE_CLOCK_SETTINGS, async (_, settings) => {
    await db.updateClockSettings(settings);
    return { updated: true };
  });

  // Stats
  ipcMain.handle(
    IPCChannels.DB_GET_STATS,
    async (_, startDate: Date, endDate: Date) => {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const keyboardStats = await db.getKeyboardStats(start, end);
      const mouseClickStats = await db.getMouseClickStats(start, end);
      const mouseMoveStats = await db.getMouseMoveStats(start, end);

      // Combine stats by timestamp
      const combinedStats: Map<string, any> = new Map();

      keyboardStats.forEach((stat: any) => {
        const timestamp = stat.timestamp.substring(0, 13);
        combinedStats.set(timestamp, {
          date: stat.timestamp,
          keyboard_count: stat.count,
          mouse_click_count: 0,
          mouse_move_distance: 0,
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
            mouse_move_distance: 0,
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
            mouse_move_distance: stat.distance,
          });
        }
      });

      return Array.from(combinedStats.values()).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
    },
  );

  // Save stats handlers
  ipcMain.handle(
    IPCChannels.DB_SAVE_KEYBOARD_STATS,
    async (_, count: number) => {
      await db.saveKeyboardStats(count);
      return { saved: true };
    },
  );

  ipcMain.handle(
    IPCChannels.DB_SAVE_MOUSE_CLICK_STATS,
    async (_, button: string, count: number) => {
      await db.saveMouseClickStats(button, count);
      return { saved: true };
    },
  );

  ipcMain.handle(
    IPCChannels.DB_SAVE_MOUSE_MOVE_STATS,
    async (_, distance: number) => {
      await db.saveMouseMoveStats(distance);
      return { saved: true };
    },
  );

  // Export stats
  ipcMain.handle(IPCChannels.DB_EXPORT_STATS, async (_, data) => {
    return await db.exportStats(data);
  });

  // Plugin data
  ipcMain.handle(
    IPCChannels.DB_GET_PLUGIN_DATA,
    async (_, pluginId: string) => {
      return await db.getPluginData(pluginId);
    },
  );

  ipcMain.handle(IPCChannels.DB_GET_ALL_PLUGIN_DATA, async () => {
    return await db.getAllPluginData();
  });

  ipcMain.handle(
    IPCChannels.DB_SAVE_PLUGIN_DATA,
    async (
      _,
      pluginId: string,
      pluginName: string,
      pluginVersion: string,
      dataJson: string,
    ) => {
      await db.savePluginData(pluginId, pluginName, pluginVersion, dataJson);
      return { saved: true };
    },
  );

  ipcMain.handle(
    IPCChannels.DB_DELETE_PLUGIN_DATA,
    async (_, pluginId: string) => {
      await db.deletePluginData(pluginId);
      return { deleted: true };
    },
  );

  // Get plugin list for backup
  ipcMain.handle("db:get-plugin-list", async () => {
    const plugins = pluginManager.getAll();
    return plugins.map((p) => ({
      plugin_id: p.manifest.id,
      plugin_name: p.manifest.name,
      plugin_version: p.manifest.version,
    }));
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

  ipcMain.handle(
    IPCChannels.SYSTEM_NOTIFICATION,
    async (_, { title, body }) => {
      const { Notification } = require("electron");
      new Notification({ title, body }).show();
      return { shown: true };
    },
  );

  ipcMain.handle(IPCChannels.SYSTEM_CLIPBOARD, async (_, { type, value }) => {
    const { clipboard } = require("electron");
    if (type === "write") {
      clipboard.writeText(value);
      return { written: true };
    } else if (type === "read") {
      return clipboard.readText();
    }
    return null;
  });

  ipcMain.handle(IPCChannels.SYSTEM_GET_VERSION, async () => {
    return {
      version: require("../../../package.json").version,
    };
  });

  // ==================== Log Handlers ====================

  // 单向日志写入（用于统一日志框架）
  ipcMain.on("log:write", async (_, entry) => {
    try {
      await logService.write(entry);
    } catch (error) {
      console.error("[log:write] Failed to write log:", error);
    }
  });

  // 日志查询
  ipcMain.handle("log:query", async (_, options) => {
    try {
      return logService.query(options);
    } catch (error) {
      console.error("[log:query] Failed to query logs:", error);
      return [];
    }
  });

  // 日志统计
  ipcMain.handle("log:stats", async () => {
    try {
      return logService.getStats();
    } catch (error) {
      console.error("[log:stats] Failed to get stats:", error);
      return { total: 0, byLevel: {}, byModule: {} };
    }
  });

  // 设置日志级别
  ipcMain.handle("log:setLevel", async (_, level) => {
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
      // 调试：记录日志
      logger.debug("[LOG_WRITE] Received log", { log: formattedLog });

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
          data: undefined,
        };
      }

      logger.debug("[LOG_WRITE] Writing entry", { entry });
      await logService.write(entry);

      return { success: true };
    } catch (error) {
      logger.error("[LOG_WRITE] Failed to write log", { error });
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
  ipcMain.handle("log:clean-old", async () => {
    logService.forceCleanup();
    return { cleaned: true };
  });

  // 获取日志文件大小
  ipcMain.handle("log:get-size", async () => {
    return {
      totalSize: logService.getTotalLogSize(),
      totalSizeKB: (logService.getTotalLogSize() / 1024).toFixed(2),
      totalSizeMB: (logService.getTotalLogSize() / 1024 / 1024).toFixed(2),
    };
  });

  // 获取日志文件信息
  ipcMain.handle("log:get-file-info", async () => {
    return logService.getLogFileInfo();
  });

  // ==================== 独立插件窗口 ====================

  // 打开独立插件窗口
  ipcMain.handle(
    "plugin:open-standalone",
    async (_, pluginId: string, _pluginTitle: string) => {
      try {
        const windowId = `standalone-${pluginId}`;

        // 使用 WindowManager 创建窗口（自动处理重复窗口检查）
        const windowConfig: WindowConfig = {
          width: 900,
          height: 700,
          transparent: false, // 不透明 - 插件可自己设计透明度
          frame: false, // 无边框 - 去掉原生菜单栏
          skipTaskbar: false, // 显示任务栏图标
          resizable: true,
          maximizable: true,
          minimizable: true,
          closable: true,
          alwaysOnTop: false,
        };

        await windowManager.createPluginWindow(
          windowId,
          pluginId,
          windowConfig,
        );

        return { success: true, windowId };
      } catch (error) {
        logger.error(
          `Failed to open standalone window for plugin: ${pluginId}`,
          { error },
        );
        return { success: false, error: (error as Error).message };
      }
    },
  );

  // ==================== File Storage Handlers ====================

  // Save plugin data to file
  ipcMain.handle(
    "file-storage:save",
    async (_, pluginId: string, data: any) => {
      return fileStorage.savePluginData(pluginId, data);
    },
  );

  // Load plugin data from file
  ipcMain.handle("file-storage:load", async (_, pluginId: string) => {
    return fileStorage.loadPluginData(pluginId);
  });

  // Delete plugin data file
  ipcMain.handle("file-storage:delete", async (_, pluginId: string) => {
    return fileStorage.deletePluginData(pluginId);
  });

  // Check if plugin data exists
  ipcMain.handle("file-storage:exists", async (_, pluginId: string) => {
    return fileStorage.hasPluginData(pluginId);
  });

  // Get all plugin data files
  ipcMain.handle("file-storage:list", async () => {
    return fileStorage.getAllPluginDataFiles();
  });

  // Export plugin data
  ipcMain.handle(
    "file-storage:export",
    async (_, pluginId: string, exportPath: string) => {
      return fileStorage.exportPluginData(pluginId, exportPath);
    },
  );

  // Import plugin data
  ipcMain.handle(
    "file-storage:import",
    async (_, pluginId: string, importPath: string) => {
      return fileStorage.importPluginData(pluginId, importPath);
    },
  );

  // Get data directory path
  ipcMain.handle("file-storage:get-directory", async () => {
    return fileStorage.getDataDirectory();
  });

  // Open data directory in file manager
  ipcMain.handle("file-storage:open-directory", async () => {
    return fileStorage.openDataDirectory();
  });

  // ==================== Setup Auto Backup ====================

  backupService.setupAutoBackup(24);
}
