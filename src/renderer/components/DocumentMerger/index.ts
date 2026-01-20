/**
 * Document Merger Plugin
 */

export { default } from './DocumentMerger';
export const documentMergerManifest = {
  id: 'com.desktop-tool.plugin.document-merger',
  name: '文档合并',
  description: '合并多个文本文件，支持拖拽排序和自定义分隔符',
  icon: '📄',
  version: '1.0.0',
  author: 'Desktop Tool',
  category: '实用工具',
  entry: './DocumentMerger',
};
