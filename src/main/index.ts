import { app, BrowserWindow } from 'electron';
import { setupIPCHandlers } from './ipc/handlers';
import { DatabaseService } from './database';
import { PluginManager } from './plugins/manager';
import { WindowManager } from './windows/manager';
import { PluginStore } from './services/PluginStore';
import { logger } from '../shared/logger';
import logService from './services/LogService';

export default class MainProcess {
  private database: DatabaseService;
  private pluginManager: PluginManager;
  private windowManager: WindowManager;
  private pluginStore: PluginStore;
  private mainWindow: BrowserWindow | null = null;

  constructor() {
    this.database = new DatabaseService();
    this.pluginStore = new PluginStore({ dbName: 'plugins.db', tableName: 'states' });
    this.pluginManager = new PluginManager(this.pluginStore);
    this.windowManager = new WindowManager(this.pluginStore);
  }

  async initialize() {
    // Initialize database
    await this.database.initialize();
    await this.pluginStore.initialize();

    // 注入 LogService 到 logger（使主进程日志能写入文件）
    logger.setMainProcessLogService(logService);

    // Create main window first (needed for PluginManager event broadcasting)
    this.mainWindow = await this.windowManager.createMainWindow();

    // Set main window in plugin manager for event broadcasting
    this.pluginManager.setMainWindow(this.mainWindow);

    // Load plugins
    await this.pluginManager.loadAll();

    // Setup IPC handlers
    setupIPCHandlers(this);

    // Setup app lifecycle handlers
    this.setupAppHandlers();
  }

  private setupAppHandlers() {
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', async () => {
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
  try {
    const mainProcess = new MainProcess();
    await mainProcess.initialize();
  } catch (error) {
    logger.error('Failed to initialize application', { error });
    app.quit();
  }
});

// Cleanup on quit
app.on('before-quit', () => {
  const windows = BrowserWindow.getAllWindows();
  windows.forEach(window => {
    if (!window.isDestroyed()) {
      window.webContents.send('app:before-quit');
    }
  });
});
