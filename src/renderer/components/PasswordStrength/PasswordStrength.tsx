/**
 * Password Strength Checker Plugin
 *
 * Professional password strength analyzer with visual feedback
 */

import React, { useState, useCallback, useEffect } from 'react';
import PluginWindow from '../PluginWindow/PluginWindow';
import styles from './PasswordStrength.module.css';

interface PasswordStrengthProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

interface StrengthResult {
  score: number;
  level: 'weak' | 'fair' | 'good' | 'strong';
  color: string;
  label: string;
  suggestions: string[];
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({
  onClose,
  onMinimize,
  onMaximize,
}) => {
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<StrengthResult | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [length, setLength] = useState(16);

  // Calculate password strength
  const calculateStrength = useCallback((pwd: string): StrengthResult => {
    let score = 0;
    const suggestions: string[] = [];

    // Length check
    if (pwd.length >= 8) score += 1;
    else if (pwd.length > 0) suggestions.push('密码长度至少8位');

    if (pwd.length >= 12) score += 1;
    if (pwd.length >= 16) score += 1;

    // Character variety
    const hasLower = /[a-z]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pwd);

    if (hasLower) score += 1;
    else if (pwd.length > 0) suggestions.push('添加小写字母');

    if (hasUpper) score += 1;
    else if (pwd.length > 0) suggestions.push('添加大写字母');

    if (hasNumber) score += 1;
    else if (pwd.length > 0) suggestions.push('添加数字');

    if (hasSpecial) score += 1;
    else if (pwd.length > 0) suggestions.push('添加特殊字符 (!@#$%^&*)');

    // Complexity bonus
    if (hasLower && hasUpper && hasNumber && hasSpecial) score += 2;

    // No common patterns
    const commonPatterns = ['123456', 'password', 'qwerty', 'abc123', 'admin'];
    if (!commonPatterns.some(pattern => pwd.toLowerCase().includes(pattern))) {
      score += 1;
    } else {
      suggestions.push('避免使用常见密码模式');
    }

    // Determine level
    let level: 'weak' | 'fair' | 'good' | 'strong';
    let color: string;
    let label: string;

    if (score <= 2) {
      level = 'weak';
      color = '#ef4444';
      label = '弱';
    } else if (score <= 4) {
      level = 'fair';
      color = '#f59e0b';
      label = '一般';
    } else if (score <= 6) {
      level = 'good';
      color = '#3b82f6';
      label = '良好';
    } else {
      level = 'strong';
      color = '#10b981';
      label = '强';
    }

    return { score, level, color, label, suggestions };
  }, []);

  // Update strength when password changes
  useEffect(() => {
    if (password) {
      setResult(calculateStrength(password));
    } else {
      setResult(null);
    }
  }, [password, calculateStrength]);

