import { BrowserWindow, screen, ipcMain } from "electron";
import path from "path";
import { WindowConfig, WindowState } from "@shared/types/plugin";
import { PluginStore } from "../services/PluginStore";
import { logger } from "../../shared/logger";

/**
 * 增强的窗口管理器
 *
 * 功能：
 * - 插件窗口管理
 * - 窗口状态持久化
 * - 窗口生命周期管理
 */
export class WindowManager {
  private mainWindow: BrowserWindow | null = null;
  private pluginWindows: Map<string, BrowserWindow> = new Map();
  private store: PluginStore;

  constructor(store: PluginStore) {
    this.store = store;
    this.setupIpcHandlers();
  }

  // ==================== Main Window ====================

  async createMainWindow(): Promise<BrowserWindow> {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    // 尝试恢复窗口状态（优雅处理未初始化的情况）
    let savedState: WindowState | null = null;
    try {
      const state = await this.store.getWindowState("main");
      if (state) savedState = state;
    } catch (error) {
      // Database not initialized or other error - use default state
      logger.debug("Failed to get window state, using defaults", { error });
    }

    const windowConfig = savedState
      ? {
          width: savedState.width || Math.min(900, width - 100),
          height: savedState.height || Math.min(700, height - 100),
          x: savedState.x || (width - Math.min(900, width - 100)) / 2,
          y: savedState.y || (height - Math.min(700, height - 100)) / 2,
        }
      : {
          width: Math.min(900, width - 100),
          height: Math.min(700, height - 100),
          x: (width - Math.min(900, width - 100)) / 2,
          y: (height - Math.min(700, height - 100)) / 2,
        };

    this.mainWindow = new BrowserWindow({
      ...windowConfig,
      transparent: true,
      backgroundColor: "#00000000",
      vibrancy: "under-window",
      visualEffectState: "active",
      roundedCorners: true,
      titleBarStyle: "hiddenInset",
      frame: false,
      show: false,
      webPreferences: {
        preload: path.join(__dirname, "../preload/index.js"),
        contextIsolation: true,
        nodeIntegration: false,
        devTools: true, // 启用开发者工具
      },
    });

    // 开发者工具初始状态（由调试模式控制）
    // 不自动打开，通过设置面板的调试模式控制

    // Load app
    if (process.env.NODE_ENV === "development") {
      this.mainWindow.loadURL("http://localhost:5173");
    } else {
      this.mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
    }

    // Show window when ready
    this.mainWindow.once("ready-to-show", () => {
      this.mainWindow?.show();
    });

    // Listen for maximize/unmaximize events
    this.mainWindow.on("maximize", () => {
      this.mainWindow?.webContents.send("window:maximized");
      this.saveWindowState("main", this.mainWindow);
    });

    this.mainWindow.on("unmaximize", () => {
      this.mainWindow?.webContents.send("window:unmaximized");
      this.saveWindowState("main", this.mainWindow);
    });

    // Save state on move and resize
    this.mainWindow.on("moved", () => {
      this.saveWindowState("main", this.mainWindow);
    });

    this.mainWindow.on("resized", () => {
      this.saveWindowState("main", this.mainWindow);
    });

    // 恢复最大化状态
    if (savedState?.isMaximized) {
      this.mainWindow.maximize();
    }

    return this.mainWindow;
  }

  getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  // ==================== Plugin Window ====================

