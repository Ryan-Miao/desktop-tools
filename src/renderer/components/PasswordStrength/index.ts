/**
 * Password Strength Checker Plugin
 */

export { default } from './PasswordStrength';
export const passwordStrengthManifest = {
  id: 'com.desktop-tool.plugin.password-strength',
  name: 'Password Strength',
  description: '专业密码强度检测工具，实时分析密码安全性并提供改进建议',
  icon: '🔐',
  version: '1.0.0',
  author: 'Desktop Tool',
  category: 'security',
  entry: './PasswordStrength',
};
