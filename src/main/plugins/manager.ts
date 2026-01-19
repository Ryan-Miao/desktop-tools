import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { app } from 'electron';
import EventEmitter from 'eventemitter3';
import semver from 'semver';
import {
  IPlugin,
  PluginManifest,
  PluginState,
  PluginSource,
  PluginEventType,
  PluginEvent,
  PluginEventListener,
  PluginEventTypeEvent,
  IPluginManager,
  PluginContext,
  PluginStorage
} from '@shared/types/plugin';
import { PluginStore } from '../services/PluginStore';
import { createLogger } from '../../shared/logger';

const logger = createLogger('PluginManager');

/**
 * 增强的插件管理器
 *
 * 功能：
 * - 热插拔（文件监听）
 * - 离线插件导入/导出
 * - 远程插件加载
 * - 版本管理
 * - 依赖解析
 * - 权限管理
 */
export class PluginManager implements IPluginManager {
  private plugins: Map<string, IPlugin> = new Map();
  private pluginStates: Map<string, PluginState> = new Map();
  private eventEmitter = new EventEmitter();
  private store: PluginStore;
  private watcher: any = null; // chokidar.FSWatcher
  private builtinPluginsDir: string;
  private userDataPluginsDir: string;
  private initialized = false;
  private mainWindow: Electron.BrowserWindow | null = null;

  constructor(store: PluginStore, mainWindow: Electron.BrowserWindow | null = null) {
    this.store = store;
    this.mainWindow = mainWindow;
    this.builtinPluginsDir = path.join(process.cwd(), 'plugins');
    this.userDataPluginsDir = path.join(app.getPath('userData'), 'plugins');
    this.ensurePluginsDir();
  }

  /**
   * Set the main window (for broadcasting events)
   */
  setMainWindow(window: Electron.BrowserWindow | null): void {
    this.mainWindow = window;
  }

