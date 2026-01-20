/**
 * Shadow Designer Plugin
 */

export { default } from './ShadowDesigner';
export const shadowDesignerManifest = {
  id: 'com.desktop-tool.plugin.shadow-designer',
  name: '阴影设计',
  description: 'CSS box-shadow生成器，支持多层阴影和预设效果',
  icon: '🔲',
  version: '1.0.0',
  author: 'Desktop Tool',
  category: '设计',
  entry: './ShadowDesigner',
};
