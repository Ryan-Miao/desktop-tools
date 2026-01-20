/**
 * Quick Note Plugin
 */

export { default } from './QuickNote';
export const quickNoteManifest = {
  id: 'com.desktop-tool.plugin.quick-note',
  name: '快速笔记',
  description: '快速记录临时笔记和想法，支持多笔记管理、搜索和自动保存',
  icon: '📝',
  version: '1.0.0',
  author: 'Desktop Tool',
  category: '办公效率',
  entry: './QuickNote',
};
