/**
 * 本地存储服务
 * 提供数据持久化功能
 */

import { createLogger } from '../../shared/logger';

const logger = createLogger('StorageService');

export interface PluginState {
  id: string;
  enabled: boolean;
  favorite: boolean;
  order: number;
  lastUsed: number;
  customData?: Record<string, any>;
}

export interface AppSettings {
  themeId: string;
  language: 'zh-CN' | 'en-US';
  hardwareAcceleration: boolean;
  animations: boolean;
  autoSave: boolean;
  debugMode: boolean;
  panelOpacity: number; // 0-100, default 85
  layoutMode: 'grid-icons' | 'grid' | 'list'; // 布局模式：图标网格、普通网格、列表
  gridColumns: number; // 网格布局每列数量（3-10）
  showFavoritesOnly: boolean; // 是否只显示常用插件
  logDirectory?: string; // 日志文件目录（仅 Electron）
}

export interface StorageData {
  appSettings: AppSettings;
  plugins: PluginState[];
  colorHistory: string[];
  base64History: string[];
}

class StorageService {
  private readonly STORAGE_KEY = 'desktop-tool-data';
  private readonly VERSION = '1.0.0';
  private cache: StorageData | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 1000; // 1 second cache

  // 默认数据
  private readonly defaultData: StorageData = {
    appSettings: {
      themeId: 'light-blue',
      language: 'zh-CN',
      hardwareAcceleration: true,
      animations: true,
      autoSave: true,
      debugMode: false,
      panelOpacity: 85,
      layoutMode: 'grid',
      gridColumns: 6,
      showFavoritesOnly: false
    },
    plugins: [],
    colorHistory: [],
    base64History: []
  };

  /**
   * 获取所有存储的数据（带缓存）
   */
  getData(): StorageData {
    const now = Date.now();

    // Return cached data if still valid
    if (this.cache && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      return this.cache;
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // 合并默认数据，确保新字段存在
        this.cache = {
          ...this.defaultData,
          ...parsed,
          appSettings: {
            ...this.defaultData.appSettings,
            ...parsed.appSettings
          }
        };
        this.cacheTimestamp = now;
        return this.cache!;
      }
    } catch (error) {
      logger.error('Error reading from localStorage', { error });
    }

