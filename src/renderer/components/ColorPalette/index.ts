/**
 * Color Palette Generator Plugin
 */

export { default } from './ColorPalette';
export const colorPaletteManifest = {
  id: 'com.desktop-tool.plugin.color-palette',
  name: '配色方案',
  description: '专业配色方案生成器，支持多种配色算法和导出功能',
  icon: '🎨',
  version: '1.0.0',
  author: 'Desktop Tool',
  category: '设计',
  entry: './ColorPalette',
};
