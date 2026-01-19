/**
 * npm 包相关类型定义
 */

/**
 * npm 包搜索结果
 */
export interface NpmPackage {
  name: string;
  version: string;
  description: string;
  author: NpmAuthor;
  keywords: string[];
  links?: NpmLinks;
}

/**
 * npm 作者信息
 */
export type NpmAuthor = string | {
  name: string;
  email?: string;
  url?: string;
};

/**
 * npm 包链接
 */
export interface NpmLinks {
  npm?: string;
  homepage?: string;
  repository?: string;
  bugs?: string;
}

/**
 * npm 包详细信息（从 registry 获取）
 */
export interface NpmPackageInfo {
  name: string;
  version: string;
  description: string;
  author: NpmAuthor;
  keywords: string[];
  homepage?: string;
  repository?: NpmRepository;
  bugs?: NpmBugs;
  license?: string;
  desktopTool?: DesktopToolConfig;
  dist?: NpmDistInfo;
}

/**
 * npm 仓库信息
 */
export interface NpmRepository {
  type: string;
  url: string;
}

/**
 * npm bugs 信息
 */
export interface NpmBugs {
  url: string;
  email?: string;
}

/**
 * 桌面工具插件配置（package.json 中的 desktop-tool 字段）
 */
export interface DesktopToolConfig {
  id: string;
  entry: string;
  manifest?: string;
}

/**
 * npm 分发信息
 */
export interface NpmDistInfo {
  tarball: string;
  shasum: string;
  integrity?: string;
}

/**
 * npm registry 搜索响应
 */
export interface NpmSearchResponse {
  objects: Array<{
    package: NpmPackage;
    score: NpmScore;
    searchScore: number;
  }>;
  total: number;
  time: string;
}

/**
 * npm 包评分
 */
export interface NpmScore {
  final: number;
  detail: {
    quality: number;
    popularity: number;
    maintenance: number;
  };
}

/**
 * 已安装的远程插件信息
 */
export interface InstalledRemotePlugin {
  id: string;
  packageName: string;
  version: string;
  installedAt: string;
  manifest?: any;
}

/**
 * 远程插件加载结果
 */
export interface RemotePluginLoadResult {
  component: React.ComponentType<any>;
  manifest: any;
  packageName: string;
  version: string;
}

/**
 * CDN 提供商
 */
export type CDNProvider = 'esm.sh' | 'jsdelivr' | 'unpkg';

/**
 * CDN 配置
 */
export interface CDNConfig {
  provider: CDNProvider;
  baseUrl: string;
  buildUrl: (packageName: string, version?: string, path?: string) => string;
}

/**
 * CDN 配置映射
 */
export const CDN_CONFIGS: Record<CDNProvider, CDNConfig> = {
  'esm.sh': {
    provider: 'esm.sh',
    baseUrl: 'https://esm.sh',
    buildUrl: (pkg, ver, path) => {
      const version = ver ? `@${ver}` : '';
      const filePath = path || '';
      return `https://esm.sh/${pkg}${version}/${filePath}`;
    }
  },
  'jsdelivr': {
    provider: 'jsdelivr',
    baseUrl: 'https://cdn.jsdelivr.net/npm',
    buildUrl: (pkg, ver, path) => {
      const version = ver ? `@${ver}` : '';
      const filePath = path || '';
      return `https://cdn.jsdelivr.net/npm/${pkg}${version}/${filePath}`;
    }
  },
  'unpkg': {
    provider: 'unpkg',
    baseUrl: 'https://unpkg.com',
    buildUrl: (pkg, ver, path) => {
      const version = ver ? `@${ver}` : '';
      const filePath = path || '';
      return `https://unpkg.com/${pkg}${version}/${filePath}`;
    }
  }
};

/**
 * 默认 CDN 提供商
 */
export const DEFAULT_CDN: CDNProvider = 'esm.sh';