    this.cache = { ...this.defaultData };
    this.cacheTimestamp = now;
    return this.cache;
  }

  /**
   * 保存所有数据
   */
  saveData(data: StorageData): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      // Update cache
      this.cache = data;
      this.cacheTimestamp = Date.now();
    } catch (error) {
      logger.error('Error saving to localStorage', { error });
    }
  }

  /**
   * 获取应用设置
   */
  getAppSettings(): AppSettings {
    return this.getData().appSettings;
  }

  /**
   * 更新应用设置
   */
  updateAppSettings(settings: Partial<AppSettings>): void {
    const data = this.getData();
    data.appSettings = { ...data.appSettings, ...settings };
    this.saveData(data);
  }

  /**
   * 获取所有插件状态
   */
  getPluginsState(): PluginState[] {
    return this.getData().plugins;
  }

  /**
   * 获取单个插件状态
   */
  getPluginState(pluginId: string): PluginState | undefined {
    return this.getData().plugins.find(p => p.id === pluginId);
  }

  /**
   * 更新插件状态
   */
  updatePluginState(pluginId: string, updates: Partial<PluginState>): void {
    const data = this.getData();
    const index = data.plugins.findIndex(p => p.id === pluginId);

    if (index >= 0) {
      data.plugins[index] = { ...data.plugins[index], ...updates };
    } else {
      // 新插件，添加默认状态
      data.plugins.push({
        id: pluginId,
        enabled: true,
        favorite: false,
        order: data.plugins.length,
        lastUsed: Date.now(),
        ...updates
      });
    }

    this.saveData(data);
  }

  /**
   * 删除插件状态
   */
  deletePluginState(pluginId: string): void {
    const data = this.getData();
    data.plugins = data.plugins.filter(p => p.id !== pluginId);
    this.saveData(data);
  }

  /**
   * 更新插件使用时间
   */
  updatePluginLastUsed(pluginId: string): void {
    this.updatePluginState(pluginId, { lastUsed: Date.now() });
  }

  /**
   * 切换插件启用状态
   */
  togglePluginEnabled(pluginId: string): boolean {
    const plugin = this.getPluginState(pluginId);
    const newState = !(plugin?.enabled ?? false);
    this.updatePluginState(pluginId, { enabled: newState });
    return newState;
  }

  /**
   * 切换插件收藏状态
   */
  togglePluginFavorite(pluginId: string): boolean {
    const plugin = this.getPluginState(pluginId);
    const newState = !(plugin?.favorite ?? false);
    this.updatePluginState(pluginId, { favorite: newState });
    return newState;
  }

  /**
   * 获取常用插件列表（已收藏的插件，按 order 排序）
   */
  getFavoritePlugins(): string[] {
    const plugins = this.getData().plugins;
    return plugins
      .filter(p => p.favorite)
      .sort((a, b) => a.order - b.order)
      .map(p => p.id);
  }

  /**
   * 获取非常用插件列表
   */
  getNonFavoritePlugins(): string[] {
    const plugins = this.getData().plugins;
    return plugins
      .filter(p => !p.favorite)
      .sort((a, b) => a.order - b.order)
      .map(p => p.id);
  }

  /**
   * 重新排序插件
   */
  reorderPlugins(pluginIds: string[]): void {
    const data = this.getData();
    const newPlugins: PluginState[] = [];

    pluginIds.forEach((id, index) => {
      const plugin = data.plugins.find(p => p.id === id);
      if (plugin) {
        newPlugins.push({ ...plugin, order: index });
      }
    });

    data.plugins = newPlugins;
    this.saveData(data);
  }

  /**
   * 添加颜色到历史记录
   */
  addColorToHistory(color: string): void {
    const data = this.getData();
    const history = data.colorHistory.filter(c => c !== color);
    history.unshift(color);
    data.colorHistory = history.slice(0, 20); // 保留最近20个
    this.saveData(data);
  }

  /**
   * 获取颜色历史
   */
  getColorHistory(): string[] {
    return this.getData().colorHistory;
  }

  /**
   * 清除颜色历史
   */
  clearColorHistory(): void {
    const data = this.getData();
    data.colorHistory = [];
    this.saveData(data);
  }

  /**
   * 导出数据
   */
  exportData(): string {
    const data = this.getData();
    return JSON.stringify(data, null, 2);
  }

  /**
   * 导入数据
   */
  importData(jsonString: string): boolean {
    try {
      const imported = JSON.parse(jsonString);

      // 验证数据格式
      if (!imported.appSettings || !Array.isArray(imported.plugins)) {
        throw new Error('Invalid data format');
      }

      this.saveData(imported);
      return true;
    } catch (error) {
      logger.error('Error importing data', { error });
      return false;
    }
  }

  /**
   * 清除所有数据
   */
  clearAllData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    // Invalidate cache
    this.cache = null;
    this.cacheTimestamp = 0;
  }

  /**
   * 获取存储大小
   */
  getStorageSize(): string {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const bytes = new Blob([data]).size;
        const kb = bytes / 1024;
        return `${kb.toFixed(2)} KB`;
      }
    } catch (error) {
      logger.error('Error calculating storage size', { error });
    }
    return '0 KB';
  }

  /**
   * 获取已安装的远程插件列表
   * 从 RemotePluginLoader 专用的 localStorage 读取
   */
  getInstalledRemotePlugins(): Array<{
    id: string;
    packageName: string;
    version: string;
    installedAt: string;
    manifest?: any;
  }> {
    try {
      const data = localStorage.getItem('installed-remote-plugins');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      logger.error('Error reading installed remote plugins', { error });
      return [];
    }
  }

  /**
   * 检查远程插件是否已安装
   */
  isRemotePluginInstalled(packageName: string): boolean {
    const installed = this.getInstalledRemotePlugins();
    return installed.some(p => p.packageName === packageName);
  }

  /**
   * 获取已安装的远程插件包名列表
   */
  getInstalledRemotePluginPackageNames(): string[] {
    return this.getInstalledRemotePlugins().map(p => p.packageName);
  }
}

// 导出单例
export const storageService = new StorageService();
