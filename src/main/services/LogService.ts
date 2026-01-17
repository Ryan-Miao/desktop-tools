/**
 * 主进程日志服务
 * 负责写入日志文件
 */

import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

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
  platform?: 'desktop' | 'web';
  module?: string;
}

export interface LogQueryOptions {
  startDate?: Date;
  endDate?: Date;
  minLevel?: LogLevel;
  module?: string;
  keyword?: string;
  limit?: number;
}

export interface LogStats {
  total: number;
  byLevel: Record<LogLevel, number>;
  byModule: Record<string, number>;
}

class LogService {
  private logDirectory: string;
  private logFileName: string = 'app.log';
  private maxLogSize: number = 10 * 1024 * 1024; // 10MB
  private maxLogFiles: number = 5;
  private writeQueue: string[] = [];
  private isWriting: boolean = false;
  private minLevel: LogLevel = LogLevel.DEBUG; // 默认记录所有级别

  constructor() {
    // 设置日志目录为用户数据目录
    this.logDirectory = path.join(app.getPath('userData'), 'logs');
    this.ensureLogDirectory();
  }

  /**
   * 确保日志目录存在
   */
  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDirectory)) {
      fs.mkdirSync(this.logDirectory, { recursive: true });
    }
  }

  /**
   * 获取日志文件路径
   */
  private getLogFilePath(): string {
    return path.join(this.logDirectory, this.logFileName);
  }

  /**
   * 获取日志目录
   */
  getLogDirectory(): string {
    return this.logDirectory;
  }

  /**
   * 设置日志目录
   */
  setLogDirectory(directory: string): void {
    if (fs.existsSync(directory)) {
      this.logDirectory = directory;
    } else {
      try {
        fs.mkdirSync(directory, { recursive: true });
        this.logDirectory = directory;
      } catch (error) {
        console.error('Failed to create log directory:', error);
        throw new Error(`Invalid log directory: ${directory}`);
      }
    }
  }

  /**
   * 格式化日志条目
   */
  private formatLogEntry(entry: LogEntry): string {
    const timestamp = entry.timestamp;
    const levelStr = LogLevel[entry.level] || 'DEBUG';
    const level = levelStr.padEnd(5);
    const dataStr = entry.data ? ` | ${JSON.stringify(entry.data)}` : '';
    return `[${timestamp}] ${level} ${entry.message}${dataStr}\n`;
  }

  /**
   * 检查并轮转日志文件
   */
  private rotateLogFileIfNeeded(): void {
    const logFilePath = this.getLogFilePath();

    if (!fs.existsSync(logFilePath)) {
      return;
    }

    const stats = fs.statSync(logFilePath);

    // 如果日志文件超过最大大小，进行轮转
    if (stats.size >= this.maxLogSize) {
      // 轮转现有的日志文件
      for (let i = this.maxLogFiles - 1; i >= 1; i--) {
        const oldFile = path.join(this.logDirectory, `${this.logFileName}.${i}`);
        const newFile = path.join(this.logDirectory, `${this.logFileName}.${i + 1}`);

        if (fs.existsSync(oldFile)) {
          if (i === this.maxLogFiles - 1) {
            fs.unlinkSync(oldFile); // 删除最老的日志文件
          } else {
            fs.renameSync(oldFile, newFile);
          }
        }
      }

      // 将当前日志文件重命名为 .1
      const rotatedFile = path.join(this.logDirectory, `${this.logFileName}.1`);
      fs.renameSync(logFilePath, rotatedFile);
    }
  }

  /**
   * 异步写入日志队列
   */
  private async processWriteQueue(): Promise<void> {
    if (this.isWriting || this.writeQueue.length === 0) {
      return;
    }

    this.isWriting = true;

    try {
      this.rotateLogFileIfNeeded();

      const logFilePath = this.getLogFilePath();
      const content = this.writeQueue.join('');
      this.writeQueue = [];

      // 追加写入日志文件
      await fs.promises.appendFile(logFilePath, content);
    } catch (error) {
      console.error('Failed to write log:', error);
    } finally {
      this.isWriting = false;

      // 如果还有待写入的日志，继续处理
      if (this.writeQueue.length > 0) {
        setImmediate(() => this.processWriteQueue());
      }
    }
  }

  /**
   * 设置最小日志级别
   */
  setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  /**
   * 获取最小日志级别
   */
  getMinLevel(): LogLevel {
    return this.minLevel;
  }

  /**
   * 写入日志
   */
  async write(entry: LogEntry): Promise<void> {
    // 日志级别过滤
    if (entry.level < this.minLevel) {
      return;
    }

    const formatted = this.formatLogEntry(entry);
    this.writeQueue.push(formatted);

    // 异步处理写入队列
    setImmediate(() => this.processWriteQueue());
  }

  /**
   * 读取最近的日志
   */
  readRecentLogs(lines: number = 100): string[] {
    const logFilePath = this.getLogFilePath();

    if (!fs.existsSync(logFilePath)) {
      return [];
    }

    try {
      const content = fs.readFileSync(logFilePath, 'utf-8');
      const allLines = content.split('\n').filter(line => line.trim());
      return allLines.slice(-lines);
    } catch (error) {
      console.error('Failed to read log file:', error);
      return [];
    }
  }

  /**
   * 清空日志文件
   */
  clearLogs(): void {
    const logFilePath = this.getLogFilePath();

    if (fs.existsSync(logFilePath)) {
      fs.unlinkSync(logFilePath);
    }
  }

  /**
   * 查询日志
   */
  query(options: LogQueryOptions = {}): LogEntry[] {
    const logFiles = this.getLogFiles();
    const results: LogEntry[] = [];

    for (const logFile of logFiles) {
      try {
        const content = fs.readFileSync(logFile, 'utf-8');
        const lines = content.split('\n').filter(line => line.trim());

        for (const line of lines) {
          const entry = this.parseLogLine(line);
          if (!entry) continue;

          // 过滤条件
          if (options.minLevel !== undefined && entry.level < options.minLevel) {
            continue;
          }

          if (options.module && entry.module !== options.module) {
            continue;
          }

          if (options.keyword) {
            const searchText = `${entry.message} ${JSON.stringify(entry.data || '')}`.toLowerCase();
            if (!searchText.includes(options.keyword.toLowerCase())) {
              continue;
            }
          }

          if (options.startDate || options.endDate) {
            const timestamp = new Date(entry.timestamp);
            if (options.startDate && timestamp < options.startDate) continue;
            if (options.endDate && timestamp > options.endDate) continue;
          }

          results.push(entry);

          // 数量限制
          if (options.limit && results.length >= options.limit) {
            return results;
          }
        }
      } catch (error) {
        console.error(`Failed to read log file ${logFile}:`, error);
      }
    }

    return results;
  }

  /**
   * 获取日志统计
   */
  getStats(): LogStats {
    const logs = this.query();
    const stats: LogStats = {
      total: logs.length,
      byLevel: {
        [LogLevel.DEBUG]: 0,
        [LogLevel.INFO]: 0,
        [LogLevel.WARN]: 0,
        [LogLevel.ERROR]: 0
      },
      byModule: {}
    };

    for (const log of logs) {
      // 按级别统计
      stats.byLevel[log.level]++;

      // 按模块统计
      const module = log.module || 'unknown';
      stats.byModule[module] = (stats.byModule[module] || 0) + 1;
    }

    return stats;
  }

  /**
   * 解析日志行
   */
  private parseLogLine(line: string): LogEntry | null {
    try {
      // 日志格式: [timestamp] LEVEL message | data
      const match = line.match(/^\[([^\]]+)\]\s+(\w+)\s+(.+)$/);
      if (!match) return null;

      const [, timestamp, levelStr, messageAndData] = match;
      const level = this.parseLogLevel(levelStr);

      // 分离消息和数据
      let message = messageAndData;
      let data: any;

      if (messageAndData.includes(' | ')) {
        const [msg, dataStr] = messageAndData.split(' | ');
        message = msg;
        try {
          data = JSON.parse(dataStr);
        } catch {
          // 数据解析失败，忽略
        }
      }

      return {
        timestamp,
        level,
        message,
        data
      };
    } catch {
      return null;
    }
  }

  /**
   * 解析日志级别字符串
   */
  private parseLogLevel(levelStr: string): LogLevel {
    const level = (LogLevel as any)[levelStr];
    return level !== undefined ? level : LogLevel.INFO;
  }

  /**
   * 获取所有日志文件
   */
  getLogFiles(): string[] {
    const files: string[] = [];
    const entries = fs.readdirSync(this.logDirectory);

    for (const entry of entries) {
      if (entry.startsWith(this.logFileName)) {
        files.push(path.join(this.logDirectory, entry));
      }
    }

    return files.sort();
  }
}

// 创建单例
const logService = new LogService();

export default logService;
