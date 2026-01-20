/**
 * Ruler Plugin
 */

export { default } from './Ruler';
export const rulerManifest = {
  id: 'com.desktop-tool.plugin.ruler',
  name: '屏幕尺子',
  description: '屏幕测量工具，支持水平/垂直标尺，像素级精度测量',
  icon: '📏',
  version: '1.0.0',
  author: 'Desktop Tool',
  category: '工具',
  entry: './Ruler',
};