  // Generate strong password
  const generatePassword = useCallback(() => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    const all = lowercase + uppercase + numbers + special;
    let pwd = '';

    // Ensure at least one of each type
    pwd += lowercase[Math.floor(Math.random() * lowercase.length)];
    pwd += uppercase[Math.floor(Math.random() * uppercase.length)];
    pwd += numbers[Math.floor(Math.random() * numbers.length)];
    pwd += special[Math.floor(Math.random() * special.length)];

    // Fill remaining length
    for (let i = 4; i < length; i++) {
      pwd += all[Math.floor(Math.random() * all.length)];
    }

    // Shuffle
    setPassword(pwd.split('').sort(() => Math.random() - 0.5).join(''));
  }, [length]);

  // Copy to clipboard
  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(password);
    announceToScreenReader('已复制密码');
  }, [password]);

  return (
    <PluginWindow
      title="密码强度检测"
      icon="🔐"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      className="password-strength-standalone"
      pluginId="password-strength"
      showStandaloneButton={false}
    >
      <div className={styles.passwordStrength}>
        {/* Password Input */}
        <div className={styles.inputSection}>
          <label htmlFor="password-input">输入密码</label>
          <div className={styles.passwordInputGroup}>
            <input
              id="password-input"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.passwordInput}
              placeholder="输入密码检测强度..."
              autoComplete="off"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className={styles.toggleButton}
              aria-label={showPassword ? '隐藏密码' : '显示密码'}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
            {password && (
              <button
                onClick={copyToClipboard}
                className={styles.copyButton}
                aria-label="复制密码"
              >
                📋
              </button>
            )}
          </div>
        </div>

        {/* Strength Meter */}
        {result && (
          <div className={styles.strengthMeter}>
            <div className={styles.strengthHeader}>
              <span className={styles.strengthLabel}>密码强度</span>
              <span
                className={styles.strengthLevel}
                style={{ color: result.color }}
              >
                {result.label}
              </span>
            </div>
            <div className={styles.strengthBarContainer}>
              <div
                className={styles.strengthBar}
                style={{
                  width: `${(result.score / 9) * 100}%`,
                  backgroundColor: result.color,
                }}
              />
            </div>
            <div className={styles.strengthScore}>
              得分: {result.score}/9
            </div>
          </div>
        )}

        {/* Suggestions */}
        {result && result.suggestions.length > 0 && (
          <div className={styles.suggestions}>
            <h4>改进建议</h4>
            <ul>
              {result.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Password Generator */}
        <div className={styles.generator}>
          <h3>密码生成器</h3>

          <div className={styles.lengthControl}>
            <label htmlFor="length-slider">密码长度: {length}</label>
            <input
              id="length-slider"
              type="range"
              min="8"
              max="32"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className={styles.slider}
            />
          </div>

          <div className={styles.generatorActions}>
            <button
              onClick={generatePassword}
              className={styles.generateButton}
              aria-label="生成强密码"
            >
              🎲 生成强密码
            </button>
            {password && (
              <button
                onClick={copyToClipboard}
                className={styles.copyButton}
                aria-label="复制生成的密码"
              >
                📋 复制
              </button>
            )}
          </div>

          {/* Requirements Checklist */}
          <div className={styles.requirements}>
            <h4>密码要求</h4>
            <div className={styles.requirementItems}>
              <RequirementCheck
                label="至少8位"
                pass={password.length >= 8}
              />
              <RequirementCheck
                label="包含小写字母"
                pass={/[a-z]/.test(password)}
              />
              <RequirementCheck
                label="包含大写字母"
                pass={/[A-Z]/.test(password)}
              />
              <RequirementCheck
                label="包含数字"
                pass={/\d/.test(password)}
              />
              <RequirementCheck
                label="包含特殊字符"
                pass={/[^a-zA-Z0-9]/.test(password)}
              />
              <RequirementCheck
                label="至少16位"
                pass={password.length >= 16}
              />
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className={styles.tips}>
          <h4>💡 安全提示</h4>
          <ul>
            <li>使用密码管理器存储不同的密码</li>
            <li>避免在多个网站使用相同密码</li>
            <li>定期更新重要账户的密码</li>
            <li>启用双重验证（2FA）增加安全性</li>
          </ul>
        </div>
      </div>
    </PluginWindow>
  );
};

// Requirement check component
const RequirementCheck: React.FC<{ label: string; pass: boolean }> = ({
  label,
  pass,
}) => (
  <div className={`${styles.requirement} ${pass ? styles.pass : ''}`}>
    <span className={styles.icon}>{pass ? '✅' : '⭕'}</span>
    <span className={styles.label}>{label}</span>
  </div>
);

// Screen reader announcement helper
function announceToScreenReader(message: string) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.className = 'sr-only';
  announcement.style.position = 'absolute';
  announcement.style.left = '-10000px';
  announcement.style.width = '1px';
  announcement.style.height = '1px';
  announcement.style.overflow = 'hidden';
  announcement.textContent = message;
  document.body.appendChild(announcement);
  setTimeout(() => document.body.removeChild(announcement), 1000);
}

export default PasswordStrength;
