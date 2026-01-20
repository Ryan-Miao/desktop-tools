/**
 * World Clock Plugin
 */

export { default } from './WorldClock';
export const worldClockManifest = {
  id: 'com.desktop-tool.plugin.world-clock',
  name: '世界时钟',
  description: '多时区时钟，显示世界主要城市时间，支持模拟时钟和数字时间',
  icon: '🌍',
  version: '1.0.0',
  author: 'Desktop Tool',
  category: '工具',
  entry: './WorldClock',
};
