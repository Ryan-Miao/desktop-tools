/**
 * 远程插件加载器
 * 从 CDN (esm.sh, jsDelivr, unpkg) 动态加载 npm 插件包
 */

import { createLogger } from '../../shared/logger';
import { pluginRegistry } from './PluginRegistry';
import { npmService } from './NpmService';
import {
  CDN_CONFIGS,
  type CDNProvider,
  type DEFAULT_CDN,
  type InstalledRemotePlugin,
  type RemotePluginLoadResult,
  type NpmPackageInfo
} from '../../shared/types/npm';

const logger = createLogger('RemotePluginLoader');

/**
 * 远程插件加载器类
 */
export class RemotePluginLoader {
  private cache: Map<string, any>;
  private cdnProvider: CDNProvider;
  private storageKey = 'installed-remote-plugins';

  constructor(cdnProvider: CDNProvider = 'esm.sh') {
    this.cache = new Map();
    this.cdnProvider = cdnProvider;
  }

  /**
   * 从 npm/CDN 加载插件
   * @param packageName npm 包名
   * @param version 版本（可选）
   * @returns 加载的插件模块
   */
  async loadFromNPM(
    packageName: string,
    version?: string
  ): Promise<RemotePluginLoadResult> {
    try {
      logger.info(`Loading plugin from npm: ${packageName}@${version || 'latest'}`);

      // 1. 获取包信息
      const packageInfo = await npmService.getPackageInfo(packageName);

      // 2. 验证是否是有效的桌面工具插件
      const isValid = await npmService.validatePlugin(packageName);
      if (!isValid) {
        throw new Error(
          `Package "${packageName}" is not a valid desktop-tool plugin. ` +
          `It must include "desktop-tool-plugin" keyword in package.json.`
        );
      }

      // 3. 确定要使用的版本
      const targetVersion = version || packageInfo.version;

      // 4. 检查缓存
      const cacheKey = `${packageName}@${targetVersion}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        logger.info(`Plugin loaded from cache: ${cacheKey}`);
        return cached;
      }

      // 5. 构建 CDN URL
      // 注意：npm registry 会过滤 desktopTool 字段，使用默认入口点
      // 插件作者可以在 package.json 中保留 desktop-tool 字段作为文档
      const entryPoint = './dist/index.js';
      const cdnUrl = this.buildCdnUrl(packageName, targetVersion, entryPoint);

      logger.info(`Loading plugin from CDN: ${cdnUrl}`);

      // 6. 动态导入模块
      const module = await this.dynamicImportWithRetry(cdnUrl);

      // 7. 验证插件导出格式
      this.validatePluginModule(module, packageName);

      logger.info(`Plugin module loaded from CDN: ${packageName}@${targetVersion}`, {
        moduleKeys: Object.keys(module),
        hasDefault: !!module.default,
        hasNamedComponent: !!module.component,
        hasManifest: !!module.manifest,
        manifestId: module.manifest?.id,
        manifestVersion: module.manifest?.version,
        manifestName: module.manifest?.name
      });

      // 8. 加载CSS样式
      await this.loadPluginStyle(packageName, targetVersion);

      // 9. 构建加载结果
      const result: RemotePluginLoadResult = {
        component: this.extractComponent(module),
        manifest: this.extractManifest(module),
        packageName,
        version: targetVersion
      };

      // 9. 缓存结果
      this.cacheResult(cacheKey, result);

      logger.info(`Plugin loaded successfully: ${packageName}@${targetVersion}`);

      return result;
    } catch (error) {
      logger.error(`Failed to load plugin from npm: ${packageName}`, { error, version });
      throw new Error(
        `Failed to load plugin "${packageName}": ${(error as Error).message}`
      );
    }
  }

  /**
   * 安装插件（加载并注册到 PluginRegistry）
   * @param packageName npm 包名
   * @param version 版本（可选）
   */
  async installPlugin(packageName: string, version?: string): Promise<void> {
    try {
      logger.info(`Installing plugin: ${packageName}@${version || 'latest'}`);

      // ✅ 如果没有指定版本，从 npm 获取最新版本
      // 这解决了 localStorage 中的旧版本导致加载错误版本的问题
      if (!version) {
        const packageInfo = await npmService.getPackageInfo(packageName);
        version = packageInfo.version;
        logger.info(`No version specified, using latest from npm: ${version}`);
      }

      const targetVersion = version;

      // 清除缓存，确保加载最新版本
      const cacheKey = `${packageName}@${targetVersion}`;
      if (this.cache.has(cacheKey)) {
        this.cache.delete(cacheKey);
        logger.info(`Cleared cache for: ${cacheKey}`);
      }

      // 加载插件
      const result = await this.loadFromNPM(packageName, targetVersion);

      // 注册到 PluginRegistry
      pluginRegistry.register(result.manifest.id, {
        pluginId: result.manifest.id,
        manifest: result.manifest,
        component: result.component,
        source: 'remote',  // ✅ 使用 'remote' 让 PluginModal 用 iframe 隔离，避免 React 冲突
        packageName: result.packageName,
        version: result.version
      });

      // 保存到已安装列表
      const installedPlugins = this.getInstalledPlugins();
      const pluginEntry: InstalledRemotePlugin = {
        id: result.manifest.id,
        packageName: result.packageName,
        version: result.version,
        installedAt: new Date().toISOString(),
        manifest: result.manifest
      };

      // 更新或添加
      const existingIndex = installedPlugins.findIndex(p => p.packageName === packageName);
      if (existingIndex >= 0) {
        installedPlugins[existingIndex] = pluginEntry;
      } else {
        installedPlugins.push(pluginEntry);
      }

      this.saveInstalledPlugins(installedPlugins);

      logger.info(`Plugin installed successfully: ${result.manifest.id}`);
    } catch (error) {
      logger.error(`Failed to install plugin: ${packageName}`, { error });
      throw error;
    }
  }

  /**
   * 卸载插件
   * @param pluginId 插件 ID
   */
  uninstallPlugin(pluginId: string): void {
    try {
      logger.info(`Uninstalling plugin: ${pluginId}`);

      // 获取当前插件信息（在删除之前）
      const currentPlugins = this.getInstalledPlugins();
      const pluginInfo = currentPlugins.find(p => p.id === pluginId);
      const packageName = pluginInfo?.packageName;

      // 从已安装列表中移除（先删除localStorage，避免事件触发时重新加载）
      const installedPlugins = currentPlugins.filter(p => p.id !== pluginId);
      this.saveInstalledPlugins(installedPlugins);

      // 从 PluginRegistry 中移除（这会触发 'unregistered' 事件）
      // 但此时localStorage已经被清空，所以重新加载也不会再安装这个插件
      pluginRegistry.unregister(pluginId);

      // 清除缓存
      this.cache.forEach((value, key) => {
        if (value.manifest?.id === pluginId) {
          this.cache.delete(key);
        }
      });

      // 移除CSS样式标签
      if (packageName) {
        const styleId = `plugin-style-${packageName}`;
        const styleElement = document.getElementById(styleId);
        if (styleElement) {
          styleElement.remove();
          logger.info(`Plugin CSS removed: ${packageName}`);
        }
      }

      logger.info(`Plugin uninstalled successfully: ${pluginId}`);
    } catch (error) {
      logger.error(`Failed to uninstall plugin: ${pluginId}`, { error });
      throw error;
    }
  }

  /**
   * 获取已安装的插件列表
   */
  getInstalledPlugins(): InstalledRemotePlugin[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      logger.error('Failed to get installed plugins', { error });
      return [];
    }
  }

  /**
   * 构建 CDN URL
   */
  private buildCdnUrl(packageName: string, version: string, path: string): string {
    const config = CDN_CONFIGS[this.cdnProvider];

    // 移除路径开头的 ./
    const cleanPath = path.startsWith('./') ? path.slice(2) : path;

    const baseUrl = config.buildUrl(packageName, version, cleanPath);

    // 不添加 external 参数
    // esm.sh 会自动处理 React 依赖，确保只有一个 React 实例
    // 这样可以避免 React hooks 错误："Cannot read properties of null (reading 'useState')"
    return baseUrl;
  }

  /**
   * 带重试的动态导入
   */
  private async dynamicImportWithRetry(
    url: string,
    retries: number = 3,
    delay: number = 1000
  ): Promise<any> {
    for (let i = 0; i < retries; i++) {
      try {
        // @vite-ignore - URL is built dynamically at runtime from npm package name
        return await import(url);
      } catch (error) {
        if (i === retries - 1) {
          throw error;
        }

        logger.warn(`Import failed, retrying (${i + 1}/${retries}): ${url}`);
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }

    throw new Error('Import failed after retries');
  }

  /**
   * 验证插件模块格式
   */
  private validatePluginModule(module: any, packageName: string): void {
    if (!module) {
      throw new Error(`Plugin module is null or undefined`);
    }

    const hasComponent = module.default || module.component;
    const hasManifest = module.manifest;

    if (!hasComponent) {
      throw new Error(
        `Plugin must export a default component or named "component" export`
      );
    }

    if (!hasManifest) {
      throw new Error(
        `Plugin must export a "manifest" object`
      );
    }

    if (!module.manifest.id || !module.manifest.name) {
      throw new Error(
        `Plugin manifest must include "id" and "name" fields`
      );
    }
  }

  /**
   * 提取组件
   */
  private extractComponent(module: any): React.ComponentType<any> {
    return module.default || module.component;
  }

  /**
   * 提取 manifest
   */
  private extractManifest(module: any): any {
    return module.manifest;
  }

  /**
   * 从缓存获取
   */
  private getFromCache(key: string): RemotePluginLoadResult | null {
    return this.cache.get(key) || null;
  }

  /**
   * 缓存结果
   */
  private cacheResult(key: string, result: RemotePluginLoadResult): void {
    this.cache.set(key, result);
  }

  /**
   * 保存已安装插件列表
   */
  private saveInstalledPlugins(plugins: InstalledRemotePlugin[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(plugins));
    } catch (error) {
      logger.error('Failed to save installed plugins', { error });
    }
  }

  /**
   * 清除所有缓存
   */
  clearCache(): void {
    this.cache.clear();
    logger.info('Plugin cache cleared');
  }

  /**
   * 加载插件CSS样式
   * @param packageName npm包名
   * @param version 版本号
   */
  private async loadPluginStyle(packageName: string, version: string): Promise<void> {
    try {
      // 检查是否已经加载过这个CSS
      const styleId = `plugin-style-${packageName}`;
      if (document.getElementById(styleId)) {
        logger.debug(`Plugin style already loaded: ${packageName}`);
        return;
      }

      // 构建CSS URL
      const cssUrl = `https://esm.sh/${packageName}@${version}/dist/style.css`;

      logger.info(`Loading plugin CSS: ${cssUrl}`);

      // 加载CSS
      const response = await fetch(cssUrl);
      if (!response.ok) {
        throw new Error(`Failed to load CSS: ${response.statusText}`);
      }

      const cssContent = await response.text();

      // 创建style标签
      const styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.textContent = cssContent;

      // 添加到document.head
      document.head.appendChild(styleElement);

      logger.info(`Plugin CSS loaded successfully: ${packageName}`);
    } catch (error) {
      // CSS加载失败不应该阻止插件加载
      logger.warn(`Failed to load plugin CSS: ${packageName}`, { error });
    }
  }
}

// 导出单例实例
export const remotePluginLoader = new RemotePluginLoader();
