/**
 * Image Cropper Plugin
 */

export { default } from './ImageCropper';
export const imageCropperManifest = {
  id: 'com.desktop-tool.plugin.image-cropper',
  name: '图片裁剪',
  description: '图片裁剪工具，支持多种比例裁剪和尺寸调整',
  icon: '✂️',
  version: '1.0.0',
  author: 'Desktop Tool',
  category: '设计',
  entry: './ImageCropper',
};
