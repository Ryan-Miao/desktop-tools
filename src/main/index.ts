import { app, BrowserWindow } from 'electron';
import { setupIPCHandlers } from './ipc/handlers';
import { DatabaseService } from './database';
import { PluginManager } from './plugins/manager';
import { WindowManager } from './windows/manager';
import { InputMonitor } from './services/InputMonitor';
import { PluginStore } from './services/PluginStore';

export default class MainProcess {
  private database: DatabaseService;
  private pluginManager: PluginManager;
  private windowManager: WindowManager;
  private inputMonitor: InputMonitor;
  private pluginStore: PluginStore;
  private mainWindow: BrowserWindow | null = null;

  constructor() {
    this.database = new DatabaseService();
    this.pluginStore = new PluginStore({ dbName: 'plugins.db', tableName: 'states' });
    this.pluginManager = new PluginManager(this.pluginStore);
    this.windowManager = new WindowManager(this.pluginStore);
    this.inputMonitor = new InputMonitor(this.database);
  }

  async initialize() {
    // Initialize database
    await this.database.initialize();
    await this.pluginStore.initialize();

    // Load plugins
    await this.pluginManager.loadAll();

    // Create main window
    this.mainWindow = await this.windowManager.createMainWindow();

    // Setup IPC handlers
    setupIPCHandlers(this);

    // Setup app lifecycle handlers
    this.setupAppHandlers();

    // 启动输入监听器
    this.inputMonitor.start();

    // 设置统计数据更新回调，发送到渲染进程
    this.inputMonitor.onStatsUpdate((stats) => {
      // 将统计数据发送到所有窗口
      BrowserWindow.getAllWindows().forEach(window => {
        if (!window.isDestroyed()) {
          window.webContents.send('input-stats:update', stats);
        }
      });
    });
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

  getInputMonitor() {
    return this.inputMonitor;
  }
}

// Initialize app when ready
app.whenReady().then(async () => {
  try {
    const mainProcess = new MainProcess();
    await mainProcess.initialize();
  } catch (error) {
    console.error('Failed to initialize application:', error);
    app.quit();
  }
});

// Cleanup on quit
app.on('before-quit', () => {
  // Ensure InputMonitor is stopped and database is closed before quitting
  const windows = BrowserWindow.getAllWindows();
  windows.forEach(window => {
    if (!window.isDestroyed()) {
      window.webContents.send('app:before-quit');
    }
  });
});
