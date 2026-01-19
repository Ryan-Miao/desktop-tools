/**
 * npm Registry API 客户端
 * 用于搜索、查询 npm 包信息
 */

import { createLogger } from '../../shared/logger';
import type {
  NpmPackage,
  NpmPackageInfo,
  NpmSearchResponse,
  DesktopToolConfig
} from '../../shared/types/npm';

const logger = createLogger('NpmService');

/**
 * npm 服务类
 */
export class NpmService {
  private readonly registryUrl: string;
  private readonly searchKeyword = 'desktop-tool-plugin';

  constructor(registryUrl: string = 'https://registry.npmjs.org') {
    this.registryUrl = registryUrl;
  }

  /**
   * 搜索 npm 包
   * @param keyword 搜索关键词
   * @returns 符合条件的桌面工具插件列表
   */
  async search(keyword: string): Promise<NpmPackage[]> {
    try {
      logger.info(`Searching npm packages: ${keyword}`);

      const searchUrl = `${this.registryUrl}/-/v1/search?text=${encodeURIComponent(keyword)}&size=20`;
      const response = await fetch(searchUrl);

      if (!response.ok) {
        throw new Error(`npm search failed: ${response.statusText}`);
      }

      const data: NpmSearchResponse = await response.json();

      // 过滤出桌面工具插件（包含 desktop-tool-plugin keyword）
      const desktopToolPlugins = data.objects
        .filter(obj => {
          const keywords = obj.package.keywords || [];
          return keywords.includes(this.searchKeyword);
        })
        .map(obj => ({
          name: obj.package.name,
          version: obj.package.version,
          description: obj.package.description || '',
          author: obj.package.author,
          keywords: obj.package.keywords,
          links: {
            npm: `https://www.npmjs.com/package/${obj.package.name}`,
            homepage: obj.package.links?.homepage,
            repository: obj.package.links?.repository,
          }
        }));

      logger.info(`Found ${desktopToolPlugins.length} desktop-tool plugins`, {
        plugins: desktopToolPlugins.map(p => p.name)
      });

      return desktopToolPlugins;
    } catch (error) {
      logger.error('Failed to search npm packages', { error, keyword });
      throw error;
    }
  }

  /**
   * 获取包详细信息
   * @param packageName 包名
   * @returns 包详细信息
   */
  async getPackageInfo(packageName: string): Promise<NpmPackageInfo> {
    try {
      logger.info(`Fetching package info: ${packageName}`);

      const response = await fetch(`${this.registryUrl}/${packageName}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch package info: ${response.statusText}`);
      }

      const data = await response.json();

      // 获取最新版本的信息
      const latestVersion = data['dist-tags']?.latest;
      if (!latestVersion) {
        throw new Error('No latest version found');
      }

      const versionInfo = data.versions[latestVersion];
      if (!versionInfo) {
        throw new Error(`Version ${latestVersion} not found`);
      }

      const packageInfo: NpmPackageInfo = {
        name: data.name,
        version: latestVersion,
        description: versionInfo.description || '',
        author: versionInfo.author || data.author,
        keywords: versionInfo.keywords || [],
        homepage: versionInfo.homepage,
        repository: versionInfo.repository,
        bugs: versionInfo.bugs,
        license: versionInfo.license,
        desktopTool: versionInfo.desktopTool as DesktopToolConfig | undefined,
        dist: versionInfo.dist
      };

      logger.info(`Package info fetched: ${packageName}`, {
        version: latestVersion,
        hasDesktopToolConfig: !!packageInfo.desktopTool
      });

      return packageInfo;
    } catch (error) {
      logger.error('Failed to fetch package info', { error, packageName });
      throw error;
    }
  }

  /**
   * 验证包是否是桌面工具插件
   * @param packageName 包名
   * @returns 是否是有效的桌面工具插件
   */
  async validatePlugin(packageName: string): Promise<boolean> {
    try {
      const info = await this.getPackageInfo(packageName);

      // 检查是否包含 desktop-tool-plugin 关键词
      // 注意：npm registry 会过滤非标准字段，所以 desktopTool 可能为 null
      // 实际的配置将从加载的模块 manifest 中读取
      const hasKeyword = info.keywords.includes(this.searchKeyword);

      logger.info(`Plugin validation result: ${packageName}`, {
        isValid: hasKeyword,
        hasKeyword,
        keywords: info.keywords
      });

      return hasKeyword;
    } catch (error) {
      logger.error('Failed to validate plugin', { error, packageName });
      return false;
    }
  }

  /**
   * 获取包的所有可用版本
   * @param packageName 包名
   * @returns 版本列表
   */
  async getVersions(packageName: string): Promise<string[]> {
    try {
      logger.info(`Fetching package versions: ${packageName}`);

      const response = await fetch(`${this.registryUrl}/${packageName}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch versions: ${response.statusText}`);
      }

      const data = await response.json();
      const versions = Object.keys(data.versions || {});

      logger.info(`Found ${versions.length} versions for ${packageName}`);

      // 按版本号降序排序
      return versions.sort((a, b) => {
        const versionA = a.split('.').map(Number);
        const versionB = b.split('.').map(Number);

        for (let i = 0; i < Math.max(versionA.length, versionB.length); i++) {
          const numA = versionA[i] || 0;
          const numB = versionB[i] || 0;
          if (numA !== numB) {
            return numB - numA; // 降序
          }
        }
        return 0;
      });
    } catch (error) {
      logger.error('Failed to fetch versions', { error, packageName });
      throw error;
    }
  }

  /**
   * 获取包的 tarball URL
   * @param packageName 包名
   * @param version 版本
   * @returns tarball URL
   */
  async getTarballUrl(packageName: string, version?: string): Promise<string> {
    try {
      const info = await this.getPackageInfo(packageName);
      const targetVersion = version || info.version;

      // 从 dist 信息中获取 tarball URL
      if (info.dist?.tarball) {
        return info.dist.tarball;
      }

      // 构造默认的 tarball URL
      return `https://registry.npmjs.org/${packageName}/-/${packageName.replace('@', '').replace('/', '-')}-${targetVersion}.tgz`;
    } catch (error) {
      logger.error('Failed to get tarball URL', { error, packageName, version });
      throw error;
    }
  }
}

// 导出单例实例
export const npmService = new NpmService();
