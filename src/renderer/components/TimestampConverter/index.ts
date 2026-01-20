/**
 * Timestamp Converter Plugin
 */

export { default } from './TimestampConverter';
export const timestampConverterManifest = {
  id: 'com.desktop-tool.plugin.timestamp-converter',
  name: '时间戳转换',
  description: 'Unix时间戳与日期时间相互转换，支持实时更新',
  icon: '⏱️',
  version: '1.0.0',
  author: 'Desktop Tool',
  category: '实用工具',
  entry: './TimestampConverter',
};
