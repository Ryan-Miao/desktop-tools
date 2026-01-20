/**
 * JSON Diff Plugin
 */

export { default } from './JsonDiff';
export const jsonDiffManifest = {
  id: 'com.desktop-tool.plugin.json-diff',
  name: 'JSON差异比较',
  description: '比较两个JSON对象的差异，支持高亮显示新增、删除和修改的字段',
  icon: '🔄',
  version: '1.0.0',
  author: 'Desktop Tool',
  category: '实用工具',
  entry: './JsonDiff',
};
