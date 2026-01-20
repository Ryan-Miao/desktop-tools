/**
 * Animation Generator Plugin
 */

export { default } from './AnimationGenerator';
export const animationGeneratorManifest = {
  id: 'com.desktop-tool.plugin.animation-generator',
  name: 'CSS动画生成器',
  description: 'CSS关键帧动画生成器，支持时间轴编辑和预设动画库',
  icon: '🎭',
  version: '1.0.0',
  author: 'Desktop Tool',
  category: '设计',
  entry: './AnimationGenerator',
};
