import React, { useState, useCallback } from 'react';
import { createLogger } from '../../shared/logger';
import { PluginManifest } from '../../shared/types/plugin';
import PluginWindow from './PluginWindow/PluginWindow';
import './Base64Tool.css';

const logger = createLogger('Base64Tool');

interface Base64ToolProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

function Base64Tool({ onClose, onMinimize, onMaximize }: Base64ToolProps) {
  const [input, setInput] = useState<string>('');
  const [encoded, setEncoded] = useState<string>('');
  const [decoded, setDecoded] = useState<string>('');
  const [copied, setCopied] = useState<{ encoded: boolean; decoded: boolean }>({
    encoded: false,
    decoded: false
  });

  // Base64 编码（支持 UTF-8）
  const encodeBase64 = useCallback((text: string) => {
    if (!text) {
      setEncoded('');
      return;
    }
    try {
      // 使用 TextEncoder 处理 UTF-8 字符
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      const base64 = btoa(String.fromCharCode(...data));
      setEncoded(base64);
      setDecoded(''); // Clear decoded when encoding
    } catch (err) {
      setEncoded('编码失败');
      logger.error('Base64 encode error:', err);
    }
  }, []);

  // Base64 解码（支持 UTF-8）
  const decodeBase64 = useCallback((text: string) => {
    if (!text) {
      setDecoded('');
      return;
    }
    try {
      const binaryString = atob(text);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const decoder = new TextDecoder();
      const result = decoder.decode(bytes);
      setDecoded(result);
      setEncoded(''); // Clear encoded when decoding
    } catch (err) {
      setDecoded('解码失败：无效的Base64字符串');
      logger.error('Base64 decode error:', err);
    }
  }, []);

  // 复制到剪贴板
  const copyToClipboard = useCallback(async (text: string, type: 'encoded' | 'decoded') => {
    if (!text || text === '编码失败' || text.startsWith('解码失败')) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(prev => ({ ...prev, [type]: true }));
      setTimeout(() => {
        setCopied(prev => ({ ...prev, [type]: false }));
      }, 2000);
    } catch (err) {
      logger.error('Failed to copy:', err);
    }
  }, []);

  // 处理输入变化
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
    // Reset outputs
    setEncoded('');
    setDecoded('');
  }, []);

  return (
    <PluginWindow
      title="Base64 编解码工具"
      icon="📝"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      pluginId="com.desktop-tool.plugin.base64-tool"
    >
      <div className="base64-content">
        {/* Input Section */}
        <div className="base64-section">
          <label className="base64-label">输入文本</label>
          <textarea
            value={input}
            onChange={handleInputChange}
            placeholder="在此输入需要编码或解码的文本..."
            className="base64-textarea"
            rows={4}
          />
          <div className="base64-actions">
            <button
              onClick={() => encodeBase64(input)}
              className="base64-btn base64-btn-encode"
              disabled={!input}
            >
              🔒 Base64 编码
            </button>
            <button
              onClick={() => decodeBase64(input)}
              className="base64-btn base64-btn-decode"
              disabled={!input}
            >
              🔓 Base64 解码
            </button>
          </div>
        </div>

        {/* Encoded Output */}
        {encoded && (
          <div className="base64-section">
            <div className="base64-output-header">
              <label className="base64-label">编码结果 (Base64)</label>
              <button
                onClick={() => copyToClipboard(encoded, 'encoded')}
                className="base64-btn-copy"
              >
                {copied.encoded ? '✓ 已复制' : '📋 复制'}
              </button>
            </div>
            <div className="base64-output">
              <pre>{encoded}</pre>
            </div>
          </div>
        )}

        {/* Decoded Output */}
        {decoded && (
          <div className="base64-section">
            <div className="base64-output-header">
              <label className="base64-label">解码结果 (Decoded)</label>
              <button
                onClick={() => copyToClipboard(decoded, 'decoded')}
                className="base64-btn-copy"
              >
                {copied.decoded ? '✓ 已复制' : '📋 复制'}
              </button>
            </div>
            <div className="base64-output">
              <pre>{decoded}</pre>
            </div>
          </div>
        )}

        {/* Hint */}
        {!encoded && !decoded && (
          <div className="base64-hint">
            💡 提示：输入文本后点击"编码"或"解码"按钮 | 支持中文和特殊字符
          </div>
        )}
      </div>
    </PluginWindow>
  );
}

// Plugin manifest
export const base64ToolManifest: PluginManifest = {
  id: 'com.desktop-tool.plugin.base64-tool',
  name: 'Base64 编解码工具',
  version: '1.0.0',
  description: 'Base64 编码和解码工具，支持中文和UTF-8字符',
  author: 'Desktop Tool',
  icon: '📝',
  entry: 'index.ts',
  category: '工具',
  permissions: []
};

export default Base64Tool;
