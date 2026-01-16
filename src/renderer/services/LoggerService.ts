/**
 * 跨平台日志服务
 * Web环境：输出到控制台
 * Electron环境：写入本地文件
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}

class LoggerService {
  private logLevel: LogLevel = LogLevel.INFO;
  private isElectron: boolean = false;
  private logDirectory: string = '';
  private logBuffer: LogEntry[] = [];
  private maxBufferSize: number = 100;

  constructor() {
    // 检测是否在 Electron 环境中运行
    this.isElectron = this.checkElectronEnvironment();
    if (this.isElectron) {
      this.initializeElectronLogging();
    }
  }

  /**
   * 检测是否在 Electron 环境中运行
   */
  private checkElectronEnvironment(): boolean {
    return !!(window as any).electronAPI;
  }

  /**
   * 初始化 Electron 日志记录
   */
  private async initializeElectronLogging() {
    try {
      const electronAPI = (window as any).electronAPI;
      if (electronAPI && electronAPI.getLogDirectory) {
        this.logDirectory = await electronAPI.getLogDirectory();
        console.log('[Logger] Electron logging initialized. Log directory:', this.logDirectory);
      }
    } catch (error) {
      console.error('[Logger] Failed to initialize Electron logging:', error);
    }
  }

  /**
   * 设置日志级别
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
    this.info(`Log level set to ${LogLevel[level]}`);
  }

  /**
   * 获取当前日志级别
   */
  getLogLevel(): LogLevel {
    return this.logLevel;
  }

  /**
   * 设置日志目录（仅 Electron）
   */
  async setLogDirectory(directory: string): Promise<void> {
    if (!this.isElectron) {
      this.warn('Cannot set log directory in web environment');
      return;
    }

    try {
      const electronAPI = (window as any).electronAPI;
      if (electronAPI && electronAPI.setLogDirectory) {
        this.logDirectory = await electronAPI.setLogDirectory(directory);
        this.info(`Log directory changed to: ${this.logDirectory}`);
      }
    } catch (error) {
      this.error('Failed to set log directory:', error);
    }
  }

  /**
   * 获取日志目录
   */
  getLogDirectory(): string {
    return this.logDirectory;
  }

  /**
   * 格式化日志条目
   */
  private formatLogEntry(entry: LogEntry): string {
    const timestamp = entry.timestamp;
    const level = LogLevel[entry.level].padEnd(5);
    const dataStr = entry.data ? ` | ${JSON.stringify(entry.data)}` : '';
    return `[${timestamp}] ${level} ${entry.message}${dataStr}`;
  }

  /**
   * 写入日志
   */
  private async writeLog(entry: LogEntry): Promise<void> {
    const formatted = this.formatLogEntry(entry);

    // Web 环境：输出到控制台
    if (!this.isElectron) {
      switch (entry.level) {
        case LogLevel.DEBUG:
          console.debug(formatted, entry.data || '');
          break;
        case LogLevel.INFO:
          console.log(formatted, entry.data || '');
          break;
        case LogLevel.WARN:
          console.warn(formatted, entry.data || '');
          break;
        case LogLevel.ERROR:
          console.error(formatted, entry.data || '');
          break;
      }
      return;
    }

    // Electron 环境：写入文件
    try {
      const electronAPI = (window as any).electronAPI;
      if (electronAPI && electronAPI.writeLog) {
        await electronAPI.writeLog(formatted);
      }

      // 缓存日志条目
      this.logBuffer.push(entry);
      if (this.logBuffer.length > this.maxBufferSize) {
        this.logBuffer.shift();
      }
    } catch (error) {
      console.error('[Logger] Failed to write log:', error);
    }
  }

  /**
   * 创建日志条目
   */
  private createLogEntry(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data
    };
  }

  /**
   * 调试级别日志
   */
  debug(message: string, data?: any): void {
    if (this.logLevel <= LogLevel.DEBUG) {
      const entry = this.createLogEntry(LogLevel.DEBUG, message, data);
      this.writeLog(entry);
    }
  }

  /**
   * 信息级别日志
   */
  info(message: string, data?: any): void {
    if (this.logLevel <= LogLevel.INFO) {
      const entry = this.createLogEntry(LogLevel.INFO, message, data);
      this.writeLog(entry);
    }
  }

  /**
   * 警告级别日志
   */
  warn(message: string, data?: any): void {
    if (this.logLevel <= LogLevel.WARN) {
      const entry = this.createLogEntry(LogLevel.WARN, message, data);
      this.writeLog(entry);
    }
  }

  /**
   * 错误级别日志
   */
  error(message: string, data?: any): void {
    if (this.logLevel <= LogLevel.ERROR) {
      const entry = this.createLogEntry(LogLevel.ERROR, message, data);
      this.writeLog(entry);
    }
  }

  /**
   * 获取最近的日志（仅 Electron）
   */
  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logBuffer.slice(-count);
  }

  /**
   * 清空日志缓存
   */
  clearLogBuffer(): void {
    this.logBuffer = [];
  }

  /**
   * 判断是否在 Electron 环境中
   */
  isElectronEnv(): boolean {
    return this.isElectron;
  }
}

// 创建单例
const loggerService = new LoggerService();

export default loggerService;
