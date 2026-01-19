import React, { useState, useCallback, useRef } from 'react';
import { createLogger } from '../../shared/logger';
import { PluginManifest } from '../../shared/types/plugin';
import PluginWindow from './PluginWindow/PluginWindow';
import Tesseract from 'tesseract.js';
import './OcrTool.css';

const logger = createLogger('OcrTool');

interface OcrToolProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

type Language = 'eng' | 'chi_sim' | 'chi_tra' | 'jpn' | 'kor' | 'eng+chi_sim' | 'eng+chi_tra';

function OcrTool({ onClose, onMinimize, onMaximize }: OcrToolProps) {
  const [image, setImage] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [language, setLanguage] = useState<Language>('eng+chi_sim');
  const [copied, setCopied] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setText('');
        setProgress(0);
        setStatus('');
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setText('');
        setProgress(0);
        setStatus('');
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Perform OCR
  const performOCR = useCallback(async () => {
    if (!image) return;

    setIsProcessing(true);
    setProgress(0);
    setStatus('准备中...');

    try {
      const result = await Tesseract.recognize(
        image,
        language,
        {
          logger: (m: any) => {
            if (m.status === 'recognizing text') {
              setProgress(Math.round(m.progress * 100));
              setStatus(`识别中... ${Math.round(m.progress * 100)}%`);
            } else if (m.status === 'loading tesseract core') {
              setStatus('加载 OCR 核心...');
            } else if (m.status === 'initializing tesseract') {
              setStatus('初始化 OCR...');
            } else if (m.status === 'initializing api') {
              setStatus('初始化 API...');
            } else if (m.status === 'loading language traineddata') {
              setStatus('加载语言数据...');
            }
          }
        }
      );

      setText(result.data.text);
      setStatus('识别完成！');
      logger.info('OCR completed:', result.data.text.slice(0, 100));
    } catch (err) {
      setStatus('识别失败');
      logger.error('OCR error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [image, language]);

  // Copy to clipboard
  const copyToClipboard = useCallback(async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      logger.error('Failed to copy:', err);
    }
  }, [text]);

  // Clear all
  const clearAll = useCallback(() => {
    setImage('');
    setText('');
    setProgress(0);
    setStatus('');
    setCopied(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <PluginWindow
      title="OCR 图片文字识别"
      icon="🔍"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      pluginId="com.desktop-tool.plugin.ocr-tool"
    >
      <div className="ocr-content">
        {/* Language Selection */}
        <div className="ocr-language-section">
          <label className="ocr-label">识别语言</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="ocr-language-select"
            disabled={isProcessing}
          >
            <option value="eng">英文</option>
            <option value="chi_sim">中文简体</option>
            <option value="eng+chi_sim">英文 + 中文简体</option>
            <option value="chi_tra">中文繁体</option>
            <option value="jpn">日文</option>
            <option value="kor">韩文</option>
          </select>
        </div>

        {/* Image Upload */}
        <div className="ocr-upload-section">
          <div
            className={`ocr-dropzone ${image ? 'ocr-dropzone-has-image' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => !isProcessing && fileInputRef.current?.click()}
          >
            {image ? (
              <img src={image} alt="Uploaded" className="ocr-preview" />
            ) : (
              <div className="ocr-dropzone-content">
                <div className="ocr-dropzone-icon">📷</div>
                <p>点击或拖拽图片到此处</p>
                <p className="ocr-dropzone-hint">支持 JPG, PNG, GIF 等格式</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="ocr-file-input"
          />
        </div>

        {/* Actions */}
        <div className="ocr-actions">
          <button
            onClick={performOCR}
            className="ocr-btn-recognize"
            disabled={!image || isProcessing}
          >
            {isProcessing ? '识别中...' : '🔍 开始识别'}
          </button>
          <button
            onClick={clearAll}
            className="ocr-btn-clear"
            disabled={isProcessing}
          >
            🗑️ 清空
          </button>
        </div>

        {/* Progress */}
        {isProcessing && (
          <div className="ocr-progress-section">
            <div className="ocr-progress-bar">
              <div
                className="ocr-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="ocr-progress-status">{status}</div>
          </div>
        )}

        {/* Result */}
        {text && (
          <div className="ocr-result-section">
            <div className="ocr-result-header">
              <label className="ocr-label">识别结果</label>
              <button
                onClick={copyToClipboard}
                className="ocr-btn-copy"
              >
                {copied ? '✓ 已复制' : '📋 复制'}
              </button>
            </div>
            <div className="ocr-result-text">
              <pre>{text || '未识别到文字'}</pre>
            </div>
          </div>
        )}
      </div>
    </PluginWindow>
  );
}

// Plugin manifest
export const ocrToolManifest: PluginManifest = {
  id: 'com.desktop-tool.plugin.ocr-tool',
  name: 'OCR 图片文字识别',
  version: '1.0.0',
  description: '从图片中识别文字，支持多语言',
  author: 'Desktop Tool',
  icon: '🔍',
  entry: 'index.ts',
  category: '工具',
  permissions: []
};

export default OcrTool;
