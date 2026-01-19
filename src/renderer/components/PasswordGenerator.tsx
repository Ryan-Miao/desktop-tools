import React, { useState, useMemo, useCallback } from 'react';
import { createLogger } from '../../shared/logger';
import { PluginManifest } from '../../shared/types/plugin';
import PluginWindow from './PluginWindow/PluginWindow';
import './PasswordGenerator.css';

const logger = createLogger('PasswordGenerator');

interface PasswordGeneratorProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

interface CharSetOptions {
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

function PasswordGenerator({ onClose, onMinimize, onMaximize }: PasswordGeneratorProps) {
  const [length, setLength] = useState<number>(16);
  const [options, setOptions] = useState<CharSetOptions>({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: false
  });
  const [password, setPassword] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [showOptions, setShowOptions] = useState<boolean>(true);

  // 检测是否在 iframe 中
  const isInIframe = useMemo(() => {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }, []);

  // 构建字符集
  const buildCharSet = useCallback((opts: CharSetOptions): string => {
    let chars = '';
    if (opts.uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (opts.lowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (opts.numbers) chars += '0123456789';
    if (opts.symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    return chars;
  }, []);

  // 生成密码
  const generatePassword = useCallback(() => {
    const chars = buildCharSet(options);
    if (chars.length === 0) {
      setPassword('');
      return;
    }

    const randomValues = new Uint32Array(length);
    window.crypto.getRandomValues(randomValues);
    const result = Array.from(randomValues, v => chars[v % chars.length]).join('');
    setPassword(result);
    setCopied(false);
  }, [length, options, buildCharSet]);

  // 复制到剪贴板
  const copyToClipboard = useCallback(async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [password]);

  // 更新选项
  const updateOption = useCallback((key: keyof CharSetOptions) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const strength = useMemo(() => {
    if (password.length === 0) return { label: '', color: '' };
    if (password.length < 8) return { label: '弱', color: '#dc3545' };
    if (password.length < 12) return { label: '中', color: '#ffc107' };
    return { label: '强', color: '#28a745' };
  }, [password]);

  return (
    <PluginWindow
      title="随机密码生成器"
      icon="🔐"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      pluginId="com.desktop-tool.plugin.password-generator"
    >
      <div className="password-generator-content">
        {/* Result Section - Always Visible at Top */}
        <div className="password-generator-result-section">
          <div className="password-generator-result-header">
            <label className="password-generator-result-label">
              {password ? '生成的密码' : '点击生成按钮创建密码'}
            </label>
            {password && (
              <span
                className="password-generator-strength-badge"
                style={{ backgroundColor: strength.color }}
              >
                {strength.label}
              </span>
            )}
          </div>
          <div className="password-generator-result">
            <input
              type="text"
              value={password || ''}
              placeholder="────────────────"
              readOnly
              className="password-generator-output"
            />
            <button
              onClick={copyToClipboard}
              className="password-generator-btn-copy"
              disabled={!password}
            >
              {copied ? '✓' : '📋'}
            </button>
          </div>
        </div>

        {/* Generate Button - Prominent */}
        <button
          onClick={generatePassword}
          className="password-generator-btn-generate"
          disabled={buildCharSet(options).length === 0}
        >
          🎲 生成密码
        </button>

        {/* Collapsible Options */}
        <div className="password-generator-options-section">
          <button
            className="password-generator-options-toggle"
            onClick={() => setShowOptions(!showOptions)}
          >
            <span>{showOptions ? '▼' : '▶'} 配置选项</span>
            <span className="password-generator-options-summary">
              长度: {length} | 字符类型: {Object.values(options).filter(Boolean).length}
            </span>
          </button>

          {showOptions && (
            <div className="password-generator-options-panel">
              {/* Password Length - Compact */}
              <div className="password-generator-length-section">
                <label className="password-generator-compact-label">密码长度</label>
                <div className="password-generator-length-controls">
                  <button
                    onClick={() => setLength(Math.max(8, length - 1))}
                    className="password-generator-btn-small"
                  >
                    −
                  </button>
                  <div className="password-generator-length-control">
                    <input
                      type="range"
                      min="8"
                      max="32"
                      value={length}
                      onChange={e => setLength(parseInt(e.target.value))}
                      className="password-generator-slider"
                    />
                    <span className="password-generator-length-value">{length}</span>
                  </div>
                  <button
                    onClick={() => setLength(Math.min(32, length + 1))}
                    className="password-generator-btn-small"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Character Types - Grid Layout */}
              <div className="password-generator-char-section">
                <label className="password-generator-compact-label">字符类型</label>
                <div className="password-generator-checkbox-grid">
                  <label className="password-generator-checkbox">
                    <input
                      type="checkbox"
                      checked={options.uppercase}
                      onChange={() => updateOption('uppercase')}
                    />
                    <span>A-Z 大写</span>
                  </label>
                  <label className="password-generator-checkbox">
                    <input
                      type="checkbox"
                      checked={options.lowercase}
                      onChange={() => updateOption('lowercase')}
                    />
                    <span>a-z 小写</span>
                  </label>
                  <label className="password-generator-checkbox">
                    <input
                      type="checkbox"
                      checked={options.numbers}
                      onChange={() => updateOption('numbers')}
                    />
                    <span>0-9 数字</span>
                  </label>
                  <label className="password-generator-checkbox">
                    <input
                      type="checkbox"
                      checked={options.symbols}
                      onChange={() => updateOption('symbols')}
                    />
                    <span>!@# 符号</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PluginWindow>
  );
}

// Plugin manifest
export const passwordGeneratorManifest: PluginManifest = {
  id: 'com.desktop-tool.plugin.password-generator',
  name: '随机密码生成器',
  version: '1.0.0',
  description: '生成安全的随机密码，支持自定义长度和字符类型',
  author: 'Desktop Tool',
  icon: '🔐',
  entry: 'index.ts',
  category: '工具',
  permissions: []
};

export default PasswordGenerator;
