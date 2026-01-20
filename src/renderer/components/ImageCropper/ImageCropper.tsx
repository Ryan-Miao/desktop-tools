/**
 * Image Cropper Plugin
 *
 * 图片裁剪和调整工具
 */

import React, { useState, useRef, useEffect } from 'react';
import PluginWindow from '../PluginWindow/PluginWindow';
import styles from './ImageCropper.module.css';

interface ImageCropperProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ onClose, onMinimize, onMaximize }) => {
  const [image, setImage] = useState<string>('');
  const [cropMode, setCropMode] = useState<'free' | 'square' | '16:9' | '4:3'>('free');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 下载裁剪后的图片
  const downloadCropped = () => {
    if (!image) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // 根据裁剪模式调整尺寸
      switch (cropMode) {
        case 'square':
          const minSide = Math.min(width, height);
          width = minSide;
          height = minSide;
          break;
        case '16:9':
          if (width / height > 16 / 9) {
            width = height * (16 / 9);
          } else {
            height = width * (9 / 16);
          }
          break;
        case '4:3':
          if (width / height > 4 / 3) {
            width = height * (4 / 3);
          } else {
            height = width * (3 / 4);
          }
          break;
      }

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `cropped-${Date.now()}.png`;
      a.click();
    };
    img.src = image;
  };

  // 获取预览样式
  const getPreviewStyle = () => {
    if (!image) return {};

    const baseStyle = {
      backgroundImage: `url(${image})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    };

    return baseStyle;
  };

  // 获取预览类名
  const getPreviewClassName = () => {
    const baseClass = styles.preview;
    switch (cropMode) {
      case 'free':
        return `${baseClass} ${styles.free}`;
      case 'square':
        return `${baseClass} ${styles.square}`;
      case '16:9':
        return `${baseClass} ${styles.ratio169}`;
      case '4:3':
        return `${baseClass} ${styles.ratio43}`;
      default:
        return baseClass;
    }
  };

  return (
    <PluginWindow
      title="图片裁剪"
      icon="✂️"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      className="image-cropper-standalone"
      pluginId="image-cropper"
      showStandaloneButton={false}
    >
      <div className={styles.container}>
        {/* 上传区域 */}
        <div className={styles.uploadSection}>
          <label className={styles.uploadLabel}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className={styles.fileInput}
            />
            <span>📁 选择图片</span>
          </label>
        </div>

        {/* 图片预览 */}
        {image && (
          <>
            <div className={styles.previewSection}>
              <div className={styles.previewWrapper}>
                <div
                  className={getPreviewClassName()}
                  style={getPreviewStyle()}
                />
              </div>
            </div>

            {/* 裁剪模式选择 */}
            <div className={styles.modeSection}>
              <h3>裁剪比例</h3>
              <div className={styles.modeButtons}>
                <button
                  onClick={() => setCropMode('free')}
                  className={`${styles.modeButton} ${cropMode === 'free' ? styles.active : ''}`}
                >
                  自由
                </button>
                <button
                  onClick={() => setCropMode('square')}
                  className={`${styles.modeButton} ${cropMode === 'square' ? styles.active : ''}`}
                >
                  1:1
                </button>
                <button
                  onClick={() => setCropMode('16:9')}
                  className={`${styles.modeButton} ${cropMode === '16:9' ? styles.active : ''}`}
                >
                  16:9
                </button>
                <button
                  onClick={() => setCropMode('4:3')}
                  className={`${styles.modeButton} ${cropMode === '4:3' ? styles.active : ''}`}
                >
                  4:3
                </button>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className={styles.actions}>
              <button onClick={downloadCropped} className={styles.downloadButton}>
                📥 下载裁剪后的图片
              </button>
            </div>
          </>
        )}

        {!image && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>✂️</div>
            <p>上传图片开始裁剪</p>
          </div>
        )}
      </div>
    </PluginWindow>
  );
};

export default ImageCropper;
