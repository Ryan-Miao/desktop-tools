/**
 * JSON to TypeScript Converter Plugin
 */

export { default } from './JsonToTs';
export const jsonToTsManifest = {
  id: 'com.desktop-tool.plugin.json-to-ts',
  name: 'JSON转TypeScript',
  description: '将JSON对象转换为TypeScript接口和类型定义',
  icon: '🔄',
  version: '1.0.0',
  author: 'Desktop Tool',
  category: '开发工具',
  entry: './JsonToTs',
};
