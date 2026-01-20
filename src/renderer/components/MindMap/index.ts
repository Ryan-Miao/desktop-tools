/**
 * Mind Map Plugin
 */

export { default } from './MindMap';
export const mindMapManifest = {
  id: 'com.desktop-tool.plugin.mind-map',
  name: '思维导图',
  description: '创建和编辑思维导图，支持节点折叠和层级管理',
  icon: '📝',
  version: '1.0.0',
  author: 'Desktop Tool',
  category: '办公效率',
  entry: './MindMap',
};
