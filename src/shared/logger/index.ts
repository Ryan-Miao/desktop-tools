/**
 * 统一日志框架
 * 支持桌面模式（写文件）和Web模式（控制台输出）
 */

import {
  LogLevel,
  LogLevelNames,
  LogLevelColors,
  LogEntry,
  LoggerConfig,
} from "./types";

/**
 * 统一日志类
 */
class UnifiedLogger {
  private config: LoggerConfig;
  private isDesktop: boolean;
  private mainProcessLogService?: any;

  constructor(config?: Partial<LoggerConfig>) {
    this.config = {
      minLevel: LogLevel.INFO,
      enableConsole: true,
      enableFile: true,
      ...config,
    };

    // 检测运行环境
    this.isDesktop = this.detectDesktop();
  }

  /**
   * 设置主进程 LogService 实例（依赖注入）
   * 用于在打包后的代码中，避免动态 require 路径失效
   */
  setMainProcessLogService(logService: any): void {
    this.mainProcessLogService = logService;
  }

  /**
   * 检测是否为桌面环境
   */
  private detectDesktop(): boolean {
    // 检查是否在浏览器环境中（渲染进程）
    if (typeof window !== "undefined" && window) {
      return !!(window as any).electron?.ipcRenderer;
    }
    // 主进程环境 - 返回 true 以启用文件写入
    return true;
  }

  /**
   * 检测平台类型
   */
  private detectPlatform(): "main" | "renderer" | "web" {
    if (typeof window !== "undefined" && window) {
      if ((window as any).electron?.ipcRenderer) {
        return "renderer";
      }
      return "web";
    }
    return "main";
  }

  /**
   * 创建日志器实例（带模块名称）
   */
  createModuleLogger(moduleName: string): UnifiedLogger {
    const moduleLogger = new UnifiedLogger({
      ...this.config,
      module: moduleName,
    });
    // 传递 mainProcessLogService 给模块 logger，确保日志能写入文件
    if (this.mainProcessLogService) {
      moduleLogger.setMainProcessLogService(this.mainProcessLogService);
    }
    return moduleLogger;
  }

  /**
   * 设置最小日志级别
   */
  setMinLevel(level: LogLevel): void {
    this.config.minLevel = level;
  }

  /**
   * DEBUG级别日志
   */
  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * INFO级别日志
   */
  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * WARN级别日志
   */
  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * ERROR级别日志
   */
  error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, message, data);
  }

  /**
   * 核心日志方法
   */
  private log(level: LogLevel, message: string, data?: any): void {
    // 日志级别过滤
    if (level < this.config.minLevel) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      data,
      platform: this.detectPlatform(),
      module: this.config.module,
    };

    // 控制台输出（所有模式）
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    // 桌面模式：发送到主进程写文件
    if (this.isDesktop && this.config.enableFile) {
      // 检查是否在主进程中
      if (typeof window === "undefined" || !window) {
        // 主进程：直接写入文件
        this.writeToFileDirectly(entry);
      } else {
        // 渲染进程：通过 IPC 发送到主进程
        this.sendToMainProcess(entry);
      }
    }
  }

  /**
   * 主进程直接写入文件
   */
  private writeToFileDirectly(entry: LogEntry): void {
    // 如果 LogService 未注入，直接返回（可能是在 MainProcess 构造之前）
    if (!this.mainProcessLogService) {
      return;
    }

    try {
      // 转换 LogEntry 格式以匹配 LogService 的接口
      const logServiceEntry = {
        timestamp: entry.timestamp.toISOString(), // Date → string
        level: entry.level,
        message: entry.message,
        data: entry.data,
        platform:
          entry.platform === "main" || entry.platform === "renderer"
            ? "desktop"
            : "web",
        module: entry.module,
      };

      this.mainProcessLogService.write(logServiceEntry).catch((err: any) => {
        // 静默处理写入失败，避免日志系统本身产生错误
      });
    } catch (error) {
      // 静默处理错误，避免日志系统本身产生错误
    }
  }

  /**
   * 输出到控制台
   */
  private logToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const levelName = LogLevelNames[entry.level];
    const modulePrefix = entry.module ? `[${entry.module}] ` : "";
    const prefix = `${timestamp} [${levelName}] ${modulePrefix}`;
    const message = `${prefix} ${entry.message}`;
    const color = LogLevelColors[entry.level];

    // 格式化输出样式
    const consoleStyle = `color: ${color}; font-weight: ${entry.level >= LogLevel.WARN ? "bold" : "normal"}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(`%c${message}`, consoleStyle, entry.data || "");
        break;
      case LogLevel.INFO:
        console.log(`%c${message}`, consoleStyle, entry.data || "");
        break;
      case LogLevel.WARN:
        console.warn(`%c${message}`, consoleStyle, entry.data || "");
        break;
      case LogLevel.ERROR:
        console.error(`%c${message}`, consoleStyle, entry.data || "");
        break;
    }
  }

  /**
   * 发送到主进程（仅桌面模式）
   */
  private sendToMainProcess(entry: LogEntry): void {
    try {
      // 检查是否在浏览器环境中
      if (typeof window === "undefined" || !window) {
        return;
      }
      const electron = (window as any).electron;
      if (electron?.ipcRenderer) {
        // 序列化日志条目（Date对象转为ISO字符串）
        const serializedEntry = {
          ...entry,
          timestamp: entry.timestamp.toISOString(),
        };
        electron.ipcRenderer.send("log:write", serializedEntry);
      }
    } catch (error) {
      // 避免日志记录本身出错
      console.error("[Logger] Failed to send log to main process:", error);
    }
  }

  /**
   * 查询日志（异步）
   */
  async query(options?: any): Promise<LogEntry[]> {
    if (!this.isDesktop) {
      // Web模式：返回空数组
      return [];
    }

    try {
      // 检查是否在浏览器环境中
      if (typeof window === "undefined" || !window) {
        return [];
      }
      const electron = (window as any).electron;
      if (electron?.ipcRenderer) {
        const result = await electron.ipcRenderer.invoke("log:query", options);
        // 反序列化（ISO字符串转回Date对象）
        return result.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
        }));
      }
    } catch (error) {
      console.error("[Logger] Failed to query logs:", error);
    }

    return [];
  }

  /**
   * 获取日志统计（异步）
   */
  async getStats(): Promise<any> {
    if (!this.isDesktop) {
      return { total: 0, byLevel: {}, byModule: {} };
    }

    try {
      // 检查是否在浏览器环境中
      if (typeof window === "undefined" || !window) {
        return { total: 0, byLevel: {}, byModule: {} };
      }
      const electron = (window as any).electron;
      if (electron?.ipcRenderer) {
        return await electron.ipcRenderer.invoke("log:stats");
      }
    } catch (error) {
      console.error("[Logger] Failed to get log stats:", error);
    }

    return { total: 0, byLevel: {}, byModule: {} };
  }
}

/**
 * 默认日志器实例
 */
export const logger = new UnifiedLogger();

/**
 * 创建带模块名称的日志器
 */
export function createLogger(moduleName: string): UnifiedLogger {
  return logger.createModuleLogger(moduleName);
}

/**
 * 导出类型
 */
export * from "./types";
export default UnifiedLogger;
