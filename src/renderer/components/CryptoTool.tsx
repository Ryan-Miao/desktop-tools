import React, { useState, useCallback } from 'react';
import { createLogger } from '../../shared/logger';
import { PluginManifest } from '../../shared/types/plugin';
import PluginWindow from './PluginWindow/PluginWindow';
import './CryptoTool.css';

const logger = createLogger('CryptoTool');

// Import crypto-js functions
import MD5 from 'crypto-js/md5';
import SHA1 from 'crypto-js/sha1';
import SHA256 from 'crypto-js/sha256';
import SHA512 from 'crypto-js/sha512';
import AES from 'crypto-js/aes';
import enc from 'crypto-js/enc-utf8';

interface CryptoToolProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

type HashType = 'md5' | 'sha1' | 'sha256' | 'sha512';

function CryptoTool({ onClose, onMinimize, onMaximize }: CryptoToolProps) {
  const [input, setInput] = useState<string>('');
  const [hashType, setHashType] = useState<HashType>('sha256');
  const [hashResult, setHashResult] = useState<string>('');
  const [aesKey, setAesKey] = useState<string>('');
  const [aesEncrypted, setAesEncrypted] = useState<string>('');
  const [aesDecrypted, setAesDecrypted] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'hash' | 'aes'>('hash');

  // 计算哈希
  const calculateHash = useCallback(() => {
    if (!input) return;
    try {
      let result = '';
      switch (hashType) {
        case 'md5':
          result = MD5(input).toString();
          break;
        case 'sha1':
          result = SHA1(input).toString();
          break;
        case 'sha256':
          result = SHA256(input).toString();
          break;
        case 'sha512':
          result = SHA512(input).toString();
          break;
      }
      setHashResult(result);
      setCopied(false);
    } catch (err) {
      logger.error('Hash calculation error:', err);
    }
  }, [input, hashType]);

  // AES 加密
  const encryptAES = useCallback(() => {
    if (!input || !aesKey) return;
    try {
      const encrypted = AES.encrypt(input, aesKey).toString();
      setAesEncrypted(encrypted);
      setAesDecrypted('');
      setCopied(false);
    } catch (err) {
      logger.error('AES encryption error:', err);
    }
  }, [input, aesKey]);

  // AES 解密
  const decryptAES = useCallback(() => {
    if (!input || !aesKey) return;
    try {
      const decrypted = AES.decrypt(input, aesKey);
      const originalText = decrypted.toString(enc);
      if (!originalText) {
        setAesDecrypted('解密失败：请检查密钥和密文');
      } else {
        setAesDecrypted(originalText);
      }
      setAesEncrypted('');
      setCopied(false);
    } catch (err) {
      setAesDecrypted('解密失败：请检查密钥和密文');
      logger.error('AES decryption error:', err);
    }
  }, [input, aesKey]);

  // 复制到剪贴板
  const copyToClipboard = useCallback(async (text: string) => {
    if (!text || text.startsWith('解密失败')) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      logger.error('Failed to copy:', err);
    }
  }, []);

  return (
    <PluginWindow
      title="加密工具"
      icon="🔐"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      pluginId="com.desktop-tool.plugin.crypto-tool"
    >
      <div className="crypto-content">
        {/* Tab Navigation */}
        <div className="crypto-tabs">
          <button
            className={`crypto-tab ${activeTab === 'hash' ? 'crypto-tab-active' : ''}`}
            onClick={() => setActiveTab('hash')}
          >
            哈希计算
          </button>
          <button
            className={`crypto-tab ${activeTab === 'aes' ? 'crypto-tab-active' : ''}`}
            onClick={() => setActiveTab('aes')}
          >
            AES 加密/解密
          </button>
        </div>

        {/* Hash Tab */}
        {activeTab === 'hash' && (
          <div className="crypto-panel">
            <div className="crypto-section">
              <label className="crypto-label">输入文本</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="在此输入需要计算哈希的文本..."
                className="crypto-textarea"
                rows={3}
              />
            </div>

            <div className="crypto-section">
              <label className="crypto-label">哈希算法</label>
              <div className="crypto-algorithms">
                <button
                  className={`crypto-algo-btn ${hashType === 'md5' ? 'crypto-algo-active' : ''}`}
                  onClick={() => setHashType('md5')}
                >
                  MD5
                </button>
                <button
                  className={`crypto-algo-btn ${hashType === 'sha1' ? 'crypto-algo-active' : ''}`}
                  onClick={() => setHashType('sha1')}
                >
                  SHA-1
                </button>
                <button
                  className={`crypto-algo-btn ${hashType === 'sha256' ? 'crypto-algo-active' : ''}`}
                  onClick={() => setHashType('sha256')}
                >
                  SHA-256
                </button>
                <button
                  className={`crypto-algo-btn ${hashType === 'sha512' ? 'crypto-algo-active' : ''}`}
                  onClick={() => setHashType('sha512')}
                >
                  SHA-512
                </button>
              </div>
            </div>

            <button
              onClick={calculateHash}
              className="crypto-btn-calculate"
              disabled={!input}
            >
              🔢 计算哈希
            </button>

            {hashResult && (
              <div className="crypto-section">
                <div className="crypto-output-header">
                  <label className="crypto-label">
                    {hashType.toUpperCase()} 哈希结果
                  </label>
                  <button
                    onClick={() => copyToClipboard(hashResult)}
                    className="crypto-btn-copy"
                  >
                    {copied ? '✓ 已复制' : '📋 复制'}
                  </button>
                </div>
                <div className="crypto-output">
                  <pre>{hashResult}</pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* AES Tab */}
        {activeTab === 'aes' && (
          <div className="crypto-panel">
            <div className="crypto-section">
              <label className="crypto-label">密钥 (Key)</label>
              <input
                type="text"
                value={aesKey}
                onChange={(e) => setAesKey(e.target.value)}
                placeholder="输入加密密钥..."
                className="crypto-input"
              />
            </div>

            <div className="crypto-section">
              <label className="crypto-label">输入文本</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="在此输入需要加密或解密的文本..."
                className="crypto-textarea"
                rows={3}
              />
            </div>

            <div className="crypto-actions">
              <button
                onClick={encryptAES}
                className="crypto-btn crypto-btn-encrypt"
                disabled={!input || !aesKey}
              >
                🔒 AES 加密
              </button>
              <button
                onClick={decryptAES}
                className="crypto-btn crypto-btn-decrypt"
                disabled={!input || !aesKey}
              >
                🔓 AES 解密
              </button>
            </div>

            {aesEncrypted && (
              <div className="crypto-section">
                <div className="crypto-output-header">
                  <label className="crypto-label">加密结果</label>
                  <button
                    onClick={() => copyToClipboard(aesEncrypted)}
                    className="crypto-btn-copy"
                  >
                    {copied ? '✓ 已复制' : '📋 复制'}
                  </button>
                </div>
                <div className="crypto-output">
                  <pre>{aesEncrypted}</pre>
                </div>
              </div>
            )}

            {aesDecrypted && (
              <div className="crypto-section">
                <div className="crypto-output-header">
                  <label className="crypto-label">解密结果</label>
                  <button
                    onClick={() => copyToClipboard(aesDecrypted)}
                    className="crypto-btn-copy"
                  >
                    {copied ? '✓ 已复制' : '📋 复制'}
                  </button>
                </div>
                <div className="crypto-output">
                  <pre>{aesDecrypted}</pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PluginWindow>
  );
}

// Plugin manifest
export const cryptoToolManifest: PluginManifest = {
  id: 'com.desktop-tool.plugin.crypto-tool',
  name: '加密工具',
  version: '1.0.0',
  description: '支持 MD5/SHA-1/SHA-256/SHA-512 哈希和 AES 加密解密',
  author: 'Desktop Tool',
  icon: '🔐',
  entry: 'index.ts',
  category: '工具',
  permissions: []
};

export default CryptoTool;
