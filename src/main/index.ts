import { app, BrowserWindow } from "electron";
import { setupIPCHandlers } from "./ipc/handlers";
import { DatabaseService } from "./database";
import { PluginManager } from "./plugins/manager";
import { WindowManager } from "./windows/manager";
import { PluginStore } from "./services/PluginStore";
import { logger } from "../shared/logger";
import logService from "./services/LogService";
import { GlobalErrorHandler } from "./errorHandler";

export default class MainProcess {
  private database: DatabaseService;
  private pluginManager: PluginManager;
  private windowManager: WindowManager;
  private pluginStore: PluginStore;
  private mainWindow: BrowserWindow | null = null;

  constructor() {
    // 注入 LogService 到 logger（必须在最开始，确保所有日志都能写入文件）
    logger.setMainProcessLogService(logService);

    this.database = new DatabaseService();
    this.pluginStore = new PluginStore({
      dbName: "plugins.db",
      tableName: "states",
    });
    this.pluginManager = new PluginManager(this.pluginStore);
    this.windowManager = new WindowManager(this.pluginStore);
  }

  async initialize() {
    // Create main window first (shows UI immediately)
    this.mainWindow = await this.windowManager.createMainWindow();

    // Initialize database in parallel with window creation
    await this.database.initialize();
    await this.pluginStore.initialize();

    // Set main window in plugin manager for event broadcasting
    this.pluginManager.setMainWindow(this.mainWindow);

    // Setup IPC handlers
    setupIPCHandlers(this);

    // Setup app lifecycle handlers
    this.setupAppHandlers();

    // Load plugins asynchronously after window is shown (non-blocking)
    // This allows the UI to appear immediately while plugins load in background
    this.pluginManager.loadAll().catch((error) => {
      logger.error("Failed to load plugins", { error });
    });
  }

  private setupAppHandlers() {
    app.on("window-all-closed", () => {
      if (process.platform !== "darwin") {
        app.quit();
      }
    });

    app.on("activate", async () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.mainWindow = await this.windowManager.createMainWindow();
      }
    });
  }

  getDatabase() {
    return this.database;
  }

  getPluginManager() {
    return this.pluginManager;
  }

  getWindowManager() {
    return this.windowManager;
  }

  getMainWindow() {
    return this.mainWindow;
  }
}

// Initialize app when ready
app.whenReady().then(async () => {
  // Setup global error handlers first
  GlobalErrorHandler.setup();

  try {
    const mainProcess = new MainProcess();
    await mainProcess.initialize();
  } catch (error) {
    logger.error("Failed to initialize application", { error });
    app.quit();
  }
});

// Cleanup on quit
app.on("before-quit", () => {
  const windows = BrowserWindow.getAllWindows();
  windows.forEach((window) => {
    if (!window.isDestroyed()) {
      window.webContents.send("app:before-quit");
    }
  });
});