  async createPluginWindow(
    windowId: string,
    pluginId: string,
    config: WindowConfig,
    urlHash?: string,
  ): Promise<BrowserWindow> {
    // 检查是否已存在
    if (this.pluginWindows.has(windowId)) {
      const existingWindow = this.pluginWindows.get(windowId);
      if (existingWindow && !existingWindow.isDestroyed()) {
        existingWindow.focus();
        return existingWindow;
      }
      this.pluginWindows.delete(windowId);
    }

    // 尝试恢复窗口状态（优雅处理未初始化的情况）
    let savedState: WindowState | null = null;
    try {
      const state = await this.store.getWindowState(windowId);
      if (state) savedState = state;
    } catch (error) {
      // Database not initialized or other error - use default state
      logger.debug("Failed to get plugin window state, using defaults", {
        windowId,
        error,
      });
    }

    const windowConfig: WindowConfig = {
      width: savedState?.width || config.width,
      height: savedState?.height || config.height,
      x: savedState?.x || config.x,
      y: savedState?.y || config.y,
      transparent: config.transparent ?? true,
      frame: config.frame ?? false,
      alwaysOnTop: config.alwaysOnTop ?? false,
      skipTaskbar: config.skipTaskbar ?? false,
      resizable: config.resizable ?? true,
      maximizable: config.maximizable ?? true,
      minimizable: config.minimizable ?? true,
      closable: config.closable ?? true,
    };

    const pluginWindow = new BrowserWindow({
      width: windowConfig.width,
      height: windowConfig.height,
      x: windowConfig.x,
      y: windowConfig.y,
      transparent: windowConfig.transparent ?? false,
      frame: windowConfig.frame ?? false,
      alwaysOnTop: windowConfig.alwaysOnTop ?? false,
      skipTaskbar: windowConfig.skipTaskbar ?? false,
      resizable: windowConfig.resizable ?? true,
      maximizable: windowConfig.maximizable ?? true,
      minimizable: windowConfig.minimizable ?? true,
      closable: windowConfig.closable ?? true,
      vibrancy: windowConfig.vibrancy as any,
      show: false, // 先不显示，等待内容加载
      webPreferences: {
        preload: path.join(__dirname, "../preload/index.js"),
        contextIsolation: true,
        nodeIntegration: windowConfig.nodeIntegration ?? false,
        webSecurity: windowConfig.webSecurity ?? true,
        devTools: true, // 启用开发者工具
      },
    });

    // 加载插件内容
    const hash = urlHash || `#plugin-standalone/${pluginId}`;
    if (process.env.NODE_ENV === "development") {
      pluginWindow.loadURL(`http://localhost:5173${hash}`);
    } else {
      pluginWindow.loadFile(path.join(__dirname, "../renderer/index.html"), {
        hash: hash.replace("#", ""),
      });
    }

    // 等待内容加载完成后显示窗口
    pluginWindow.once("ready-to-show", () => {
      pluginWindow?.show();
    });

    // 窗口关闭时清理
    pluginWindow.on("closed", async () => {
      await this.store.deleteWindowState(windowId);
      this.pluginWindows.delete(windowId);
    });

    // 保存窗口状态
    pluginWindow.on("moved", () => {
      this.saveWindowState(windowId, pluginWindow);
    });

    pluginWindow.on("resized", () => {
      this.saveWindowState(windowId, pluginWindow);
    });

    pluginWindow.on("maximize", () => {
      this.saveWindowState(windowId, pluginWindow);
    });

    pluginWindow.on("unmaximize", () => {
      this.saveWindowState(windowId, pluginWindow);
    });

    pluginWindow.on("minimize", () => {
      this.saveWindowState(windowId, pluginWindow);
    });

    pluginWindow.on("restore", () => {
      this.saveWindowState(windowId, pluginWindow);
    });

    // 恢复最大化状态
    if (savedState?.isMaximized) {
      pluginWindow.maximize();
    }

    this.pluginWindows.set(windowId, pluginWindow);

    return pluginWindow;
  }

  closePluginWindow(windowId: string): void {
    const window = this.pluginWindows.get(windowId);
    if (window) {
      window.close();
      this.pluginWindows.delete(windowId);
    }
  }

  closeAllPluginWindows(): void {
    for (const [windowId] of this.pluginWindows.entries()) {
      this.closePluginWindow(windowId);
    }
  }

  getPluginWindow(windowId: string): BrowserWindow | undefined {
    return this.pluginWindows.get(windowId);
  }

  getAllPluginWindows(): Map<string, BrowserWindow> {
    return new Map(this.pluginWindows);
  }

  // ==================== Window State Management ====================

  private async saveWindowState(
    windowId: string,
    window: BrowserWindow | null,
  ): Promise<void> {
    if (!window || window.isDestroyed()) return;

    const bounds = window.getBounds();
    const state: WindowState = {
      id: windowId,
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      isMaximized: window.isMaximized(),
      isMinimized: window.isMinimized(),
      isFullscreen: window.isFullScreen(),
    };

    await this.store.saveWindowState(windowId, state);
  }

  private async loadWindowState(
    windowId: string,
  ): Promise<WindowState | undefined> {
    return await this.store.getWindowState(windowId);
  }

  // ==================== IPC Handlers ====================

  // ==================== Window Controls ====================

  minimize() {
    if (this.mainWindow) {
      this.mainWindow.minimize();
    }
  }

  minimizePluginWindow(windowId: string) {
    const window = this.pluginWindows.get(windowId);
    if (window) {
      window.minimize();
    }
  }

  maximize() {
    if (this.mainWindow) {
      if (this.mainWindow.isMaximized()) {
        this.mainWindow.unmaximize();
      } else {
        this.mainWindow.maximize();
      }
    }
  }

