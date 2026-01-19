import React, { useState, useEffect, useMemo } from 'react';
import { generateQRCode, downloadQRCode } from './utils/qrcode-generator';
import './QRCodePlugin.css';

interface QRCodePluginProps {
  pluginId: string;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

type TabType = 'text' | 'url';

type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

function QRCodePlugin({ onClose, onMinimize, onMaximize }: QRCodePluginProps) {
  const [tab, setTab] = useState<TabType>('text');
  const [input, setInput] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [error, setError] = useState<string>('');

  // 检测是否在iframe中运行
  // 在iframe中时，隐藏内部窗口控制按钮（使用外层Modal的按钮）
  const isInIframe = useMemo(() => {
    try {
      return window.self !== window.top;
    } catch (e) {
      // 跨域限制时，默认为iframe环境
      return true;
    }
  }, []);

  const [settings, setSettings] = useState({
    width: 300,
    margin: 2,
    color: '#000000',
    bgColor: '#ffffff',
    errorLevel: 'M' as ErrorCorrectionLevel
  });

  // 实时生成二维码
  useEffect(() => {
    if (input.trim()) {
      generateQR();
    } else {
      setQrCodeUrl('');
    }
  }, [input, settings, tab]);

  const generateQR = async () => {
    if (!input.trim()) {
      setQrCodeUrl('');
      return;
    }

    setError('');

    try {
      const text = tab === 'url' && !input.match(/^https?:\/\//)
        ? `https://${input}`
        : input;

      const result = await generateQRCode(text, {
        width: settings.width,
        margin: settings.margin,
        color: { dark: settings.color, light: settings.bgColor },
        errorCorrectionLevel: settings.errorLevel
      });

      setQrCodeUrl(result);
    } catch (err) {
      setError((err as Error).message);
      setQrCodeUrl('');
    }
  };

  const handleDownload = () => {
    if (qrCodeUrl) {
      const timestamp = new Date().getTime();
      downloadQRCode(qrCodeUrl, `qrcode-${timestamp}.png`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  return (
    <div className="qrcode-plugin">
      <div className="qrcode-header">
        <h2>📱 二维码生成器</h2>
        {onClose && !isInIframe && (
          <div className="qrcode-window-controls">
            <button onClick={onMinimize} title="最小化">─</button>
            <button onClick={onMaximize} title="最大化">□</button>
            <button onClick={onClose} title="关闭">✕</button>
          </div>
        )}
      </div>

      <div className="qrcode-tabs">
        <button
          className={`qrcode-tab ${tab === 'text' ? 'active' : ''}`}
          onClick={() => setTab('text')}
        >
          文本
        </button>
        <button
          className={`qrcode-tab ${tab === 'url' ? 'active' : ''}`}
          onClick={() => setTab('url')}
        >
          链接
        </button>
      </div>

      <div className="qrcode-content">
        <div className="qrcode-input-section">
          <label>
            {tab === 'text' ? '输入文本内容' : '输入链接地址'}
          </label>
          <textarea
            value={input}
            onChange={handleInputChange}
            placeholder={tab === 'text' ? '请输入要生成二维码的文本内容...' : '请输入 URL 地址...'}
            className="qrcode-textarea"
            rows={4}
          />
        </div>

        {error && (
          <div className="qrcode-error">
            ⚠️ {error}
          </div>
        )}

        {qrCodeUrl && (
          <div className="qrcode-preview-section">
            <div className="qrcode-preview-card">
              <img
                src={qrCodeUrl}
                alt="二维码"
                className="qrcode-image"
                style={{ width: `${settings.width}px` }}
              />
              <button
                className="qrcode-download-btn"
                onClick={handleDownload}
              >
                📥 下载二维码
              </button>
            </div>
          </div>
        )}

        <div className="qrcode-settings">
          <h3>⚙️ 设置</h3>

          <div className="qrcode-settings-grid">
            <div className="qrcode-setting-item">
              <label>尺寸: {settings.width}px</label>
              <input
                type="range"
                min="200"
                max="600"
                step="50"
                value={settings.width}
                onChange={(e) => setSettings({ ...settings, width: Number(e.target.value) })}
                className="qrcode-slider"
              />
            </div>

            <div className="qrcode-setting-item">
              <label>边距: {settings.margin}</label>
              <input
                type="range"
                min="0"
                max="4"
                step="1"
                value={settings.margin}
                onChange={(e) => setSettings({ ...settings, margin: Number(e.target.value) })}
                className="qrcode-slider"
              />
            </div>

            <div className="qrcode-setting-item">
              <label>前景色</label>
              <input
                type="color"
                value={settings.color}
                onChange={(e) => setSettings({ ...settings, color: e.target.value })}
                className="qrcode-color-picker"
              />
            </div>

            <div className="qrcode-setting-item">
              <label>背景色</label>
              <input
                type="color"
                value={settings.bgColor}
                onChange={(e) => setSettings({ ...settings, bgColor: e.target.value })}
                className="qrcode-color-picker"
              />
            </div>

            <div className="qrcode-setting-item">
              <label>容错率</label>
              <select
                value={settings.errorLevel}
                onChange={(e) => setSettings({ ...settings, errorLevel: e.target.value as ErrorCorrectionLevel })}
                className="qrcode-select"
              >
                <option value="L">L (7%)</option>
                <option value="M">M (15%)</option>
                <option value="Q">Q (25%)</option>
                <option value="H">H (30%)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QRCodePlugin;
