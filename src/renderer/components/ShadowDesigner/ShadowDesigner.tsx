/**
 * Shadow Designer Plugin
 *
 * CSS box-shadow生成器
 */

import React, { useState, useEffect } from 'react';
import PluginWindow from '../PluginWindow/PluginWindow';
import styles from './ShadowDesigner.module.css';

interface ShadowDesignerProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

interface ShadowLayer {
  id: string;
  xOffset: number;
  yOffset: number;
  blur: number;
  spread: number;
  color: string;
  inset: boolean;
}

const ShadowDesigner: React.FC<ShadowDesignerProps> = ({ onClose, onMinimize, onMaximize }) => {
  const [layers, setLayers] = useState<ShadowLayer[]>([
    {
      id: '1',
      xOffset: 0,
      yOffset: 4,
      blur: 6,
      spread: -1,
      color: 'rgba(0, 0, 0, 0.1)',
      inset: false
    }
  ]);
  const [cssCode, setCssCode] = useState('');

  // 生成CSS代码
  useEffect(() => {
    if (layers.length === 0) {
      setCssCode('');
      return;
    }

    const shadows = layers.map(layer => {
      const inset = layer.inset ? 'inset ' : '';
      return `${inset}${layer.xOffset}px ${layer.yOffset}px ${layer.blur}px ${layer.spread}px ${layer.color}`;
    });

    setCssCode(`box-shadow: ${shadows.join(', ')};`);
  }, [layers]);

  // 添加图层
  const addLayer = () => {
    const newLayer: ShadowLayer = {
      id: Date.now().toString(),
      xOffset: 0,
      yOffset: 4,
      blur: 6,
      spread: -1,
      color: 'rgba(0, 0, 0, 0.1)',
      inset: false
    };
    setLayers([...layers, newLayer]);
  };

  // 删除图层
  const removeLayer = (id: string) => {
    if (layers.length <= 1) return;
    setLayers(layers.filter(layer => layer.id !== id));
  };

  // 更新图层
  const updateLayer = (id: string, field: keyof ShadowLayer, value: any) => {
    setLayers(layers.map(layer =>
      layer.id === id ? { ...layer, [field]: value } : layer
    ));
  };

  // 复制CSS代码
  const copyCSS = () => {
    navigator.clipboard.writeText(cssCode);
  };

  // 预设阴影
  const presets = [
    {
      name: '卡片',
      layers: [
        { xOffset: 0, yOffset: 1, blur: 3, spread: 0, color: 'rgba(0,0,0,0.1)', inset: false }
      ]
    },
    {
      name: '浮起',
      layers: [
        { xOffset: 0, yOffset: 4, blur: 6, spread: -1, color: 'rgba(0,0,0,0.1)', inset: false },
        { xOffset: 0, yOffset: 2, blur: 4, spread: -1, color: 'rgba(0,0,0,0.06)', inset: false }
      ]
    },
    {
      name: '深阴影',
      layers: [
        { xOffset: 0, yOffset: 10, blur: 20, spread: 0, color: 'rgba(0,0,0,0.15)', inset: false }
      ]
    },
    {
      name: '内阴影',
      layers: [
        { xOffset: 0, yOffset: 2, blur: 4, spread: 0, color: 'rgba(0,0,0,0.1)', inset: true }
      ]
    },
    {
      name: '发光',
      layers: [
        { xOffset: 0, yOffset: 0, blur: 10, spread: 0, color: 'rgba(102,126,234,0.5)', inset: false }
      ]
    },
    {
      name: '立体',
      layers: [
        { xOffset: 4, yOffset: 4, blur: 0, spread: 0, color: 'rgba(0,0,0,0.1)', inset: false },
        { xOffset: -4, yOffset: -4, blur: 0, spread: 0, color: 'rgba(255,255,255,0.5)', inset: false }
      ]
    }
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    const newLayers = preset.layers.map((layer, index) => ({
      id: Date.now().toString() + index,
      ...layer
    }));
    setLayers(newLayers);
  };

  return (
    <PluginWindow
      title="阴影设计"
      icon="🔲"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      className="shadow-designer-standalone"
      pluginId="shadow-designer"
      showStandaloneButton={false}
    >
      <div className={styles.container}>
        {/* 预览 */}
        <div className={styles.previewSection}>
          <div
            className={styles.previewBox}
            style={{ boxShadow: cssCode.replace('box-shadow: ', '').replace(';', '') }}
          >
            预览
          </div>
        </div>

        {/* 预设 */}
        <div className={styles.presets}>
          <h3>预设效果</h3>
          <div className={styles.presetGrid}>
            {presets.map((preset, index) => (
              <div
                key={index}
                className={styles.presetItem}
                onClick={() => applyPreset(preset)}
              >
                {preset.name}
              </div>
            ))}
          </div>
        </div>

        {/* 图层控制 */}
        <div className={styles.layersSection}>
          <div className={styles.layersHeader}>
            <h3>图层 ({layers.length})</h3>
            <button onClick={addLayer} className={styles.addButton}>
              ➕ 添加
            </button>
          </div>
          <div className={styles.layersList}>
            {layers.map((layer, index) => (
              <div key={layer.id} className={styles.layerCard}>
                <div className={styles.layerHeader}>
                  <span className={styles.layerNumber}>图层 {index + 1}</span>
                  {layers.length > 1 && (
                    <button
                      onClick={() => removeLayer(layer.id)}
                      className={styles.removeButton}
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div className={styles.layerControls}>
                  <div className={styles.controlRow}>
                    <div className={styles.control}>
                      <label>X偏移</label>
                      <input
                        type="number"
                        value={layer.xOffset}
                        onChange={(e) => updateLayer(layer.id, 'xOffset', Number(e.target.value))}
                        className={styles.numberInput}
                      />
                    </div>
                    <div className={styles.control}>
                      <label>Y偏移</label>
                      <input
                        type="number"
                        value={layer.yOffset}
                        onChange={(e) => updateLayer(layer.id, 'yOffset', Number(e.target.value))}
                        className={styles.numberInput}
                      />
                    </div>
                  </div>
                  <div className={styles.controlRow}>
                    <div className={styles.control}>
                      <label>模糊</label>
                      <input
                        type="number"
                        value={layer.blur}
                        onChange={(e) => updateLayer(layer.id, 'blur', Number(e.target.value))}
                        className={styles.numberInput}
                      />
                    </div>
                    <div className={styles.control}>
                      <label>扩展</label>
                      <input
                        type="number"
                        value={layer.spread}
                        onChange={(e) => updateLayer(layer.id, 'spread', Number(e.target.value))}
                        className={styles.numberInput}
                      />
                    </div>
                  </div>
                  <div className={styles.controlRow}>
                    <div className={styles.control}>
                      <label>颜色</label>
                      <div className={styles.colorControl}>
                        <input
                          type="color"
                          value={layer.color.includes('rgba') ? '#000000' : layer.color}
                          onChange={(e) => updateLayer(layer.id, 'color', e.target.value)}
                          className={styles.colorPicker}
                        />
                        <input
                          type="text"
                          value={layer.color}
                          onChange={(e) => updateLayer(layer.id, 'color', e.target.value)}
                          className={styles.colorInput}
                        />
                      </div>
                    </div>
                    <div className={styles.control}>
                      <label>类型</label>
                      <button
                        onClick={() => updateLayer(layer.id, 'inset', !layer.inset)}
                        className={`${styles.insetButton} ${layer.inset ? styles.active : ''}`}
                      >
                        {layer.inset ? '内阴影' : '外阴影'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CSS代码 */}
        <div className={styles.codeSection}>
          <h3>CSS代码</h3>
          <div className={styles.codeBlock}>
            <code>{cssCode}</code>
            <button onClick={copyCSS} className={styles.copyButton}>
              📋 复制
            </button>
          </div>
        </div>
      </div>
    </PluginWindow>
  );
};

export default ShadowDesigner;
