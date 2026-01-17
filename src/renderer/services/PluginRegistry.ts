import React from 'react';
import { PluginManifest } from '../../shared/types/plugin';
import { createLogger } from '../../shared/logger';

// Use namespace import to handle CommonJS/ESM compatibility
// @ts-ignore - @babel/standalone doesn't have TypeScript types
import * as BabelModule from '@babel/standalone';

const logger = createLogger('PluginRegistry');

export interface PluginComponentInfo {
  component: React.ComponentType<any>;
  pluginId: string;
  manifest: PluginManifest;
  loadedAt: number;
}

type PluginEventCallback = (pluginId: string) => void;

class PluginRegistry {
  private static instance: PluginRegistry;
  private plugins: Map<string, PluginComponentInfo> = new Map();
  private listeners: Map<string, Set<PluginEventCallback>> = new Map();

  private constructor() {
    logger.info('PluginRegistry initialized');
  }

  static getInstance(): PluginRegistry {
    if (!PluginRegistry.instance) {
      PluginRegistry.instance = new PluginRegistry();
    }
    return PluginRegistry.instance;
  }

  register(pluginId: string, info: Omit<PluginComponentInfo, 'loadedAt'>): void {
    if (this.plugins.has(pluginId)) {
      logger.warn(`Plugin already registered: ${pluginId}`);
      return;
    }

    this.plugins.set(pluginId, {
      ...info,
      loadedAt: Date.now()
    });

    logger.info(`Plugin registered: ${pluginId}`);
    this.emit('registered', pluginId);
  }

  getComponent(pluginId: string): React.ComponentType<any> | null {
    const info = this.plugins.get(pluginId);
    return info?.component || null;
  }

  getPluginInfo(pluginId: string): PluginComponentInfo | undefined {
    return this.plugins.get(pluginId);
  }

  getAll(): PluginComponentInfo[] {
    return Array.from(this.plugins.values());
  }

  has(pluginId: string): boolean {
    return this.plugins.has(pluginId);
  }

  unregister(pluginId: string): void {
    if (this.plugins.delete(pluginId)) {
      logger.info(`Plugin unregistered: ${pluginId}`);
      this.emit('unregistered', pluginId);
    }
  }

  on(event: string, callback: PluginEventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: PluginEventCallback): void {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, pluginId: string): void {
    this.listeners.get(event)?.forEach(callback => {
      try {
        callback(pluginId);
      } catch (error) {
        logger.error(`Error in plugin event listener: ${event}`, { error });
      }
    });
  }

  getPluginCount(): number {
    return this.plugins.size;
  }

  clear(): void {
    logger.warn(`Clearing all plugins (${this.plugins.size} registered)`);
    this.plugins.clear();
    this.emit('cleared', '');
  }

  /**
   * 统一插件组件加载接口
   * 支持内置插件（已注册）和用户导入插件（动态加载）
   */
  async loadPluginComponent(pluginId: string): Promise<React.ComponentType<any>> {
    // 1. 检查是否已注册
    if (this.has(pluginId)) {
      logger.debug(`Plugin already registered: ${pluginId}`);
      const component = this.getComponent(pluginId);
      if (component) return component;
    }

    // 2. 动态加载用户插件
    logger.info(`Loading plugin component dynamically: ${pluginId}`);

    try {
      // 获取组件源码
      if (!window.electron?.ipcRenderer) {
        throw new Error('IPC renderer not available');
      }

      const sourceCode = await window.electron.ipcRenderer.invoke(
        'plugin:get-component-source',
        pluginId
      );

      logger.info(`Plugin source code loaded: ${sourceCode.length} bytes`);

      // 获取 manifest
      const manifest = await window.electron.ipcRenderer.invoke('plugin:get', pluginId);

      if (!manifest) {
        throw new Error(`Plugin manifest not found: ${pluginId}`);
      }

      // 使用 Babel 编译 TypeScript + JSX
      // Handle both default and namespace imports
      const Babel = BabelModule.default || BabelModule;

      // Runtime check
      if (!Babel) {
        logger.error('Babel is not available', {
          hasDefault: !!BabelModule.default,
          hasModule: !!BabelModule,
          keys: Object.keys(BabelModule)
        });
        throw new Error('Babel is not available. Please check if @babel/standalone is properly installed.');
      }

      if (typeof Babel.transform !== 'function') {
        logger.error('Babel.transform is not a function', {
          type: typeof Babel.transform,
          babelKeys: Object.keys(Babel).filter(k => k.includes('transform'))
        });
        throw new Error('Babel.transform is not a function');
      }

      logger.info('Babel available, attempting transform');

      const transformed = Babel.transform(sourceCode, {
        presets: [
          'react',
          'typescript',
          'env'
        ],
        filename: `${pluginId}.tsx`
      }).code;

      logger.info(`Plugin code compiled successfully, ${transformed.length} bytes`);

      // 动态执行编译后的代码
      const module = { exports: {} };
      const requireMock = (id: string) => {
        if (id === 'react') return React;
        if (id.includes('pluginRegistry')) return this;
        return {};
      };

      // 创建执行上下文
      const func = new Function(
        'module',
        'exports',
        'React',
        'pluginRegistry',
        'require',
        `${transformed}\nreturn module.exports;`
      );

      const exports = func(module, module.exports, React, this, requireMock);
      const component = exports.default || exports;

      logger.info(`Plugin executed successfully`);

      // 注册到 PluginRegistry
      this.register(pluginId, {
        component: component,
        pluginId: pluginId,
        manifest: manifest
      });

      logger.info(`Plugin dynamically loaded and registered: ${pluginId}`);

      return component;
    } catch (error) {
      logger.error(`Failed to load plugin component: ${pluginId}`, {
        error,
        errorMessage: (error as Error).message,
        errorStack: (error as Error).stack
      });
      throw error;
    }
  }
}

export const pluginRegistry = PluginRegistry.getInstance();
