/**
 * 插件市场面板组件
 * 全屏模态框，用于浏览和安装 npm 插件
 */

import React from 'react';
import PluginMarket from './PluginMarket';
import './PluginMarketPanel.css';

interface PluginMarketPanelProps {
  onClose: () => void;
}

export default function PluginMarketPanel({ onClose }: PluginMarketPanelProps) {
  // 处理 ESC 键关闭
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="plugin-market-panel-overlay" onClick={onClose}>
      <div
        className="plugin-market-panel-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="plugin-market-panel-header">
          <h2>🛒 插件市场</h2>
          <button
            className="plugin-market-panel-close"
            onClick={onClose}
            aria-label="关闭"
            title="关闭 (ESC)"
          >
            ✕
          </button>
        </div>

        <div className="plugin-market-panel-body">
          <PluginMarket />
        </div>
      </div>
    </div>
  );
}
