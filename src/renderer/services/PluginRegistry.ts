import React from "react";
import { PluginManifest } from "../../shared/types/plugin";
import { createLogger } from "../../shared/logger";

// Use namespace import to handle CommonJS/ESM compatibility
// @ts-ignore - @babel/standalone doesn't have TypeScript types
import * as BabelModule from "@babel/standalone";

const logger = createLogger("PluginRegistry");

export type PluginSource = "built-in" | "local" | "remote";

export interface PluginComponentInfo {
  component: React.ComponentType<any>;
  pluginId: string;
  manifest: PluginManifest;
  loadedAt: number;
  source?: PluginSource;
  packageName?: string; // For remote plugins: npm package name
  version?: string; // For remote plugins: installed version
}

type PluginEventCallback = (pluginId: string) => void;

class PluginRegistry {
  private static instance: PluginRegistry;
  private plugins: Map<string, PluginComponentInfo> = new Map();
  private listeners: Map<string, Set<PluginEventCallback>> = new Map();

  private constructor() {
    logger.info("PluginRegistry initialized");
  }

  static getInstance(): PluginRegistry {
    if (!PluginRegistry.instance) {
      PluginRegistry.instance = new PluginRegistry();
    }
    return PluginRegistry.instance;
  }

  register(
    pluginId: string,
    info: Omit<PluginComponentInfo, "loadedAt">,
  ): void {
    const existing = this.plugins.get(pluginId);

    if (existing) {
      // 更新已存在的插件
      logger.info(
        `[PluginRegistry] Plugin already registered, updating: ${pluginId}`,
        {
          oldVersion: existing.version,
          newVersion: info.version,
          oldSource: existing.source,
          newSource: info.source,
          hadComponent: !!existing.component,
          hasComponent: !!info.component,
        },
      );

      this.plugins.set(pluginId, {
        ...info,
        loadedAt: Date.now(),
      });

      logger.info(`[PluginRegistry] Plugin updated: ${pluginId}`);
      this.emit("updated", pluginId); // 新事件：插件已更新
    } else {
      // 新注册
      logger.info(`[PluginRegistry] Registering new plugin: ${pluginId}`, {
        hasComponent: !!info.component,
        componentType: typeof info.component,
        source: info.source,
        version: info.version,
      });

      this.plugins.set(pluginId, {
        ...info,
        loadedAt: Date.now(),
      });

      logger.info(`[PluginRegistry] Plugin registered: ${pluginId}`);
      this.emit("registered", pluginId);
    }
  }

  /**
   * Register only the manifest (component will be loaded on-demand)
   * This improves startup time by deferring component loading
   */
  registerManifest(pluginId: string, manifest: PluginManifest): void {
    const existing = this.plugins.get(pluginId);

    if (existing) {
      // Update existing plugin manifest
      logger.debug(`[PluginRegistry] Updating manifest for: ${pluginId}`);
      this.plugins.set(pluginId, {
        ...existing,
        manifest,
        loadedAt: existing.loadedAt,
      });
      this.emit("updated", pluginId);
    } else {
      // Register manifest-only entry (component will be loaded later)
      logger.debug(`[PluginRegistry] Registering manifest-only: ${pluginId}`);
      this.plugins.set(pluginId, {
        component: null as any, // Component not loaded yet
        pluginId,
        manifest,
        loadedAt: Date.now(),
        source: "built-in",
      });
      this.emit("registered", pluginId);
    }
  }

