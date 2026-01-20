/**
 * Color Extractor Plugin
 *
 * 从图片提取调色板
 */

import React, { useState } from 'react';
import PluginWindow from '../PluginWindow/PluginWindow';
import styles from './ColorExtractor.module.css';

interface ColorExtractorProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

interface ExtractedColor {
  hex: string;
  rgb: string;
  hsl: string;
  count: number;
}

const ColorExtractor: React.FC<ColorExtractorProps> = ({ onClose, onMinimize, onMaximize }) => {
  const [image, setImage] = useState<string>('');
  const [colors, setColors] = useState<ExtractedColor[]>([]);
  const [colorCount, setColorCount] = useState<number>(8);

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        extractColors(event.target?.result as string);
      };
      img.src = event.target?.result as string;
      setImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 提取颜色
  const extractColors = (imageSrc: string) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 缩小图片以提高性能
      const maxSize = 100;
      const scale = Math.min(maxSize / img.width, maxSize / img.height);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      const colorMap: { [hex: string]: number } = {};

      // 采样像素
      for (let i = 0; i < pixels.length; i += 4 * 10) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];

        // 跳过透明像素
        if (a < 128) continue;

        // 量化颜色以减少颜色数量
        const quantize = (value: number) => Math.round(value / 16) * 16;
        const qr = quantize(r);
        const qg = quantize(g);
        const qb = quantize(b);

        const hex = rgbToHex(qr, qg, qb);
        colorMap[hex] = (colorMap[hex] || 0) + 1;
      }

      // 转换为数组并排序
      const colorArray = Object.entries(colorMap)
        .map(([hex, count]) => ({
          hex,
          rgb: hexToRgb(hex),
          hsl: rgbToHsl(parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)),
          count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, colorCount);

      setColors(colorArray);
    };

    img.src = imageSrc;
  };

  // RGB转HEX
  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  };

  // HEX转RGB
  const hexToRgb = (hex: string): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${r}, ${g}, ${b})`;
  };

  // RGB转HSL
  const rgbToHsl = (r: number, g: number, b: number): string => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  };

  // 复制颜色值
  const copyColor = (value: string) => {
    navigator.clipboard.writeText(value);
  };

  return (
    <PluginWindow
      title="颜色提取"
      icon="🌈"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      className="color-extractor-standalone"
      pluginId="color-extractor"
      showStandaloneButton={false}
    >
      <div className={styles.container}>
        {/* 上传区域 */}
        <div className={styles.uploadSection}>
          <label className={styles.uploadLabel}>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className={styles.fileInput}
            />
            <span>📁 上传图片</span>
          </label>
          <div className={styles.settings}>
            <label>提取颜色数量:</label>
            <select
              value={colorCount}
              onChange={(e) => setColorCount(Number(e.target.value))}
              className={styles.select}
            >
              <option value={6}>6</option>
              <option value={8}>8</option>
              <option value={10}>10</option>
              <option value={12}>12</option>
              <option value={16}>16</option>
            </select>
          </div>
        </div>

        {/* 图片预览 */}
        {image && (
          <div className={styles.previewSection}>
            <img src={image} alt="Uploaded" className={styles.previewImage} />
          </div>
        )}

        {/* 提取的颜色 */}
        {colors.length > 0 && (
          <div className={styles.colorsSection}>
            <h3>提取的颜色</h3>
            <div className={styles.colorGrid}>
              {colors.map((color, index) => (
                <div key={index} className={styles.colorCard}>
                  <div
                    className={styles.colorPreview}
                    style={{ background: color.hex }}
                  />
                  <div className={styles.colorInfo}>
                    <div className={styles.colorValue}>
                      <span className={styles.colorLabel}>HEX</span>
                      <code className={styles.colorCode}>{color.hex}</code>
                      <button
                        onClick={() => copyColor(color.hex)}
                        className={styles.copyButton}
                      >
                        📋
                      </button>
                    </div>
                    <div className={styles.colorValue}>
                      <span className={styles.colorLabel}>RGB</span>
                      <code className={styles.colorCode}>{color.rgb}</code>
                      <button
                        onClick={() => copyColor(color.rgb)}
                        className={styles.copyButton}
                      >
                        📋
                      </button>
                    </div>
                    <div className={styles.colorValue}>
                      <span className={styles.colorLabel}>HSL</span>
                      <code className={styles.colorCode}>{color.hsl}</code>
                      <button
                        onClick={() => copyColor(color.hsl)}
                        className={styles.copyButton}
                      >
                        📋
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PluginWindow>
  );
};

export default ColorExtractor;
