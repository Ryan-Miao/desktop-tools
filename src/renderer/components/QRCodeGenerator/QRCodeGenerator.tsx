/**
 * QR Code Generator Plugin
 *
 * Generate QR codes for text, URLs, and other data
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import PluginWindow from '../PluginWindow/PluginWindow';
import styles from './QRCodeGenerator.module.css';

type DataType = 'text' | 'url' | 'email' | 'phone' | 'wifi';

interface QRCodeGeneratorProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  onClose,
  onMinimize,
  onMaximize,
}) => {
  const [dataType, setDataType] = useState<DataType>('text');
  const [data, setData] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [size, setSize] = useState(256);
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate QR code URL
  const generateQRCode = useCallback(() => {
    if (!data.trim()) {
      setQrCodeUrl('');
      return;
    }

    let encodedData = data;

    // Format data based on type
    switch (dataType) {
      case 'url':
        if (!data.startsWith('http://') && !data.startsWith('https://')) {
          encodedData = `https://${data}`;
        } else {
          encodedData = data;
        }
        break;
      case 'email':
        encodedData = `mailto:${data}`;
        break;
      case 'phone':
        encodedData = `tel:${data}`;
        break;
      case 'wifi':
        // Format: WIFI:S:SSID;T:WPA;P:PASSWORD;;
        encodedData = data;
        break;
      default:
        encodedData = data;
    }

    // Use a public QR code API
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
      encodedData
    )}&ecc=${errorCorrection}&color=${foregroundColor.replace(
      '#',
      ''
    )}&bgcolor=${backgroundColor.replace('#', '')}`;

    setQrCodeUrl(url);
  }, [data, dataType, size, errorCorrection, foregroundColor, backgroundColor]);

  // Auto-generate on data change
  useEffect(() => {
    const timer = setTimeout(() => {
      generateQRCode();
    }, 300);

    return () => clearTimeout(timer);
  }, [generateQRCode]);

  // Download QR code
  const downloadQRCode = useCallback(async () => {
    if (!qrCodeUrl) return;

    try {
      // Fetch the QR code image
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = `qrcode-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      announceToScreenReader('已下载二维码');
    } catch (err) {
      console.error('Failed to download QR code:', err);
      announceToScreenReader('下载失败');
    }
  }, [qrCodeUrl]);

  // Copy QR code image
  const copyQRCode = useCallback(async () => {
    if (!qrCodeUrl || !canvasRef.current) return;

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Load image and draw to canvas
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = async () => {
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0);

        // Convert to blob and copy
        canvas.toBlob(async blob => {
          if (!blob) return;

          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);

          announceToScreenReader('已复制二维码图片');
        });
      };
      img.src = qrCodeUrl;
    } catch (err) {
      console.error('Failed to copy QR code:', err);
      announceToScreenReader('复制失败');
    }
  }, [qrCodeUrl, size]);

  // Get placeholder text
  const getPlaceholder = useCallback(() => {
    switch (dataType) {
      case 'text':
        return '输入任意文本';
      case 'url':
        return 'https://example.com';
      case 'email':
        return 'example@email.com';
      case 'phone':
        return '+1234567890';
      case 'wifi':
        return 'WIFI:S:MyNetwork;T:WPA;P:MyPassword;;';
      default:
        return '输入数据';
    }
  }, [dataType]);

  return (
    <PluginWindow
      title="二维码生成器"
      icon="📱"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      className="qrcode-generator-standalone"
      pluginId="qrcode-generator"
      showStandaloneButton={false}
    >
      <div className={styles.qrCodeGenerator}>
        {/* Data Type Selector */}
        <div className={styles.typeSelector}>
          <label>数据类型</label>
          <div className={styles.typeButtons}>
            {(
              [
                { id: 'text', label: '文本', icon: '📝' },
                { id: 'url', label: '网址', icon: '🔗' },
                { id: 'email', label: '邮箱', icon: '📧' },
                { id: 'phone', label: '电话', icon: '📞' },
                { id: 'wifi', label: 'WiFi', icon: '📶' },
              ] as const
            ).map(type => (
              <button
                key={type.id}
                onClick={() => setDataType(type.id)}
                className={`${styles.typeButton} ${
                  dataType === type.id ? styles.active : ''
                }`}
                aria-label={`切换到${type.label}`}
                aria-pressed={dataType === type.id}
              >
                <span className={styles.typeIcon}>{type.icon}</span>
                <span className={styles.typeLabel}>{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className={styles.inputSection}>
          <label htmlFor="data-input">
            {dataType === 'wifi' ? 'WiFi 配置' : '输入内容'}
          </label>
          <textarea
            id="data-input"
            value={data}
            onChange={e => setData(e.target.value)}
            placeholder={getPlaceholder()}
            className={styles.textarea}
            rows={dataType === 'wifi' ? 3 : 2}
            aria-label="输入二维码数据"
          />
          {dataType === 'wifi' && (
            <p className={styles.hint}>
              格式: WIFI:S:SSID;T:WPA/WEP;P:PASSWORD;;
            </p>
          )}
        </div>

        {/* Options */}
        <div className={styles.options}>
          <div className={styles.optionGroup}>
            <label htmlFor="size-select">尺寸</label>
            <select
              id="size-select"
              value={size}
              onChange={e => setSize(Number(e.target.value))}
              className={styles.select}
            >
              <option value="128">128 x 128</option>
              <option value="256">256 x 256</option>
              <option value="512">512 x 512</option>
              <option value="1024">1024 x 1024</option>
            </select>
          </div>

          <div className={styles.optionGroup}>
            <label htmlFor="ecc-select">纠错级别</label>
            <select
              id="ecc-select"
              value={errorCorrection}
              onChange={e =>
                setErrorCorrection(e.target.value as 'L' | 'M' | 'Q' | 'H')
              }
              className={styles.select}
            >
              <option value="L">L (7%)</option>
              <option value="M">M (15%)</option>
              <option value="Q">Q (25%)</option>
              <option value="H">H (30%)</option>
            </select>
          </div>

          <div className={styles.optionGroup}>
            <label htmlFor="fg-color">前景色</label>
            <input
              id="fg-color"
              type="color"
              value={foregroundColor}
              onChange={e => setForegroundColor(e.target.value)}
              className={styles.colorInput}
            />
          </div>

          <div className={styles.optionGroup}>
            <label htmlFor="bg-color">背景色</label>
            <input
              id="bg-color"
              type="color"
              value={backgroundColor}
              onChange={e => setBackgroundColor(e.target.value)}
              className={styles.colorInput}
            />
          </div>
        </div>

        {/* QR Code Display */}
        <div className={styles.qrDisplay}>
          {qrCodeUrl ? (
            <div className={styles.qrCodeWrapper}>
              <img
                src={qrCodeUrl}
                alt="Generated QR Code"
                className={styles.qrCode}
                style={{ width: size, height: size }}
              />
            </div>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>📱</span>
              <span className={styles.placeholderText}>
                输入内容生成二维码
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            onClick={generateQRCode}
            className={styles.generateButton}
            disabled={!data.trim()}
            aria-label="重新生成"
          >
            🔄 重新生成
          </button>
          <button
            onClick={copyQRCode}
            className={styles.actionButton}
            disabled={!qrCodeUrl}
            aria-label="复制二维码图片"
          >
            📋 复制图片
          </button>
          <button
            onClick={downloadQRCode}
            className={styles.actionButton}
            disabled={!qrCodeUrl}
            aria-label="下载二维码"
          >
            💾 下载
          </button>
        </div>

        {/* Hidden canvas for copying */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </PluginWindow>
  );
};

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

export default QRCodeGenerator;
