/**
 * File Hash Plugin
 */

export { default } from './FileHash';
export const fileHashManifest = {
  id: 'com.desktop-tool.plugin.file-hash',
  name: '文件哈希',
  description: '计算文件哈希值，支持MD5、SHA-1、SHA-256算法',
  icon: '📦',
  version: '1.0.0',
  author: 'Desktop Tool',
  category: '实用工具',
  entry: './FileHash',
};
