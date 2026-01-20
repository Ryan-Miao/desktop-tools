/**
 * Gradient Generator Plugin
 */

export { default } from './GradientGenerator';
export const gradientGeneratorManifest = {
  id: 'com.desktop-tool.plugin.gradient-generator',
  name: '渐变生成器',
  description: 'CSS渐变代码生成器，支持线性和径向渐变',
  icon: '🎨',
  version: '1.0.0',
  author: 'Desktop Tool',
  category: '设计',
  entry: './GradientGenerator',
};
