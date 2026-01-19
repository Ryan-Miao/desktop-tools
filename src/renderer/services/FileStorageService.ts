/**
 * 文件存储服务（渲染进程）
 * 通过IPC与主进程通信，实现插件数据的文件存储
 */

import { createLogger } from '../../shared/logger';

const logger = createLogger('FileStorageService');

interface FileStorageResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

class FileStorageService {
  /**
   * 保存插件数据
   */
  async savePluginData(pluginId: string, data: any): Promise<boolean> {
    try {
      if (!window.electron?.ipcRenderer) {
        logger.warn('IPC not available, falling back to localStorage');
        // Fallback to localStorage
        localStorage.setItem(`${pluginId}-file-backup`, JSON.stringify(data));
        return false;
      }

      const result = await window.electron.ipcRenderer.invoke(
        'file-storage:save',
        pluginId,
        data
      );

      if (!result.success) {
        logger.error(`Failed to save plugin data: ${pluginId}`, { error: result.error });
        return false;
      }

      return true;
    } catch (error) {
      logger.error(`Failed to save plugin data: ${pluginId}`, { error });
      return false;
    }
  }

  /**
   * 加载插件数据
   */
  async loadPluginData<T = any>(pluginId: string): Promise<T | null> {
    try {
      if (!window.electron?.ipcRenderer) {
        logger.warn('IPC not available, falling back to localStorage');
        // Fallback to localStorage
        const backup = localStorage.getItem(`${pluginId}-file-backup`);
        return backup ? JSON.parse(backup) : null;
      }

      const result = await window.electron.ipcRenderer.invoke(
        'file-storage:load',
        pluginId
      );

      if (!result.success) {
        logger.debug(`Plugin data not found: ${pluginId}`);
        return null;
      }

      return result.data || null;
    } catch (error) {
      logger.error(`Failed to load plugin data: ${pluginId}`, { error });
      return null;
    }
  }

  /**
   * 删除插件数据
   */
  async deletePluginData(pluginId: string): Promise<boolean> {
    try {
      if (!window.electron?.ipcRenderer) {
        logger.warn('IPC not available');
        return false;
      }

      const result = await window.electron.ipcRenderer.invoke(
        'file-storage:delete',
        pluginId
      );

      if (!result.success) {
        logger.error(`Failed to delete plugin data: ${pluginId}`, { error: result.error });
        return false;
      }

      return true;
    } catch (error) {
      logger.error(`Failed to delete plugin data: ${pluginId}`, { error });
      return false;
    }
  }

  /**
   * 检查插件数据是否存在
   */
  async hasPluginData(pluginId: string): Promise<boolean> {
    try {
      if (!window.electron?.ipcRenderer) {
        return false;
      }

      const result = await window.electron.ipcRenderer.invoke(
        'file-storage:exists',
        pluginId
      );

      return result;
    } catch (error) {
      logger.error(`Failed to check plugin data: ${pluginId}`, { error });
      return false;
    }
  }

  /**
   * 获取所有插件数据文件列表
   */
  async getAllPluginDataFiles(): Promise<Array<{
    pluginId: string;
    filePath: string;
    size: number;
    modifiedAt: Date;
  }>> {
    try {
      if (!window.electron?.ipcRenderer) {
        return [];
      }

      const result = await window.electron.ipcRenderer.invoke('file-storage:list');
      return result || [];
    } catch (error) {
      logger.error('Failed to list plugin data files', { error });
      return [];
    }
  }

  /**
   * 导出插件数据
   */
  async exportPluginData(pluginId: string, exportPath?: string): Promise<boolean> {
    try {
      if (!window.electron?.ipcRenderer) {
        return false;
      }

      // 如果没有指定路径，使用默认路径
      const path = exportPath || `${pluginId}-${Date.now()}.json`;

      const result = await window.electron.ipcRenderer.invoke(
        'file-storage:export',
        pluginId,
        path
      );

      if (!result.success) {
        logger.error(`Failed to export plugin data: ${pluginId}`, { error: result.error });
        return false;
      }

      return true;
    } catch (error) {
      logger.error(`Failed to export plugin data: ${pluginId}`, { error });
      return false;
    }
  }

  /**
   * 导入插件数据
   */
  async importPluginData(pluginId: string, importPath: string): Promise<boolean> {
    try {
      if (!window.electron?.ipcRenderer) {
        return false;
      }

      const result = await window.electron.ipcRenderer.invoke(
        'file-storage:import',
        pluginId,
        importPath
      );

      if (!result.success) {
        logger.error(`Failed to import plugin data: ${pluginId}`, { error: result.error });
        return false;
      }

      return true;
    } catch (error) {
      logger.error(`Failed to import plugin data: ${pluginId}`, { error });
      return false;
    }
  }

  /**
   * 获取数据目录路径
   */
  async getDataDirectory(): Promise<string> {
    try {
      if (!window.electron?.ipcRenderer) {
        return '';
      }

      return await window.electron.ipcRenderer.invoke('file-storage:get-directory');
    } catch (error) {
      logger.error('Failed to get data directory', { error });
      return '';
    }
  }

  /**
   * 打开数据目录
   */
  async openDataDirectory(): Promise<boolean> {
    try {
      if (!window.electron?.ipcRenderer) {
        return false;
      }

      const result = await window.electron.ipcRenderer.invoke('file-storage:open-directory');
      return result.success;
    } catch (error) {
      logger.error('Failed to open data directory', { error });
      return false;
    }
  }

  /**
   * 从localStorage迁移数据到文件存储
   */
  async migrateFromLocalStorage(
    pluginId: string,
    localStorageKey: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // 从localStorage读取数据
      const localStorageData = localStorage.getItem(localStorageKey);
      if (!localStorageData) {
        return { success: false, error: 'No data found in localStorage' };
      }

      const data = JSON.parse(localStorageData);

      // 保存到文件存储
      const saved = await this.savePluginData(pluginId, data);
      if (!saved) {
        return { success: false, error: 'Failed to save to file storage' };
      }

      // 保留localStorage备份
      localStorage.setItem(`${localStorageKey}-migrated-backup`, localStorageData);
      logger.info(`Migrated plugin data from localStorage: ${pluginId}`);

      return { success: true };
    } catch (error) {
      logger.error(`Failed to migrate plugin data: ${pluginId}`, { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// 导出单例
export const fileStorageService = new FileStorageService();
