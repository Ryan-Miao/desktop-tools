/**
 * UUID Generator Plugin
 */

export { default } from './UuidGenerator';
export const uuidGeneratorManifest = {
  id: 'com.desktop-tool.plugin.uuid-generator',
  name: 'UUID生成器',
  description: '生成各种格式的UUID，支持批量生成和自定义格式',
  icon: '🧪',
  version: '1.0.0',
  author: 'Desktop Tool',
  category: '实用工具',
  entry: './UuidGenerator',
};
