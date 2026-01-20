/**
 * Regex Tester Plugin
 */

export { default } from './RegexTester';
export const regexTesterManifest = {
  id: 'com.desktop-tool.plugin.regex-tester',
  name: '正则测试器',
  description: '实时正则表达式测试和调试工具，支持匹配高亮',
  icon: '🔍',
  version: '1.0.0',
  author: 'Desktop Tool',
  category: '开发工具',
  entry: './RegexTester',
};
