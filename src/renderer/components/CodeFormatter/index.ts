/**
 * Code Formatter Plugin
 */

export { default } from './CodeFormatter';
export const codeFormatterManifest = {
  id: 'com.desktop-tool.plugin.code-formatter',
  name: 'Code Formatter',
  description: '专业代码格式化工具，支持 JSON、XML、SQL、HTML、CSS 格式化与验证',
  icon: '✨',
  version: '1.0.0',
  author: 'Desktop Tool',
  category: 'utility',
  entry: './CodeFormatter',
};
