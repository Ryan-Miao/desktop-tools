/**
 * Color Extractor Plugin
 */

export { default } from './ColorExtractor';
export const colorExtractorManifest = {
  id: 'com.desktop-tool.plugin.color-extractor',
  name: '颜色提取',
  description: '从图片提取主色调和配色方案，支持多种颜色格式',
  icon: '🌈',
  version: '1.0.0',
  author: 'Desktop Tool',
  category: '设计',
  entry: './ColorExtractor',
};