  maximizePluginWindow(windowId: string) {
    const window = this.pluginWindows.get(windowId);
    if (window) {
      if (window.isMaximized()) {
        window.unmaximize();
      } else {
        window.maximize();
      }
    }
  }

  restorePluginWindow(windowId: string) {
    const window = this.pluginWindows.get(windowId);
    if (window) {
      if (window.isMinimized()) {
        window.restore();
      }
      if (window.isMaximized()) {
        window.unmaximize();
      }
    }
  }

  close() {
    if (this.mainWindow) {
      this.mainWindow.close();
    }
  }

  setResizable(resizable: boolean) {
    if (this.mainWindow) {
      this.mainWindow.setResizable(resizable);
    }
  }

  isMaximized(): boolean {
    return this.mainWindow?.isMaximized() ?? false;
  }

  isPluginWindowMaximized(windowId: string): boolean {
    const window = this.pluginWindows.get(windowId);
    return window?.isMaximized() ?? false;
  }

  // ==================== IPC Handlers ====================

  private setupIpcHandlers(): void {
    // Plugin window operations
    ipcMain.handle(
      "plugin-window:create",
      async (_event, { windowId, pluginId, config }) => {
        await this.createPluginWindow(windowId, pluginId, config);
        return { windowCreated: true };
      },
    );

    ipcMain.handle("plugin-window:close", async (_event, windowId) => {
      this.closePluginWindow(windowId);
      return { windowClosed: true };
    });

    ipcMain.handle("plugin-window:get-state", async (_event, windowId) => {
      return await this.loadWindowState(windowId);
    });

    ipcMain.handle(
      "plugin-window:set-state",
      async (_event, { windowId, state }) => {
        await this.store.saveWindowState(windowId, state);
        return { stateSaved: true };
      },
    );

    // Main window operations
    ipcMain.handle("window:minimize", () => {
      this.minimize();
      return { minimized: true };
    });

    ipcMain.handle("window:maximize", () => {
      this.maximize();
      return { maximized: this.isMaximized() };
    });

    ipcMain.handle("window:restore", () => {
      if (this.mainWindow) {
        this.mainWindow.restore();
      }
      return { restored: true };
    });

    ipcMain.handle("window:close", () => {
      this.close();
      return { closed: true };
    });

    // Standalone plugin window operations
    ipcMain.handle(
      "standalone-window:minimize",
      async (_event, windowId: string) => {
        this.minimizePluginWindow(windowId);
        return { minimized: true };
      },
    );

    ipcMain.handle(
      "standalone-window:maximize",
      async (_event, windowId: string) => {
        this.maximizePluginWindow(windowId);
        return { maximized: this.isPluginWindowMaximized(windowId) };
      },
    );

    ipcMain.handle(
      "standalone-window:close",
      async (_event, windowId: string) => {
        this.closePluginWindow(windowId);
        return { closed: true };
      },
    );

    ipcMain.handle(
      "standalone-window:is-maximized",
      async (_event, windowId: string) => {
        return this.isPluginWindowMaximized(windowId);
      },
    );

    ipcMain.handle("window:toggle-devtools", () => {
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        if (this.mainWindow.webContents.isDevToolsOpened()) {
          this.mainWindow.webContents.closeDevTools();
        } else {
          this.mainWindow.webContents.openDevTools();
        }
        return {
          devToolsOpened: this.mainWindow.webContents.isDevToolsOpened(),
        };
      }
      return { devToolsOpened: false };
    });

    ipcMain.handle("window:is-maximized", () => {
      return this.isMaximized();
    });

    ipcMain.handle("window:start-drag", () => {
      if (this.mainWindow) {
        // 拖拽由渲染进程处理
        this.mainWindow.webContents.send("window:start-drag");
      }
    });
  }

  // ==================== Cleanup ====================

  destroy(): void {
    // 关闭所有插件窗口
    this.closeAllPluginWindows();

    // 移除所有 IPC 处理器
    ipcMain.removeHandler("plugin-window:create");
    ipcMain.removeHandler("plugin-window:close");
    ipcMain.removeHandler("plugin-window:get-state");
    ipcMain.removeHandler("plugin-window:set-state");
    ipcMain.removeHandler("window:minimize");
    ipcMain.removeHandler("window:maximize");
    ipcMain.removeHandler("window:restore");
    ipcMain.removeHandler("window:close");
    ipcMain.removeHandler("window:is-maximized");
    ipcMain.removeHandler("window:start-drag");
    ipcMain.removeHandler("standalone-window:minimize");
    ipcMain.removeHandler("standalone-window:maximize");
    ipcMain.removeHandler("standalone-window:close");
    ipcMain.removeHandler("standalone-window:is-maximized");
  }
}
