import React, { useState, useCallback } from 'react';
import { createLogger } from '../../shared/logger';
import { PluginManifest } from '../../shared/types/plugin';
import PluginWindow from './PluginWindow/PluginWindow';
import './UrlCodec.css';

const logger = createLogger('UrlCodec');

interface UrlCodecProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

function UrlCodec({ onClose, onMinimize, onMaximize }: UrlCodecProps) {
  const [input, setInput] = useState<string>('');
  const [encoded, setEncoded] = useState<string>('');
  const [decoded, setDecoded] = useState<string>('');
  const [copied, setCopied] = useState<{ encoded: boolean; decoded: boolean }>({
    encoded: false,
    decoded: false
  });

  // URL 编码
  const encodeUrl = useCallback((text: string) => {
    if (!text) {
      setEncoded('');
      return;
    }
    try {
      const result = encodeURIComponent(text);
      setEncoded(result);
      setDecoded(''); // Clear decoded when encoding
    } catch (err) {
      setEncoded('编码失败');
      logger.error('URL encode error:', err);
    }
  }, []);

  // URL 解码
  const decodeUrl = useCallback((text: string) => {
    if (!text) {
      setDecoded('');
      return;
    }
    try {
      const result = decodeURIComponent(text);
      setDecoded(result);
      setEncoded(''); // Clear encoded when decoding
    } catch (err) {
      setDecoded('解码失败：无效的URL编码');
      logger.error('URL decode error:', err);
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
      title="URL 编解码工具"
      icon="🔗"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      pluginId="com.desktop-tool.plugin.url-codec"
    >
      <div className="url-codec-content">
        {/* Input Section */}
        <div className="url-codec-section">
          <label className="url-codec-label">输入文本</label>
          <textarea
            value={input}
            onChange={handleInputChange}
            placeholder="在此输入需要编码或解码的文本..."
            className="url-codec-textarea"
            rows={4}
          />
          <div className="url-codec-actions">
            <button
              onClick={() => encodeUrl(input)}
              className="url-codec-btn url-codec-btn-encode"
              disabled={!input}
            >
              🔒 URL 编码
            </button>
            <button
              onClick={() => decodeUrl(input)}
              className="url-codec-btn url-codec-btn-decode"
              disabled={!input}
            >
              🔓 URL 解码
            </button>
          </div>
        </div>

        {/* Encoded Output */}
        {encoded && (
          <div className="url-codec-section">
            <div className="url-codec-output-header">
              <label className="url-codec-label">编码结果 (URL Encoded)</label>
              <button
                onClick={() => copyToClipboard(encoded, 'encoded')}
                className="url-codec-btn-copy"
              >
                {copied.encoded ? '✓ 已复制' : '📋 复制'}
              </button>
            </div>
            <div className="url-codec-output">
              <pre>{encoded}</pre>
            </div>
          </div>
        )}

        {/* Decoded Output */}
        {decoded && (
          <div className="url-codec-section">
            <div className="url-codec-output-header">
              <label className="url-codec-label">解码结果 (URL Decoded)</label>
              <button
                onClick={() => copyToClipboard(decoded, 'decoded')}
                className="url-codec-btn-copy"
              >
                {copied.decoded ? '✓ 已复制' : '📋 复制'}
              </button>
            </div>
            <div className="url-codec-output">
              <pre>{decoded}</pre>
            </div>
          </div>
        )}

        {/* Hint */}
        {!encoded && !decoded && (
          <div className="url-codec-hint">
            💡 提示：输入文本后点击"编码"或"解码"按钮
          </div>
        )}
      </div>
    </PluginWindow>
  );
}

// Plugin manifest
export const urlCodecManifest: PluginManifest = {
  id: 'com.desktop-tool.plugin.url-codec',
  name: 'URL 编解码工具',
  version: '1.0.0',
  description: 'URL 编码和解码工具，支持中文和特殊字符',
  author: 'Desktop Tool',
  icon: '🔗',
  entry: 'index.ts',
  category: '工具',
  permissions: []
};

export default UrlCodec;
