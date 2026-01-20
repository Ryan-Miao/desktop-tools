/**
 * QR Code Generator Plugin
 */

export { default } from './QRCodeGenerator';
export const qrCodeGeneratorManifest = {
  id: 'com.desktop-tool.plugin.qrcode-generator',
  name: '二维码生成器',
  description: '快速生成二维码，支持文本、网址、邮箱、电话和WiFi配置',
  icon: '📱',
  version: '1.0.0',
  author: 'Desktop Tool',
  category: '工具',
  entry: './QRCodeGenerator',
};
