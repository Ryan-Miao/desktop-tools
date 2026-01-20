/**
 * Color Picker Plugin
 */

export { default } from './ColorPicker';
export const colorPickerManifest = {
  id: 'com.desktop-tool.plugin.color-picker',
  name: '取色器',
  description: '专业取色工具，支持屏幕取色、HEX、RGB、HSL格式转换',
  icon: '🎨',
  version: '1.0.0',
  author: 'Desktop Tool',
  category: '工具',
  entry: './ColorPicker',
};
