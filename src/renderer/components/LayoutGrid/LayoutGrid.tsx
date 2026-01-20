/**
 * Layout Grid Plugin
 *
 * CSS Grid布局生成器
 */

import React, { useState, useEffect } from 'react';
import PluginWindow from '../PluginWindow/PluginWindow';
import styles from './LayoutGrid.module.css';

interface LayoutGridProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

const LayoutGrid: React.FC<LayoutGridProps> = ({ onClose, onMinimize, onMaximize }) => {
  const [columns, setColumns] = useState<string>('repeat(3, 1fr)');
  const [rows, setRows] = useState<string>('auto');
  const [gap, setGap] = useState<number>(16);
  const [cellCount, setCellCount] = useState<number>(6);
  const [cssCode, setCssCode] = useState('');

  // 生成CSS代码
  useEffect(() => {
    const css = `.container {
  display: grid;
  grid-template-columns: ${columns};
  grid-template-rows: ${rows};
  gap: ${gap}px;
}`;

    setCssCode(css);
  }, [columns, rows, gap]);

  // 预设布局
  const presets = [
    { name: '2列', columns: 'repeat(2, 1fr)', gap: 16 },
    { name: '3列', columns: 'repeat(3, 1fr)', gap: 16 },
    { name: '4列', columns: 'repeat(4, 1fr)', gap: 16 },
    { name: '侧边栏', columns: '250px 1fr', gap: 16 },
    { name: '响应式', columns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    setColumns(preset.columns);
    setGap(preset.gap);
  };

  return (
    <PluginWindow
      title="布局网格"
      icon="📐"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      className="layout-grid-standalone"
      pluginId="layout-grid"
      showStandaloneButton={false}
    >
      <div className={styles.container}>
        {/* 预览 */}
        <div className={styles.previewSection}>
          <div
            className={styles.gridPreview}
            style={{
              gridTemplateColumns: columns,
              gridTemplateRows: rows,
              gap: `${gap}px`
            }}
          >
            {Array.from({ length: cellCount }).map((_, index) => (
              <div key={index} className={styles.gridCell}>
                {index + 1}
              </div>
            ))}
          </div>
        </div>

        {/* 控制面板 */}
        <div className={styles.controls}>
          <div className={styles.controlGroup}>
            <label>列 (grid-template-columns)</label>
            <input
              type="text"
              value={columns}
              onChange={(e) => setColumns(e.target.value)}
              className={styles.input}
              placeholder="repeat(3, 1fr)"
            />
          </div>

          <div className={styles.controlGroup}>
            <label>行 (grid-template-rows)</label>
            <input
              type="text"
              value={rows}
              onChange={(e) => setRows(e.target.value)}
              className={styles.input}
              placeholder="auto"
            />
          </div>

          <div className={styles.controlGroup}>
            <label>间距: {gap}px</label>
            <input
              type="range"
              min="0"
              max="40"
              value={gap}
              onChange={(e) => setGap(Number(e.target.value))}
              className={styles.slider}
            />
          </div>

          <div className={styles.controlGroup}>
            <label>单元格数量: {cellCount}</label>
            <input
              type="range"
              min="1"
              max="12"
              value={cellCount}
              onChange={(e) => setCellCount(Number(e.target.value))}
              className={styles.slider}
            />
          </div>
        </div>

        {/* 预设 */}
        <div className={styles.presets}>
          <h3>预设布局</h3>
          <div className={styles.presetGrid}>
            {presets.map((preset, index) => (
              <button
                key={index}
                onClick={() => applyPreset(preset)}
                className={styles.presetButton}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* CSS代码 */}
        <div className={styles.codeSection}>
          <h3>CSS代码</h3>
          <div className={styles.codeBlock}>
            <pre>{cssCode}</pre>
            <button
              onClick={() => navigator.clipboard.writeText(cssCode)}
              className={styles.copyButton}
            >
              📋 复制
            </button>
          </div>
        </div>
      </div>
    </PluginWindow>
  );
};

export default LayoutGrid;
