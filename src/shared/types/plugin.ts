// ==================== Plugin Manifest ====================

/**
 * 插件清单接口
 */
export interface PluginManifest {
  id: string;                    // 唯一标识符（反向域名格式）
  name: string;                  // 插件名称
  version: string;                // 版本号（语义化版本）
  description: string;           // 描述
  author: string;                // 作者
  icon: string;                 // 图标（emoji或文件名）
  entry: string;                 // 入口文件
  category?: string;             // 分类
  keywords?: string[];           // 关键词
  permissions?: string[];        // 权限列表
  dependencies?: PluginDependency[]; // 依赖
  minAppVersion?: string;        // 最低应用版本
  homepage?: string;             // 主页
  license?: string;              // 许可证
}

/**
 * 插件依赖
 */
export interface PluginDependency {
  id: string;                   // 依赖插件ID
  version?: string;              // 依赖版本范围
  optional?: boolean;            // 是否可选
}

// ==================== Plugin Instance ====================

/**
 * 插件实例接口
 */
export interface IPlugin {
  manifest: PluginManifest;
  onLoad?(context: PluginContext): Promise<void>;
  onUnload?(): Promise<void>;
  onActivate?(): Promise<void>;
  onDeactivate?(): Promise<void>;
  handleMessage?(channel: string, data: any): Promise<any>;
  createWindow?(config: any): any;
}

/**
 * 插件上下文
 */
export interface PluginContext {
  app: any;
  mainWindow: any;
  db: any;
  ipc: any;
  logger: any;
  storage: PluginStorage;
}

/**
 * 插件存储接口
 */
export interface PluginStorage {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  getAll(): Promise<Record<string, any>>;
}

// ==================== Plugin State ====================

/**
 * 插件状态
 */
export interface PluginState {
  id: string;                   // 插件ID
  enabled: boolean;             // 是否启用
  installed: boolean;            // 是否已安装
  source: PluginSource;          // 来源
  installedAt?: number;         // 安装时间
  lastUsed?: number;             // 最后使用时间
  updateAvailable?: boolean;      // 是否有更新
  remoteVersion?: string;        // 远程版本
  customData?: Record<string, any>; // 自定义数据
}

/**
 * 插件来源
 */
export enum PluginSource {
  BUILTIN = 'builtin',          // 内置
  LOCAL = 'local',              // 本地导入
  REMOTE = 'remote'             // 远程加载
}

// ==================== Plugin Registry ====================

/**
 * 插件注册表
 */
export interface PluginRegistry {
  register(plugin: IPlugin): void;
  unregister(pluginId: string): void;
  get(pluginId: string): IPlugin | undefined;
  getAll(): IPlugin[];
  has(pluginId: string): boolean;
}

// ==================== Window Config ====================

/**
 * 窗口配置接口
 */
export interface WindowConfig {
  width: number;
  height: number;
  x?: number;
  y?: number;
  transparent?: boolean;
  frame?: boolean;
  alwaysOnTop?: boolean;
  skipTaskbar?: boolean;
  resizable?: boolean;
  maximizable?: boolean;
  minimizable?: boolean;
  closable?: boolean;
  showInactive?: boolean;
  vibrancy?: string;
  webSecurity?: boolean;
  nodeIntegration?: boolean;
}

/**
 * 窗口状态
 */
export interface WindowState {
  id: string;                   // 窗口ID
  pluginId?: string;             // 所属插件ID
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  isMaximized?: boolean;
  isMinimized?: boolean;
  isFullscreen?: boolean;
  zIndex?: number;
}

// ==================== Plugin Window ====================

/**
 * 插件窗口接口
 */
export interface IPluginWindow {
  id: string;
  pluginId: string;
  config: WindowConfig;
  state: WindowState;
  show(): Promise<void>;
  hide(): Promise<void>;
  close(): Promise<void>;
  minimize(): Promise<void>;
  maximize(): Promise<void>;
  restore(): Promise<void>;
  focus(): Promise<void>;
  getState(): WindowState;
  setState(state: Partial<WindowState>): Promise<void>;
}

// ==================== Plugin Permissions ====================

/**
 * 插件权限枚举
 */
export enum PluginPermission {
  // 文件系统
  FILE_READ = 'file:read',
  FILE_WRITE = 'file:write',
  FILE_DELETE = 'file:delete',

  // 数据库
  DATABASE_READ = 'database:read',
  DATABASE_WRITE = 'database:write',

  // 网络请求
  NETWORK_REQUEST = 'network:request',