  /**
   * Broadcast event to renderer process
   */
  private broadcastEvent(channel: string, ...args: any[]): void {
    logger.debug(`Broadcasting event: ${channel}`, { args });
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, ...args);
      logger.debug(`Event sent: ${channel}`);
    } else {
      logger.error(`Cannot broadcast event: ${channel}`, {
        reason: this.mainWindow ? 'destroyed' : 'mainWindow is null'
      });
    }
  }

  private ensurePluginsDir(): void {
    if (!fs.existsSync(this.userDataPluginsDir)) {
      fs.mkdirSync(this.userDataPluginsDir, { recursive: true });
    }
  }

  // ==================== Lifecycle ====================

  async initialize(): Promise<void> {
    if (this.initialized) return;

    await this.store.initialize();

    // 加载内置插件
    await this.loadAll();

    // 启动文件监听（热插拔）
    this.startFileWatcher();

    this.initialized = true;
    logger.info('PluginManager initialized');
  }

  async destroy(): Promise<void> {
    // 停止文件监听
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
    }

    // 卸载所有插件
    await this.unloadAll();

    this.store.close();
    this.initialized = false;
  }

  // ==================== File Watcher (Hot-reload) ====================

  private startFileWatcher(): void {
    try {
      const chokidar = require('chokidar');

      this.watcher = chokidar.watch(this.userDataPluginsDir, {
        ignored: /(^|[\/\\])\../,
        persistent: true
      });

      // 监听插件目录添加
      this.watcher.on('addDir', async (pluginPath: string) => {
        const pluginId = path.basename(pluginPath);
        const manifestPath = path.join(pluginPath, 'manifest.json');

        // 等待 manifest 文件创建完成
        const maxWait = 5000; // 最多等待5秒
        const checkInterval = 100;

        for (let i = 0; i < maxWait / checkInterval; i++) {
          if (fs.existsSync(manifestPath)) {
            try {
              await this.install(pluginPath);
              logger.info(`Plugin detected and loaded: ${pluginId}`);
              this.emit(PluginEventType.LOADED, pluginId);
              this.broadcastEvent('plugin:loaded', pluginId);
            } catch (error) {
              logger.error(`Failed to auto-load plugin: ${pluginId}`, { error });
              this.emit(PluginEventType.ERROR, pluginId, error instanceof Error ? error : undefined);
              this.broadcastEvent('plugin:error', pluginId, error);
            }
            break;
          }
          await new Promise(resolve => setTimeout(resolve, checkInterval));
        }
      });

      // 监听插件目录删除
      this.watcher.on('unlinkDir', async (pluginPath: string) => {
        const pluginId = path.basename(pluginPath);

        logger.info(`Plugin directory deleted: ${pluginId}`);

        // 尝试通过 manifest.id 匹配并清理插件
        let found = false;

        for (const [id, plugin] of this.plugins.entries()) {
          if (plugin.manifest.id === pluginId) {
            await this.unload(id);
            // 清理数据库状态（目录已被删除，不需要再删）
            await this.store.deleteState(id);
            this.pluginStates.delete(id);
            logger.info(`Plugin cleaned up after directory deletion: ${pluginId}`);
            this.emit(PluginEventType.UNLOADED, id);
            this.broadcastEvent('plugin:unloaded', id);
            found = true;
            break;
          }
        }

        // 即使未加载，也清理数据库状态
        if (!found) {
          await this.store.deleteState(pluginId);
          this.pluginStates.delete(pluginId);
          logger.info(`Plugin state cleaned (by dir name): ${pluginId}`);
        }
      });

      // 监听 manifest 文件修改
      this.watcher.on('change', async (manifestPath: string) => {
        if (manifestPath.endsWith('manifest.json')) {
          const pluginDir = path.dirname(manifestPath);
          const pluginId = path.basename(pluginDir);

          // 查找已加载的插件
          for (const [id, plugin] of this.plugins.entries()) {
            if (plugin.manifest.id === pluginId) {
              try {
                await this.reload(id);
                logger.info(`Plugin reloaded: ${pluginId}`);
                this.emit(PluginEventType.UPDATED, pluginId);
                this.broadcastEvent('plugin:updated', pluginId);
              } catch (error) {
                logger.error(`Failed to reload plugin: ${pluginId}`, { error });
                this.emit(PluginEventType.ERROR, pluginId, error instanceof Error ? error : undefined);
                this.broadcastEvent('plugin:error', pluginId, error);
              }
              break;
            }
          }
        }
      });

      // 监听文件删除（例如 manifest.json 被删除）
      this.watcher.on('unlink', async (filePath: string) => {
        if (filePath.endsWith('manifest.json')) {
          const pluginDir = path.dirname(filePath);
          const pluginId = path.basename(pluginDir);

          logger.info(`Plugin manifest deleted: ${pluginId}`);

          // 查找并清理插件
          for (const [id, plugin] of this.plugins.entries()) {
            if (plugin.manifest.id === pluginId) {
              await this.unload(id);
              await this.store.deleteState(id);
              this.pluginStates.delete(id);
              logger.info(`Plugin cleaned up after manifest deletion: ${pluginId}`);
              this.emit(PluginEventType.UNLOADED, id);
              this.broadcastEvent('plugin:unloaded', id);
              break;
            }
          }

          // 即使未加载，也清理数据库状态
          await this.store.deleteState(pluginId);
          this.pluginStates.delete(pluginId);
        }
      });

      logger.info('File watcher started', { path: this.userDataPluginsDir });
    } catch (error) {
      logger.warn('Failed to start file watcher', { error });
      logger.warn('Hot-reload disabled');
    }
  }

  // ==================== Plugin Loading ====================

  async loadAll(): Promise<void> {
    // ✅ 验证插件状态一致性（在加载前清理孤立状态）
    await this.validatePluginStates();

    // 加载内置插件
    await this.loadBuiltinPlugins();

    // 加载用户插件
    await this.loadUserPlugins();
  }

  /**
   * 验证插件状态与文件系统的一致性
   * 清理文件不存在但数据库状态仍存在的孤立记录
   */
  private async validatePluginStates(): Promise<void> {
    try {
      const states = await this.store.getAllStates();

      for (const state of states) {
        const pluginId = state.id;

        // 检查文件是否存在
        const builtinPath = this.findPluginPath(pluginId, this.builtinPluginsDir);
        const userPath = this.findPluginPath(pluginId, this.userDataPluginsDir);

        const fileExists = (builtinPath !== null) || (userPath !== null);

        if (!fileExists) {
          // 文件不存在但状态存在，清理状态
          logger.warn(`Plugin file missing but state exists: ${pluginId}, cleaning up`);
          await this.store.deleteState(pluginId);
          this.pluginStates.delete(pluginId);
        }
      }
    } catch (error) {
      logger.error('Error validating plugin states', { error });
    }
  }

  private async loadBuiltinPlugins(): Promise<void> {
    if (!fs.existsSync(this.builtinPluginsDir)) return;

    const pluginDirs = fs.readdirSync(this.builtinPluginsDir);

    for (const dir of pluginDirs) {
      const pluginPath = path.join(this.builtinPluginsDir, dir);
      const manifestPath = path.join(pluginPath, 'manifest.json');

      if (fs.existsSync(manifestPath)) {
        try {
          await this.loadPlugin(pluginPath, PluginSource.BUILTIN);
        } catch (error) {
          logger.error(`Failed to load built-in plugin: ${dir}`, { error });
        }
      }
    }
  }

  private async loadUserPlugins(): Promise<void> {
    if (!fs.existsSync(this.userDataPluginsDir)) return;

    const pluginDirs = fs.readdirSync(this.userDataPluginsDir);

    for (const dir of pluginDirs) {
      const pluginPath = path.join(this.userDataPluginsDir, dir);
      const manifestPath = path.join(pluginPath, 'manifest.json');

      if (fs.existsSync(manifestPath)) {
        try {
          await this.loadPlugin(pluginPath, PluginSource.LOCAL);
        } catch (error) {
          logger.error(`Failed to load user plugin: ${dir}`, { error });
        }
      }
    }
  }

  async load(pluginId: string): Promise<void> {
    // 检查是否已加载
    if (this.plugins.has(pluginId)) {
      logger.debug(`Plugin already loaded: ${pluginId}`);
      return;
    }

    // 尝试从内置插件加载
    const builtinPath = this.findPluginPath(pluginId, this.builtinPluginsDir);
    if (builtinPath) {
      await this.loadPlugin(builtinPath, PluginSource.BUILTIN);
      return;
    }

    // 尝试从用户插件加载
    const userPath = this.findPluginPath(pluginId, this.userDataPluginsDir);
    if (userPath) {
      await this.loadPlugin(userPath, PluginSource.LOCAL);
      return;
    }

    throw new Error(`Plugin not found: ${pluginId}`);
  }

  private findPluginPath(pluginId: string, searchDir: string): string | null {
    if (!fs.existsSync(searchDir)) return null;

    const pluginDirs = fs.readdirSync(searchDir);

    for (const dir of pluginDirs) {
      const pluginPath = path.join(searchDir, dir);
      const manifestPath = path.join(pluginPath, 'manifest.json');

      if (fs.existsSync(manifestPath)) {
        try {
          const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
          if (manifest.id === pluginId) {
            return pluginPath;
          }
        } catch {
          // 继续搜索
        }
      }
    }

    return null;
  }

  private async loadPlugin(pluginPath: string, source: PluginSource): Promise<void> {
    const manifestPath = path.join(pluginPath, 'manifest.json');
    const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
    const manifest: PluginManifest = JSON.parse(manifestContent);

    // 验证 manifest
    this.validateManifest(manifest);

    // 检查是否已加载
    if (this.plugins.has(manifest.id)) {
      logger.debug(`Plugin already loaded: ${manifest.id}`);
      return;
    }

    // 检查依赖
    await this.resolveDependencies(manifest);

    // 创建插件存储
    const storage: PluginStorage = {
      get: async (key: string) => {
        const state = await this.store.getState(manifest.id);
        return state?.customData?.[key];
      },
      set: async (key: string, value: any) => {
        const state = await this.store.getState(manifest.id) || {
          id: manifest.id,
          enabled: true,
          installed: true,
          source
        };
        state.customData = state.customData || {};
        state.customData[key] = value;
        await this.store.saveState(manifest.id, state);
      },
      delete: async (key: string) => {
        const state = await this.store.getState(manifest.id);
        if (state?.customData) {
          delete state.customData[key];
          await this.store.saveState(manifest.id, state);
        }
      },
      clear: async () => {
        const state = await this.store.getState(manifest.id);
        if (state) {
          state.customData = {};
          await this.store.saveState(manifest.id, state);
        }
      },
      getAll: async () => {
        const state = await this.store.getState(manifest.id);
        return state?.customData || {};
      }
    };

    // 创建插件上下文
    const context: PluginContext = {
      app,
      mainWindow: null, // 将在 main/index 中设置
      db: null, // 将在 main/index 中设置
      ipc: null, // 将在 main/index 中设置
      logger: {
        info: (...args: any[]) => logger.info(`[${manifest.name}]`, ...args),
        error: (...args: any[]) => logger.error(`[${manifest.name}]`, ...args),
        warn: (...args: any[]) => logger.warn(`[${manifest.name}]`, ...args)
      },
      storage
    };

    // 动态加载插件入口
    // Try loading from dist/plugins first (built by Vite), then fallback to source plugins/
    const pluginName = path.basename(pluginPath);
    const distEntryPath = path.join(process.cwd(), 'dist', 'plugins', pluginName, 'index.js');

    let entryPath = distEntryPath;
    let pluginInstance: IPlugin;

    // Only load entry if manifest.entry is specified (for npm plugins)
    if (manifest.entry) {
      const sourceEntryPath = path.join(pluginPath, manifest.entry);
      if (!fs.existsSync(distEntryPath)) {
        entryPath = sourceEntryPath;
      }
    }

    try {
      // Use dynamic import for ES modules (only if entry path exists)
      if (manifest.entry && fs.existsSync(entryPath)) {
        const pluginModule = await import(entryPath);
        const PluginConstructor = pluginModule.default || pluginModule;

        // 创建插件实例
        if (typeof PluginConstructor === 'function') {
          pluginInstance = new PluginConstructor();
        } else if (typeof PluginConstructor === 'object') {
          // 如果是对象，直接使用
          pluginInstance = PluginConstructor;
        } else {
          throw new Error('Invalid plugin export');
        }
      } else {
        // Built-in plugin without entry - create empty instance
        pluginInstance = {
          onActivate: async () => {},
          onDeactivate: async () => {}
        } as IPlugin;
      }

      // 设置 manifest
      if (!pluginInstance.manifest) {
        pluginInstance.manifest = manifest;
      }

      // 调用 onLoad
      if (pluginInstance.onLoad) {
        await pluginInstance.onLoad(context);
      }
    } catch (error) {
      logger.error(`Failed to load plugin entry: ${manifest.id}`, { error });
      // 创建最小插件实例
      pluginInstance = {
        manifest,
        onLoad: async () => {},
        onUnload: async () => {}
      };
    }

    // 添加到插件 map
    this.plugins.set(manifest.id, pluginInstance);

    // 创建或更新插件状态
    let state = await this.store.getState(manifest.id);
    if (!state) {
      state = {
        id: manifest.id,
        enabled: true,
        installed: true,
        source,
        installedAt: Date.now(),
        customData: {}
      };
    }
    this.pluginStates.set(manifest.id, state);
    await this.store.saveState(manifest.id, state);

    logger.info(`Plugin loaded: ${manifest.name} (${manifest.id})`);
  }

  async unload(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return;

    // 调用 onUnload
    if (plugin.onUnload) {
      try {
        await plugin.onUnload();
      } catch (error) {
        logger.error(`Error in plugin onUnload: ${pluginId}`, { error });
      }
    }

    // 从 map 删除
    this.plugins.delete(pluginId);

    logger.info(`Plugin unloaded: ${pluginId}`);
  }

  async unloadAll(): Promise<void> {
    const pluginIds = Array.from(this.plugins.keys());
    for (const pluginId of pluginIds) {
      await this.unload(pluginId);
    }
  }

  async reload(pluginId: string): Promise<void> {
    await this.unload(pluginId);
    await this.load(pluginId);
    this.emit(PluginEventType.UPDATED, pluginId);
  }

  // ==================== Plugin Activation ====================

  async activate(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin not loaded: ${pluginId}`);
    }

    const state = this.pluginStates.get(pluginId);
    if (state && !state.enabled) {
      logger.info(`Plugin is disabled: ${pluginId}`);
      return;
    }

    // 调用 onActivate
    if (plugin.onActivate) {
      try {
        await plugin.onActivate();
      } catch (error) {
        logger.error(`Error in plugin onActivate: ${pluginId}`, { error });
      }
    }

    // 更新最后使用时间
    if (state) {
      state.lastUsed = Date.now();
      await this.store.saveState(pluginId, state);
    }

    this.emit(PluginEventType.ACTIVATED, pluginId);
  }

  async deactivate(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return;

    // 调用 onDeactivate
    if (plugin.onDeactivate) {
      try {
        await plugin.onDeactivate();
      } catch (error) {
        logger.error(`Error in plugin onDeactivate: ${pluginId}`, { error });
      }
    }

    this.emit(PluginEventType.DEACTIVATED, pluginId);
  }

  // ==================== Plugin Query ====================

  get(pluginId: string): IPlugin | undefined {
    return this.plugins.get(pluginId);
  }

  getAll(): IPlugin[] {
    return Array.from(this.plugins.values());
  }

  async getState(pluginId: string): Promise<PluginState | undefined> {
    return this.store.getState(pluginId);
  }

  async getAllStates(): Promise<PluginState[]> {
    return this.store.getAllStates();
  }

  // ==================== Plugin Management ====================

  async install(pluginPath: string): Promise<void> {
    // 解析插件路径（可能是 .zip 文件）
    let installDir: string;

    if (pluginPath.endsWith('.zip')) {
      // 解压 ZIP 文件
      installDir = await this.extractPlugin(pluginPath);
    } else {
      // 直接使用目录
      installDir = pluginPath;
    }

    // 读取 manifest
    const manifestPath = path.join(installDir, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
      throw new Error('manifest.json not found in plugin');
    }

    const manifest: PluginManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

    // 验证 manifest
    this.validateManifest(manifest);

    // 检查是否已安装（同时检查状态和文件是否存在）
    const existingState = await this.store.getState(manifest.id);
    if (existingState && existingState.installed) {
      // 检查插件文件是否实际存在
      const existingPath = this.findPluginPath(manifest.id, this.userDataPluginsDir);
      if (existingPath && fs.existsSync(existingPath)) {
        logger.info(`Plugin already installed: ${manifest.id}`);
        return;
      }
      // 文件不存在但状态存在，清除旧状态并重新安装
      logger.info(`Plugin state exists but files missing, reinstalling: ${manifest.id}`);
    }

    // 如果是 ZIP 安装，复制到用户插件目录
    if (pluginPath.endsWith('.zip')) {
      const targetDir = path.join(this.userDataPluginsDir, manifest.id);
      if (fs.existsSync(targetDir)) {
        fs.rmSync(targetDir, { recursive: true });
      }
      fs.cpSync(installDir, targetDir, { recursive: true });
      installDir = targetDir;
    }

    // 如果插件已加载，先卸载
    if (this.plugins.has(manifest.id)) {
      logger.info(`Unloading existing plugin before reinstall: ${manifest.id}`);
      await this.unload(manifest.id);
    }

    // 加载插件
    await this.loadPlugin(installDir, PluginSource.LOCAL);

    logger.info(`Plugin installed: ${manifest.name}`, { pluginId: manifest.id });

    this.emit(PluginEventType.LOADED, manifest.id);
    this.broadcastEvent('plugin:loaded', manifest.id);
    this.broadcastEvent('plugin:installed', manifest.id);

    logger.debug(`Plugin installation events broadcast complete`, { pluginId: manifest.id });
  }

  private async extractPlugin(zipPath: string): Promise<string> {
    const tempDir = path.join(app.getPath('temp'), `plugin-extract-${Date.now()}`);

    // 读取 ZIP 文件
    const zip = new JSZip();
    const content = await fs.promises.readFile(zipPath);
    await zip.loadAsync(content);

    // 解压到临时目录
    const entries = Object.keys(zip.files);
    for (const relativePath of entries) {
      const entry = zip.files[relativePath];
      const entryPath = path.join(tempDir, relativePath);
      const entryDir = path.dirname(entryPath);

      // 创建目录
      if (!fs.existsSync(entryDir)) {
        fs.mkdirSync(entryDir, { recursive: true });
      }

      // 写入文件
      if (!entry.dir) {
        const buffer = await entry.async('arraybuffer');
        fs.writeFileSync(entryPath, Buffer.from(buffer));
      }
    }

    return tempDir;
  }

  async uninstall(pluginId: string): Promise<void> {
    logger.info(`Starting uninstall for plugin: ${pluginId}`);

    try {
      // 卸载插件
      await this.unload(pluginId);

      // 删除插件目录
      const pluginPath = this.findPluginPath(pluginId, this.userDataPluginsDir);
      if (pluginPath && fs.existsSync(pluginPath)) {
        fs.rmSync(pluginPath, { recursive: true });
        logger.info(`Plugin directory removed: ${pluginId}`);
      }

      // 删除状态
      await this.store.deleteState(pluginId);
      this.pluginStates.delete(pluginId);

      logger.info(`Plugin uninstalled: ${pluginId}`);

      this.emit(PluginEventType.UNLOADED, pluginId);
      this.broadcastEvent('plugin:unloaded', pluginId);
      this.broadcastEvent('plugin:uninstalled', pluginId);

      logger.debug(`Plugin uninstallation events broadcast complete`, { pluginId });
    } catch (error) {
      // 捕获并记录异常
      logger.error(`Error during uninstall of ${pluginId}`, { error });
      throw error;  // 重新抛出，让上层处理
    }
  }

  async export(pluginId: string, outputPath: string): Promise<void> {
    const pluginPath = this.findPluginPath(pluginId, this.builtinPluginsDir) ||
                      this.findPluginPath(pluginId, this.userDataPluginsDir);

    if (!pluginPath) {
      throw new Error(`Plugin not found: ${pluginId}`);
    }

    // 创建 ZIP 文件
    const zip = new JSZip();

    // 检查是否有编译后的版本
    const pluginName = path.basename(pluginPath);
    const distPluginPath = path.join(process.cwd(), 'dist', 'plugins', pluginName);
    const hasCompiledVersion = fs.existsSync(distPluginPath);

    // 添加插件文件
    const addFiles = (dir: string, base: string = '') => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const relativePath = path.join(base, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          addFiles(filePath, relativePath);
        } else {
          // 跳过无用的文件
          if (file.includes('node_modules') || file.includes('.test.') || file.includes('.spec.')) {
            return;
          }

          // 使用原始文件
          const content = fs.readFileSync(filePath);
          zip.file(relativePath, content);
        }
      }
    };

    // 读取 manifest.json（不修改 entry）
    const manifestPath = path.join(pluginPath, 'manifest.json');
    let manifest: any = {};
    if (fs.existsSync(manifestPath)) {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      // 保持原始 entry，不修改
    }

    // 添加 manifest
    zip.file('manifest.json', JSON.stringify(manifest, null, 2));

    // 添加其他文件
    addFiles(pluginPath);

    // 生成 ZIP
    const content = await zip.generateAsync({ type: 'nodebuffer' });
    fs.writeFileSync(outputPath, content as Buffer);

    logger.info(`Plugin exported to: ${outputPath}`);
  }

  async update(pluginId: string): Promise<void> {
    // TODO: 实现从远程更新插件
    logger.info(`Plugin update requested: ${pluginId}`);
  }

  // ==================== Remote Plugin ====================

  async fetchFromRemote(url: string): Promise<void> {
    // TODO: 实现从远程加载插件
    logger.info(`Remote plugin fetch requested: ${url}`);
  }

  async checkUpdates(): Promise<void> {
    // TODO: 实现检查插件更新
    logger.info('Plugin updates check requested');
  }

  // ==================== Events ====================

  on(event: PluginEventTypeEvent, listener: PluginEventListener): void {
    this.eventEmitter.on(event, listener);
  }

  off(event: PluginEventTypeEvent, listener: PluginEventListener): void {
    this.eventEmitter.off(event, listener);
  }

  private emit(type: PluginEventType, pluginId: string, error?: Error): void {
    const event: PluginEvent = {
      type,
      pluginId,
      timestamp: Date.now(),
      error
    };
    this.eventEmitter.emit(type, event);
  }

  // ==================== Validation ====================

  private validateManifest(manifest: PluginManifest): void {
    const required = ['id', 'name', 'version', 'description', 'author', 'icon'];
    for (const field of required) {
      if (!(field in manifest)) {
        throw new Error(`Missing required field in manifest: ${field}`);
      }
    }

    // 验证 ID 格式（反向域名）
    if (!/^[a-z0-9.-]+\.[a-z0-9.-]+$/i.test(manifest.id)) {
      throw new Error(`Invalid plugin ID format: ${manifest.id}`);
    }

    // 验证版本格式（语义化版本）
    if (!semver.valid(manifest.version)) {
      throw new Error(`Invalid plugin version: ${manifest.version}`);
    }
  }

  private async resolveDependencies(manifest: PluginManifest): Promise<void> {
    if (!manifest.dependencies || manifest.dependencies.length === 0) {
      return;
    }

    for (const dep of manifest.dependencies) {
      // 检查依赖是否已安装
      const depState = await this.store.getState(dep.id);
      if (!depState || !depState.installed) {
        if (dep.optional) {
          logger.warn(`Optional dependency not installed: ${dep.id}`);
        } else {
          throw new Error(`Required dependency not installed: ${dep.id}`);
        }
      }

      // 检查版本
      if (dep.version && depState?.remoteVersion) {
        if (!semver.satisfies(depState.remoteVersion, dep.version)) {
          const message = `Dependency version mismatch: ${dep.id} (required: ${dep.version}, installed: ${depState.remoteVersion})`;
          if (dep.optional) {
            logger.warn(message);
          } else {
            throw new Error(message);
          }
        }
      }
    }
  }
}
