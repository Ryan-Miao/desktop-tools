/**
 * 统一日志系统类型定义
 */

/**
 * 日志级别枚举
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

/**
 * 日志级别名称映射
 */
export const LogLevelNames: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR'
};

/**
 * 日志级别颜色映射（用于控制台输出）
 */
export const LogLevelColors: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: '#9CA3AF',      // gray-400
  [LogLevel.INFO]: '#3B82F6',       // blue-500
  [LogLevel.WARN]: '#F59E0B',       // amber-500
  [LogLevel.ERROR]: '#EF4444'       // red-500
};

/**
 * 日志条目接口
 */
export interface LogEntry {
  /** 时间戳 */
  timestamp: Date;
  /** 日志级别 */
  level: LogLevel;
  /** 日志消息 */
  message: string;
  /** 附加数据 */
  data?: any;
  /** 平台类型 */
  platform: 'main' | 'renderer' | 'web';
  /** 模块/组件名称 */
  module?: string;
}

/**
 * 日志配置接口
 */
export interface LoggerConfig {
  /** 最小日志级别 */
  minLevel: LogLevel;
  /** 是否启用控制台输出 */
  enableConsole: boolean;
  /** 是否启用文件输出（仅桌面） */
  enableFile: boolean;
  /** 自定义模块名称 */
  module?: string;
}

/**
 * 日志查询选项
 */
export interface LogQueryOptions {
  /** 开始时间 */
  startDate?: Date;
  /** 结束时间 */
  endDate?: Date;
  /** 最小级别 */
  minLevel?: LogLevel;
  /** 模块过滤 */
  module?: string;
  /** 关键词搜索 */
  keyword?: string;
  /** 返回数量限制 */
  limit?: number;
}

/**
 * 日志统计信息
 */
export interface LogStats {
  /** 总日志条数 */
  total: number;
  /** 各级别日志数量 */
  byLevel: Record<LogLevel, number>;
  /** 各模块日志数量 */
  byModule: Record<string, number>;
}
