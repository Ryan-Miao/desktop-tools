import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import { createLogger } from '../../shared/logger';

const logger = createLogger('FileStorageService');

/**
 * 文件存储服务
 * 为插件提供基于文件系统的数据持久化
 */
export class FileStorageService {
  private dataDir: string;

  constructor() {
    // 使用userData目录下的plugins文件夹存储插件数据
    this.dataDir = path.join(app.getPath('userData'), 'plugins-data');
    this.ensureDataDir();
  }

  /**
   * 确保数据目录存在
   */
  private ensureDataDir(): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
      logger.info(`Created plugin data directory: ${this.dataDir}`);
    }
  }

  /**
   * 获取插件数据文件路径
   */
  private getPluginFilePath(pluginId: string): string {
    return path.join(this.dataDir, `${pluginId}.json`);
  }

  /**
   * 保存插件数据
   */
  savePluginData(pluginId: string, data: any): { success: boolean; error?: string } {
    try {
      const filePath = this.getPluginFilePath(pluginId);

      // 添加元数据
      const dataWithMeta = {
        __meta: {
          version: '1.0.0',
          pluginId,
          savedAt: new Date().toISOString(),
          appVersion: app.getVersion()
        },
        ...data
      };

      fs.writeFileSync(
        filePath,
        JSON.stringify(dataWithMeta, null, 2),
        'utf-8'
      );

      logger.debug(`Saved plugin data: ${pluginId}`, {
        filePath,
        size: JSON.stringify(dataWithMeta).length
      });

      return { success: true };
    } catch (error) {
      logger.error(`Failed to save plugin data: ${pluginId}`, { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 加载插件数据
   */
  loadPluginData<T = any>(pluginId: string): { success: boolean; data?: T; error?: string } {
    try {
      const filePath = this.getPluginFilePath(pluginId);

      if (!fs.existsSync(filePath)) {
        logger.debug(`Plugin data file not found: ${pluginId}`);
        return { success: false, error: 'File not found' };
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);

      // 移除元数据
      const { __meta, ...cleanData } = data;

      logger.debug(`Loaded plugin data: ${pluginId}`, {
        filePath,
        size: content.length
      });

      return { success: true, data: cleanData as T };
    } catch (error) {
      logger.error(`Failed to load plugin data: ${pluginId}`, { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 删除插件数据
   */
  deletePluginData(pluginId: string): { success: boolean; error?: string } {
    try {
      const filePath = this.getPluginFilePath(pluginId);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logger.info(`Deleted plugin data: ${pluginId}`);
      }

      return { success: true };
    } catch (error) {
      logger.error(`Failed to delete plugin data: ${pluginId}`, { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 检查插件数据是否存在
   */
  hasPluginData(pluginId: string): boolean {
    const filePath = this.getPluginFilePath(pluginId);
    return fs.existsSync(filePath);
  }

  /**
   * 获取所有插件数据文件列表
   */
  getAllPluginDataFiles(): Array<{
    pluginId: string;
    filePath: string;
    size: number;
    modifiedAt: Date;
  }> {
    try {
      const files = fs.readdirSync(this.dataDir);
      return files
        .filter(file => file.endsWith('.json'))
        .map(file => {
          const filePath = path.join(this.dataDir, file);
          const stats = fs.statSync(filePath);
          return {
            pluginId: file.replace('.json', ''),
            filePath,
            size: stats.size,
            modifiedAt: stats.mtime
          };
        });
    } catch (error) {
      logger.error('Failed to list plugin data files', { error });
      return [];
    }
  }

  /**
   * 导出插件数据到指定路径
   */
  exportPluginData(pluginId: string, exportPath: string): { success: boolean; error?: string } {
    try {
      const sourcePath = this.getPluginFilePath(pluginId);

      if (!fs.existsSync(sourcePath)) {
        return { success: false, error: 'Plugin data not found' };
      }

      fs.copyFileSync(sourcePath, exportPath);
      logger.info(`Exported plugin data: ${pluginId} -> ${exportPath}`);

      return { success: true };
    } catch (error) {
      logger.error(`Failed to export plugin data: ${pluginId}`, { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 从指定路径导入插件数据
   */
  importPluginData(pluginId: string, importPath: string): { success: boolean; error?: string } {
    try {
      if (!fs.existsSync(importPath)) {
        return { success: false, error: 'Import file not found' };
      }

      const targetPath = this.getPluginFilePath(pluginId);

      // 验证导入的文件是有效的JSON
      const content = fs.readFileSync(importPath, 'utf-8');
      JSON.parse(content); // 验证JSON格式

      fs.copyFileSync(importPath, targetPath);
      logger.info(`Imported plugin data: ${importPath} -> ${pluginId}`);

      return { success: true };
    } catch (error) {
      logger.error(`Failed to import plugin data: ${pluginId}`, { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 获取数据目录路径
   */
  getDataDirectory(): string {
    return this.dataDir;
  }

  /**
   * 在文件管理器中打开数据目录
   */
  openDataDirectory(): { success: boolean; error?: string } {
    try {
      const { shell } = require('electron');
      shell.openPath(this.dataDir);
      return { success: true };
    } catch (error) {
      logger.error('Failed to open data directory', { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// 导出单例
export const fileStorageService = new FileStorageService();
