/**
 * Keyboard Shortcuts Plugin
 */

export { default } from './KeyboardShortcuts';
export const keyboardShortcutsManifest = {
  id: 'com.desktop-tool.plugin.keyboard-shortcuts',
  name: '快捷键指南',
  description: '常用应用快捷键查询和参考工具，支持分类和平台筛选',
  icon: '⌨️',
  version: '1.0.0',
  author: 'Desktop Tool',
  category: '办公效率',
  entry: './KeyboardShortcuts',
};
