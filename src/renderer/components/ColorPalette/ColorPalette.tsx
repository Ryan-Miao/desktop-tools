/**
 * Color Palette Generator Plugin
 *
 * Generates beautiful color schemes with various algorithms
 */

import React, { useState, useCallback, useEffect } from 'react';
import PluginWindow from '../PluginWindow/PluginWindow';
import styles from './ColorPalette.module.css';

type ColorScheme = 'complementary' | 'analogous' | 'triadic' | 'split-complementary' | 'tetradic' | 'monochromatic';

interface ColorPaletteProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

interface Color {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
}

const ColorPalette: React.FC<ColorPaletteProps> = ({
  onClose,
  onMinimize,
  onMaximize,
}) => {
  const [baseColor, setBaseColor] = useState<Color | null>(null);
  const [palette, setPalette] = useState<Color[]>([]);
  const [scheme, setScheme] = useState<ColorScheme>('complementary');
  const [customHex, setCustomHex] = useState('#6366f1');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Convert hex to RGB
  const hexToRgb = useCallback((hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : { r: 0, g: 0, b: 0 };
  }, []);

  // Convert RGB to HSL
  const rgbToHsl = useCallback((r: number, g: number, b: number): { h: number; s: number; l: number } => {
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
  }, []);

  // Convert HSL to RGB
  const hslToRgb = useCallback((h: number, s: number, l: number): { r: number; g: number; b: number } => {
    h /= 360;
    s /= 100;
    l /= 100;

    let r: number, g: number, b: number;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number): number => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;

      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  }, []);

  // Convert RGB to hex
  const rgbToHex = useCallback((r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }, []);

  // Create color object
  const createColor = useCallback((hex: string): Color => {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    return { hex, rgb, hsl };
  }, [hexToRgb, rgbToHsl]);

  // Generate color palette based on scheme
  const generatePalette = useCallback(() => {
    if (!baseColor) return;

    const { h, s, l } = baseColor.hsl;
    let newPalette: Color[] = [];

    switch (scheme) {
      case 'complementary':
        // Base color + opposite hue
        newPalette = [
          baseColor,
          createColor(rgbToHex(...Object.values(hslToRgb((h + 180) % 360, s, l)))),
        ];
        break;

      case 'analogous':
        // 3 adjacent colors
        newPalette = [
          createColor(rgbToHex(...Object.values(hslToRgb((h - 30 + 360) % 360, s, l)))),
          baseColor,
          createColor(rgbToHex(...Object.values(hslToRgb((h + 30) % 360, s, l)))),
        ];
        break;

      case 'triadic':
        // 3 evenly spaced colors
        newPalette = [
          baseColor,
          createColor(rgbToHex(...Object.values(hslToRgb((h + 120) % 360, s, l)))),
          createColor(rgbToHex(...Object.values(hslToRgb((h + 240) % 360, s, l)))),
        ];
        break;

      case 'split-complementary':
        // Base + two adjacent to complementary
        newPalette = [
          baseColor,
          createColor(rgbToHex(...Object.values(hslToRgb((h + 150) % 360, s, l)))),
          createColor(rgbToHex(...Object.values(hslToRgb((h + 210) % 360, s, l)))),
        ];
        break;

      case 'tetradic':
        // 4 evenly spaced colors
        newPalette = [
          baseColor,
          createColor(rgbToHex(...Object.values(hslToRgb((h + 90) % 360, s, l)))),
          createColor(rgbToHex(...Object.values(hslToRgb((h + 180) % 360, s, l)))),
          createColor(rgbToHex(...Object.values(hslToRgb((h + 270) % 360, s, l)))),
        ];
        break;

      case 'monochromatic':
        // Different lightness levels
        newPalette = [
          createColor(rgbToHex(...Object.values(hslToRgb(h, s, Math.max(20, l - 30))))),
          createColor(rgbToHex(...Object.values(hslToRgb(h, s, Math.max(30, l - 15))))),
          baseColor,
          createColor(rgbToHex(...Object.values(hslToRgb(h, s, Math.min(70, l + 15))))),
          createColor(rgbToHex(...Object.values(hslToRgb(h, s, Math.min(80, l + 30))))),
        ];
        break;

      default:
        newPalette = [baseColor];
    }

    setPalette(newPalette);
  }, [baseColor, scheme, createColor, hslToRgb, rgbToHex]);

  // Generate random color
  const generateRandomColor = useCallback(() => {
    const randomHex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    setCustomHex(randomHex);
    setBaseColor(createColor(randomHex));
  }, [createColor]);

  // Copy color to clipboard
  const copyColor = useCallback((hex: string, index: number) => {
    navigator.clipboard.writeText(hex);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }, []);

  // Initialize with random color
  useEffect(() => {
    const initialColor = createColor('#6366f1');
    setBaseColor(initialColor);
  }, [createColor]);

  // Regenerate palette when base color or scheme changes
  useEffect(() => {
    if (baseColor) {
      generatePalette();
    }
  }, [baseColor, scheme, generatePalette]);

  // Handle custom hex input
  useEffect(() => {
    if (/^#[0-9A-F]{6}$/i.test(customHex)) {
      setBaseColor(createColor(customHex));
    }
  }, [customHex, createColor]);

  return (
    <PluginWindow
      title="配色方案生成器"
      icon="🎨"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      className="color-palette-standalone"
      pluginId="color-palette"
      showStandaloneButton={false}
    >
      <div className={styles.container}>
        {/* Controls */}
        <div className={styles.controls}>
          <div className={styles.colorPicker}>
            <label htmlFor="baseColor" className={styles.label}>基础颜色</label>
            <div className={styles.colorInput}>
              <input
                id="baseColor"
                type="color"
                value={baseColor?.hex || '#6366f1'}
                onChange={(e) => setCustomHex(e.target.value)}
                className={styles.colorPickerInput}
              />
              <input
                type="text"
                value={customHex}
                onChange={(e) => setCustomHex(e.target.value)}
                className={styles.hexInput}
                placeholder="#6366f1"
                maxLength={7}
              />
            </div>
          </div>

          <div className={styles.schemeSelector}>
            <label className={styles.label}>配色方案</label>
            <div className={styles.schemeButtons}>
              <button
                onClick={() => setScheme('complementary')}
                className={`${styles.schemeButton} ${scheme === 'complementary' ? styles.active : ''}`}
              >
                互补色
              </button>
              <button
                onClick={() => setScheme('analogous')}
                className={`${styles.schemeButton} ${scheme === 'analogous' ? styles.active : ''}`}
              >
                类似色
              </button>
              <button
                onClick={() => setScheme('triadic')}
                className={`${styles.schemeButton} ${scheme === 'triadic' ? styles.active : ''}`}
              >
                三色
              </button>
              <button
                onClick={() => setScheme('split-complementary')}
                className={`${styles.schemeButton} ${scheme === 'split-complementary' ? styles.active : ''}`}
              >
                分裂互补
              </button>
              <button
                onClick={() => setScheme('tetradic')}
                className={`${styles.schemeButton} ${scheme === 'tetradic' ? styles.active : ''}`}
              >
                四色
              </button>
              <button
                onClick={() => setScheme('monochromatic')}
                className={`${styles.schemeButton} ${scheme === 'monochromatic' ? styles.active : ''}`}
              >
                单色
              </button>
            </div>
          </div>

          <button onClick={generateRandomColor} className={styles.randomButton}>
            🎲 随机生成
          </button>
        </div>

        {/* Palette Display */}
        {palette.length > 0 && (
          <div className={styles.palette}>
            <h3 className={styles.paletteTitle}>配色方案</h3>
            <div className={styles.paletteGrid}>
              {palette.map((color, index) => (
                <div
                  key={index}
                  className={styles.colorCard}
                  style={{ backgroundColor: color.hex }}
                >
                  <div className={styles.colorInfo}>
                    <div className={styles.colorValue}>{color.hex.toUpperCase()}</div>
                    <div className={styles.colorDetails}>
                      rgb({color.rgb.r}, {color.rgb.g}, {color.rgb.b})
                    </div>
                    <div className={styles.colorDetails}>
                      hsl({color.hsl.h}, {color.hsl.s}%, {color.hsl.l}%)
                    </div>
                  </div>
                  <button
                    onClick={() => copyColor(color.hex, index)}
                    className={styles.copyButton}
                    aria-label="Copy color"
                  >
                    {copiedIndex === index ? '✓ 已复制' : '📋 复制'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Export Options */}
        <div className={styles.export}>
          <h4 className={styles.exportTitle}>导出选项</h4>
          <div className={styles.exportButtons}>
            <button
              onClick={() => {
                const css = palette.map(c => c.hex).join(', ');
                navigator.clipboard.writeText(css);
              }}
              className={styles.exportButton}
            >
              CSS Array
            </button>
            <button
              onClick={() => {
                const tailwind = palette.map((c, i) => `--color-${i + 1}: ${c.hex};`).join('\n');
                navigator.clipboard.writeText(tailwind);
              }}
              className={styles.exportButton}
            >
              Tailwind CSS
            </button>
            <button
              onClick={() => {
                const json = JSON.stringify(palette.map(c => c.hex), null, 2);
                navigator.clipboard.writeText(json);
              }}
              className={styles.exportButton}
            >
              JSON
            </button>
          </div>
        </div>
      </div>
    </PluginWindow>
  );
};

export default ColorPalette;