  getComponent(pluginId: string): React.ComponentType<any> | null {
    const info = this.plugins.get(pluginId);

    logger.debug(`[PluginRegistry] getComponent: ${pluginId}`, {
      found: !!info,
      hasComponent: !!info?.component,
      componentType: info?.component ? typeof info.component : "N/A",
      componentName:
        info?.component?.name || info?.component?.displayName || "anonymous",
      version: info?.version,
      source: info?.source,
    });

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
      this.emit("unregistered", pluginId);
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
    this.listeners.get(event)?.forEach((callback) => {
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

  /**
   * 获取所有远程插件
   */
  getRemotePlugins(): PluginComponentInfo[] {
    return Array.from(this.plugins.values()).filter(
      (p) => p.source === "remote",
    );
  }

  /**
   * 获取所有内置插件
   */
  getBuiltInPlugins(): PluginComponentInfo[] {
    return Array.from(this.plugins.values()).filter(
      (p) => p.source === "built-in" || !p.source,
    );
  }

  /**
   * 获取所有本地插件
   */
  getLocalPlugins(): PluginComponentInfo[] {
    return Array.from(this.plugins.values()).filter(
      (p) => p.source === "local",
    );
  }

  /**
   * 根据 npm 包名获取插件
   */
  getPluginByPackageName(packageName: string): PluginComponentInfo | undefined {
    return Array.from(this.plugins.values()).find(
      (p) => p.packageName === packageName,
    );
  }

  clear(): void {
    logger.warn(`Clearing all plugins (${this.plugins.size} registered)`);
    this.plugins.clear();
    this.emit("cleared", "");
  }

  /**
   * 统一插件组件加载接口
   * 支持内置插件（已注册）和用户导入插件（动态加载）
   */
  async loadPluginComponent(
    pluginId: string,
  ): Promise<React.ComponentType<any>> {
    // 1. 优先检查已注册插件（Web + Desktop通用）
    if (this.has(pluginId)) {
      const pluginInfo = this.plugins.get(pluginId);
      logger.debug(
        `Plugin already registered: ${pluginId}, source: ${pluginInfo?.source || "unknown"}`,
      );
      const component = this.getComponent(pluginId);

      if (component) {
        logger.info(`Plugin loaded from registry: ${pluginId}`);
        return component;
      }

      // 如果注册了但组件为null，尝试从 lazyPlugins 加载
      logger.debug(
        `Plugin registered but component is null, trying lazy load: ${pluginId}`,
      );
    }

    // 2. 尝试从 lazyPlugins 加载（内置插件的延迟加载）
    try {
      // Import lazyPlugins from main.tsx
      const { lazyPlugins } = await import("../main");
      if (lazyPlugins[pluginId as keyof typeof lazyPlugins]) {
        logger.info(`Loading plugin from lazyPlugins: ${pluginId}`);
        const component =
          await lazyPlugins[pluginId as keyof typeof lazyPlugins];

        // 更新 registry
        const existing = this.plugins.get(pluginId);
        if (existing) {
          this.plugins.set(pluginId, {
            ...existing,
            component,
          });
        }

        logger.info(`Plugin loaded from lazyPlugins: ${pluginId}`);
        return component;
      }
    } catch (error) {
      logger.debug(`Plugin not in lazyPlugins: ${pluginId}`);
    }

    // 3. 动态加载用户插件（仅Desktop - 需要Electron IPC）
    logger.info(`Loading plugin component dynamically: ${pluginId}`);

    try {
      // 仅在Electron环境尝试动态加载
      if (!window.electron?.ipcRenderer) {
        throw new Error(
          "Plugin not registered and dynamic loading requires Electron IPC. " +
            "Ensure plugins are loaded before attempting to display them.",
        );
      }

      const sourceCode = await window.electron.ipcRenderer.invoke(
        "plugin:get-component-source",
        pluginId,
      );

      logger.info(`Plugin source code loaded: ${sourceCode.length} bytes`);

      // 获取 manifest
      const manifest = await window.electron.ipcRenderer.invoke(
        "plugin:get",
        pluginId,
      );

      if (!manifest) {
        throw new Error(`Plugin manifest not found: ${pluginId}`);
      }

      // 使用 Babel 编译 TypeScript + JSX
      // Handle both default and namespace imports
      const Babel = BabelModule.default || BabelModule;

      // Runtime check
      if (!Babel) {
        logger.error("Babel is not available", {
          hasDefault: !!BabelModule.default,
          hasModule: !!BabelModule,
          keys: Object.keys(BabelModule),
        });
        throw new Error(
          "Babel is not available. Please check if @babel/standalone is properly installed.",
        );
      }

      if (typeof Babel.transform !== "function") {
        logger.error("Babel.transform is not a function", {
          type: typeof Babel.transform,
          babelKeys: Object.keys(Babel).filter((k) => k.includes("transform")),
        });
        throw new Error("Babel.transform is not a function");
      }

      logger.info("Babel available, attempting transform");

      const transformed = Babel.transform(sourceCode, {
        presets: ["react", "typescript", "env"],
        filename: `${pluginId}.tsx`,
      }).code;

      logger.info(
        `Plugin code compiled successfully, ${transformed.length} bytes`,
      );

      // 动态执行编译后的代码
      const module = { exports: {} };
      const requireMock = (id: string) => {
        if (id === "react") return React;
        if (id.includes("pluginRegistry")) return this;
        return {};
      };

      // 创建执行上下文
      const func = new Function(
        "module",
        "exports",
        "React",
        "pluginRegistry",
        "require",
        `${transformed}\nreturn module.exports;`,
      );

      const exports = func(module, module.exports, React, this, requireMock);
      const component = exports.default || exports;

      logger.info(`Plugin executed successfully`);

      // 注册到 PluginRegistry
      this.register(pluginId, {
        component: component,
        pluginId: pluginId,
        manifest: manifest,
      });

      logger.info(`Plugin dynamically loaded and registered: ${pluginId}`);

      return component;
    } catch (error) {
      logger.error(`Failed to load plugin component: ${pluginId}`, {
        error,
        errorMessage: (error as Error).message,
        errorStack: (error as Error).stack,
      });
      throw error;
    }
  }
}

export const pluginRegistry = PluginRegistry.getInstance();
