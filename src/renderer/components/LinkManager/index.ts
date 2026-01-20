/**
 * Link Manager Plugin
 */

export { default } from './LinkManager';
export const linkManagerManifest = {
  id: 'com.desktop-tool.plugin.link-manager',
  name: '链接管理',
  description: '保存和整理常用链接，支持分类和标签管理',
  icon: '🔗',
  version: '1.0.0',
  author: 'Desktop Tool',
  category: '实用工具',
  entry: './LinkManager',
};