  // 全局快捷键
  GLOBAL_SHORTCUT = 'global-shortcut',

  // 屏幕
  SCREEN_CAPTURE = 'screen:capture',

  // 系统通知
  SYSTEM_NOTIFICATION = 'system:notification',

  // 剪贴板
  CLIPBOARD_READ = 'clipboard:read',
  CLIPBOARD_WRITE = 'clipboard:write',

  // 进程管理
  PROCESS_SPAWN = 'process:spawn',

  // 窗口管理
  WINDOW_MANAGE = 'window:manage'
}

/**
 * 权限检查结果
 */
export interface PermissionCheckResult {
  permission: PluginPermission;
  granted: boolean;
  reason?: string;
}

// ==================== Plugin Events ====================

/**
 * 插件事件类型
 */
export enum PluginEventType {
  LOADED = 'plugin:loaded',
  UNLOADED = 'plugin:unloaded',
  ACTIVATED = 'plugin:activated',
  DEACTIVATED = 'plugin:deactivated',
  ERROR = 'plugin:error',
  UPDATED = 'plugin:updated'
}

/**
 * 插件事件
 */
export interface PluginEvent {
  type: PluginEventType;
  pluginId: string;
  timestamp: number;
  data?: any;
  error?: Error;
}

/**
 * 插件事件监听器
 */
export type PluginEventListener = (event: PluginEvent) => void;

// ==================== Plugin Manager ====================

/**
 * 插件管理器接口
 */
export interface IPluginManager {
  // 生命周期
  initialize(): Promise<void>;
  destroy(): Promise<void>;

  // 插件加载
  load(pluginId: string): Promise<void>;
  unload(pluginId: string): Promise<void>;
  reload(pluginId: string): Promise<void>;
  loadAll(): Promise<void>;
  unloadAll(): Promise<void>;

  // 插件激活
  activate(pluginId: string): Promise<void>;
  deactivate(pluginId: string): Promise<void>;

  // 插件查询
  get(pluginId: string): IPlugin | undefined;
  getAll(): IPlugin[];
  getState(pluginId: string): Promise<PluginState | undefined>;
  getAllStates(): Promise<PluginState[]>;

  // 插件管理
  install(pluginPath: string): Promise<void>;
  uninstall(pluginId: string): Promise<void>;
  export(pluginId: string, outputPath: string): Promise<void>;
  update(pluginId: string): Promise<void>;

  // 远程插件
  fetchFromRemote(url: string): Promise<void>;
  checkUpdates(): Promise<void>;

  // 事件
  on(event: PluginEventTypeEvent, listener: PluginEventListener): void;
  off(event: PluginEventTypeEvent, listener: PluginEventListener): void;
}

/**
 * 插件事件类型（用于事件系统）
 */
export type PluginEventTypeEvent = 'loaded' | 'unloaded' | 'activated' | 'deactivated' | 'error' | 'updated';

// ==================== Plugin Store ====================

/**
 * 插件存储配置
 */
export interface PluginStoreConfig {
  dbName: string;
  tableName: string;
}

/**
 * 插件存储接口
 */
export interface IPluginStore {
  saveState(pluginId: string, state: PluginState): Promise<void>;
  getState(pluginId: string): Promise<PluginState | undefined>;
  getAllStates(): Promise<PluginState[]>;
  deleteState(pluginId: string): Promise<void>;
  saveWindowState(windowId: string, state: WindowState): Promise<void>;
  getWindowState(windowId: string): Promise<WindowState | undefined>;
  deleteWindowState(windowId: string): Promise<void>;
}

// ==================== Unified Plugin Window ====================

/**
 * 统一插件窗口配置（用于 PluginWindow 组件）
 */
export interface UnifiedPluginWindowConfig {
  /** 窗口标题 */
  title: string;
  /** 窗口图标 (emoji 或图片URL) */
  icon?: string;
  /** 主题ID (继承主窗口主题) */
  themeId?: string;
  /** 面板透明度 (0-100) */
  opacity?: number;
  /** 是否可调整大小 */
  resizable?: boolean;
  /** 是否可最大化 */
  maximizable?: boolean;
  /** 是否可最小化 */
  minimizable?: boolean;
  /** 是否显示标题栏 */
  showHeader?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 是否显示关闭按钮 */
  showCloseButton?: boolean;
  /** 最小宽度 */
  minWidth?: number;
  /** 最小高度 */
  minHeight?: number;
  /** 初始宽度 */
  width?: number;
  /** 初始高度 */
  height?: number;
}
