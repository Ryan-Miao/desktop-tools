/**
 * Stopwatch/Timer Plugin
 */

export { default } from './Stopwatch';
export const stopwatchManifest = {
  id: 'com.desktop-tool.plugin.stopwatch',
  name: '秒表',
  description: '精确计时工具，支持秒表、倒计时器和计次功能',
  icon: '⏱️',
  version: '1.0.0',
  author: 'Desktop Tool',
  category: '办公效率',
  entry: './Stopwatch',
};
