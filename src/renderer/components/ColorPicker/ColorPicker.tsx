/**
 * Color Picker Plugin
 *
 * Professional color picker with multiple color formats
 */

import React, { useState, useEffect, useRef } from "react";
import PluginWindow from "../PluginWindow/PluginWindow";
import styles from "./ColorPicker.module.css";

interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface ColorPickerProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  onClose,
  onMinimize,
  onMaximize,
}) => {
  const [color, setColor] = useState<Color>({ r: 59, g: 130, b: 246, a: 1 });
  const [hex, setHex] = useState("#3b82f6");
  const [favorites, setFavorites] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert RGB to HEX
  const rgbToHex = (r: number, g: number, b: number): string => {
    return (
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
    );
  };

  // Convert HEX to RGB
  const hexToRgb = (hex: string): Color | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return null;
    return {
      r: parseInt(result[1]!, 16),
      g: parseInt(result[2]!, 16),
      b: parseInt(result[3]!, 16),
      a: 1,
    };
  };

  // Update hex when color changes
  useEffect(() => {
    setHex(rgbToHex(color.r, color.g, color.b));
  }, [color]);

  // Handle color slider change
  const handleColorChange = (channel: "r" | "g" | "b", value: number) => {
    setColor((prev) => ({
      ...prev,
      [channel]: Math.max(0, Math.min(255, value)),
    }));
  };

  // Handle alpha change
  const handleAlphaChange = (value: number) => {
    setColor((prev) => ({ ...prev, a: Math.max(0, Math.min(1, value)) }));
  };

  // Handle hex input
  const handleHexChange = (value: string) => {
    const rgb = hexToRgb(value);
    if (rgb) {
      setColor(rgb);
      setHex(value);
    }
  };

  // Get HSL values
  const rgbToHsl = (
    r: number,
    g: number,
    b: number,
  ): { h: number; s: number; l: number } => {
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

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  // Copy color to clipboard
  const copyToClipboard = (text: string, format: string) => {
    navigator.clipboard.writeText(text);
    announceToScreenReader(`已复制${format}色值: ${text}`);
  };

  // Add to favorites
  const addToFavorites = () => {
    const colorHex = rgbToHex(color.r, color.g, color.b);
    if (!favorites.includes(colorHex)) {
      setFavorites((prev) => [...prev, colorHex]);
    }
  };

  // Remove from favorites
  const removeFromFavorites = (colorHex: string) => {
    setFavorites((prev) => prev.filter((c) => c !== colorHex));
  };

  // Select favorite color
  const selectFavorite = (colorHex: string) => {
    const rgb = hexToRgb(colorHex);
    if (rgb) {
      setColor(rgb);
    }
  };

  // Get rgba string
  const getRgbaString = () => {
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
  };

  // Get hsl string (unused but kept for potential future use)
  // const getHslString = () => {
  //   const { h, s, l } = rgbToHsl(color.r, color.g, color.b);
  //   return `hsla(${h}, ${s}%, ${l}%, ${color.a})`;
  // };

  // Handle eyedropper
  const handleEyedropper = () => {
    // Type assertion for EyeDropper API which is not in standard TypeScript types
    if ("EyeDropper" in window) {
      const eyeDropper = new (window as any).EyeDropper();
      eyeDropper
        .open()
        .then((result: { sRGBHex: string }) => {
          const rgb = hexToRgb(result.sRGBHex);
          if (rgb) {
            setColor(rgb);
          }
        })
        .catch(() => {
          // EyeDropper was cancelled
        });
    } else {
      alert("您的浏览器不支持吸管工具，请使用 Chrome 或 Edge");
    }
  };

  // Handle image upload for color extraction
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && canvasRef.current) {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
      };
      img.src = URL.createObjectURL(file);
    }
  };

  // Extract color from canvas
  const extractColorFromCanvas = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const imageData = ctx.getImageData(x * scaleX, y * scaleY, 1, 1);
    const [r = 0, g = 0, b = 0] = imageData.data;

    setColor({ r, g, b, a: 1 });
  };

  const hsl = rgbToHsl(color.r, color.g, color.b);

  return (
    <PluginWindow
      title="颜色选择器"
      icon="🎨"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      className="color-picker-standalone"
      pluginId="color-picker"
      showStandaloneButton={false}
    >
      <div className={styles.colorPicker}>
        {/* Color Preview */}
        <div className={styles.preview}>
          <div
            className={styles.colorBox}
            style={{
              backgroundColor: getRgbaString(),
              backgroundImage:
                color.a < 1
                  ? "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)"
                  : undefined,
              backgroundSize: color.a < 1 ? "10px 10px" : undefined,
              backgroundPosition:
                color.a < 1 ? "0 0, 0 5px, 5px -5px, -5px 0px" : undefined,
            }}
          />
        </div>

        {/* Color Sliders */}
        <div className={styles.sliders}>
          <div className={styles.slider}>
            <label>R</label>
            <input
              type="range"
              min="0"
              max="255"
              value={color.r}
              onChange={(e) => handleColorChange("r", parseInt(e.target.value))}
              className={styles.redSlider}
            />
            <input
              type="number"
              min="0"
              max="255"
              value={color.r}
              onChange={(e) => handleColorChange("r", parseInt(e.target.value))}
              className={styles.numberInput}
            />
          </div>

          <div className={styles.slider}>
            <label>G</label>
            <input
              type="range"
              min="0"
              max="255"
              value={color.g}
              onChange={(e) => handleColorChange("g", parseInt(e.target.value))}
              className={styles.greenSlider}
            />
            <input
              type="number"
              min="0"
              max="255"
              value={color.g}
              onChange={(e) => handleColorChange("g", parseInt(e.target.value))}
              className={styles.numberInput}
            />
          </div>

          <div className={styles.slider}>
            <label>B</label>
            <input
              type="range"
              min="0"
              max="255"
              value={color.b}
              onChange={(e) => handleColorChange("b", parseInt(e.target.value))}
              className={styles.blueSlider}
            />
            <input
              type="number"
              min="0"
              max="255"
              value={color.b}
              onChange={(e) => handleColorChange("b", parseInt(e.target.value))}
              className={styles.numberInput}
            />
          </div>

          <div className={styles.slider}>
            <label>A</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={color.a}
              onChange={(e) => handleAlphaChange(parseFloat(e.target.value))}
              className={styles.alphaSlider}
            />
            <input
              type="number"
              min="0"
              max="1"
              step="0.01"
              value={color.a}
              onChange={(e) => handleAlphaChange(parseFloat(e.target.value))}
              className={styles.numberInput}
            />
          </div>
        </div>

        {/* Color Values */}
        <div className={styles.colorValues}>
          <div className={styles.colorValue}>
            <label>HEX</label>
            <div className={styles.inputGroup}>
              <input
                type="text"
                value={hex}
                onChange={(e) => handleHexChange(e.target.value)}
                className={styles.textInput}
              />
              <button
                onClick={() => copyToClipboard(hex, "HEX")}
                className={styles.copyButton}
                aria-label="复制HEX值"
              >
                复制
              </button>
            </div>
          </div>

          <div className={styles.colorValue}>
            <label>RGB</label>
            <div className={styles.inputGroup}>
              <input
                type="text"
                value={`${color.r}, ${color.g}, ${color.b}`}
                readOnly
                className={styles.textInput}
              />
              <button
                onClick={() =>
                  copyToClipboard(`${color.r}, ${color.g}, ${color.b}`, "RGB")
                }
                className={styles.copyButton}
                aria-label="复制RGB值"
              >
                复制
              </button>
            </div>
          </div>

          <div className={styles.colorValue}>
            <label>HSL</label>
            <div className={styles.inputGroup}>
              <input
                type="text"
                value={`${hsl.h}, ${hsl.s}%, ${hsl.l}%`}
                readOnly
                className={styles.textInput}
              />
              <button
                onClick={() =>
                  copyToClipboard(`${hsl.h}, ${hsl.s}%, ${hsl.l}%`, "HSL")
                }
                className={styles.copyButton}
                aria-label="复制HSL值"
              >
                复制
              </button>
            </div>
          </div>

          <div className={styles.colorValue}>
            <label>RGBA</label>
            <div className={styles.inputGroup}>
              <input
                type="text"
                value={getRgbaString()}
                readOnly
                className={styles.textInput}
              />
              <button
                onClick={() => copyToClipboard(getRgbaString(), "RGBA")}
                className={styles.copyButton}
                aria-label="复制RGBA值"
              >
                复制
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            onClick={addToFavorites}
            className={styles.favoriteButton}
            aria-label="添加到收藏"
          >
            ⭐ 添加到收藏
          </button>

          <button
            onClick={handleEyedropper}
            className={styles.eyedropperButton}
            aria-label="吸管工具"
          >
            💉 吸管工具
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className={styles.uploadButton}
            aria-label="从图片提取颜色"
          >
            📷 从图片提取
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />
        </div>

        {/* Canvas for image color extraction */}
        {canvasRef.current && (
          <div className={styles.canvasContainer}>
            <canvas
              ref={canvasRef}
              onClick={extractColorFromCanvas}
              className={styles.canvas}
              title="点击图片提取颜色"
            />
          </div>
        )}

        {/* Favorites */}
        {favorites.length > 0 && (
          <div className={styles.favorites}>
            <h3>收藏的颜色</h3>
            <div className={styles.favoriteGrid}>
              {favorites.map((fav, index) => (
                <div
                  key={index}
                  className={styles.favoriteItem}
                  onClick={() => selectFavorite(fav)}
                  title={fav}
                >
                  <div
                    className={styles.favoriteColor}
                    style={{ backgroundColor: fav }}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromFavorites(fav);
                    }}
                    className={styles.removeButton}
                    aria-label={`删除${fav}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PluginWindow>
  );
};

// Screen reader announcement helper
function announceToScreenReader(message: string) {
  const announcement = document.createElement("div");
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", "polite");
  announcement.className = "sr-only";
  announcement.style.position = "absolute";
  announcement.style.left = "-10000px";
  announcement.style.width = "1px";
  announcement.style.height = "1px";
  announcement.style.overflow = "hidden";
  announcement.textContent = message;
  document.body.appendChild(announcement);
  setTimeout(() => document.body.removeChild(announcement), 1000);
}

export default ColorPicker;
