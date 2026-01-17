import React, { useState, useEffect } from 'react';
import './PluginWindow.css';

interface PluginWindowProps {
  /** 窗口标题 */
  title: string;
  /** 窗口图标 (emoji 或图片URL) */
  icon?: string;
  /** 主题ID (继承主窗口主题) */
  themeId?: string;
  /** 面板透明度 (0-100) */
  opacity?: number;
  /** 子元素 */
  children: React.ReactNode;
  /** 关闭回调 */
  onClose: () => void;
  /** 最大化回调 */
  onMaximize?: () => void;
  /** 最小化回调 */
  onMinimize?: () => void;
  /** 是否可调整大小 */
  resizable?: boolean;
  /** 是否可最大化 */
  maximizable?: boolean;
  /** 是否可最小化 */
  minimizable?: boolean;
  /** 是否显示标题栏 */
  showHeader?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 是否显示关闭按钮 */
  showCloseButton?: boolean;
  /** 插件ID（用于独立窗口功能） */
  pluginId?: string;
  /** 是否显示独立窗口按钮 */
  showStandaloneButton?: boolean;
}

/**
 * 统一插件窗口组件
 *
 * 功能：
 * - 统一的标题栏（图标、标题、控制按钮）
 * - 统一的内容区（自动滚动、统一边距）
 * - 继承主窗口主题
 * - 毛玻璃效果
 * - 支持拖拽（在 Electron 中由主窗口处理）
 * - 响应式设计
 */
const PluginWindow: React.FC<PluginWindowProps> = ({
  title,
  icon,
  themeId,
  opacity = 85,
  children,
  onClose,
  onMaximize,
  onMinimize,
  resizable = true,
  maximizable = true,
  minimizable = true,
  showHeader = true,
  className = '',
  showCloseButton = true,
  pluginId,
  showStandaloneButton = false
}) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // 监听最大化状态变化（Electron 窗口事件）
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).electron) {
      const ipcRenderer = (window as any).electron.ipcRenderer;

      const handleMaximized = () => setIsMaximized(true);
      const handleUnmaximized = () => setIsMaximized(false);

      ipcRenderer.on('window:maximized', handleMaximized);
      ipcRenderer.on('window:unmaximized', handleUnmaximized);

      return () => {
        // 移除监听器（Electron 中不同版本API不同，这里不做清理）
        // 监听器会随着组件卸载自动失效
      };
    }
  }, []);

  const handleMaximizeClick = () => {
    if (onMaximize) {
      onMaximize();
    } else if (typeof window !== 'undefined' && (window as any).electron) {
      // 默认行为：通过 IPC 最大化窗口
      (window as any).electron.ipcRenderer.invoke('window:maximize');
    }
  };

  const handleMinimizeClick = () => {
    if (onMinimize) {
      onMinimize();
    } else if (typeof window !== 'undefined' && (window as any).electron) {
      // 默认行为：通过 IPC 最小化窗口
      (window as any).electron.ipcRenderer.invoke('window:minimize');
    }
  };

  const handleCloseClick = () => {
    onClose();
  };

  const handleOpenStandalone = async () => {
    console.log('[PluginWindow] Opening standalone window for plugin:', pluginId);
    if (!pluginId || !window.electron?.ipcRenderer) return;

    try {
      await window.electron.ipcRenderer.invoke('plugin:open-standalone', pluginId, title);
      // 打开独立窗口后，关闭当前模态框
      onClose();
    } catch (error) {
      console.error('Failed to open standalone window:', error);
    }
  };

  // 应用透明度和主题
  const style = {
    '--plugin-window-opacity': opacity / 100
  } as React.CSSProperties;

  const windowClassName = `plugin-window ${className}`.trim();

  // 调试日志
  if (showHeader && showStandaloneButton && pluginId) {
    console.log('[PluginWindow] Standalone button should be visible:', { pluginId, showStandaloneButton });
  }

  return (
    <div
      className={windowClassName}
      style={style}
      data-theme={themeId}
      data-plugin-id={pluginId}
      data-standalone-button={showStandaloneButton ? 'true' : 'false'}
    >
      {/* 标题栏 */}
      {showHeader && (
        <div className="plugin-window-header">
          <div className="plugin-window-title">
            {icon && <span className="plugin-window-icon">{icon}</span>}
            <span className="plugin-window-title-text">{title}</span>
          </div>
          {/* 调试标记 - 放在标题栏右侧，独立于控制按钮 */}
          {(pluginId || showStandaloneButton) && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '10px',
              fontWeight: 'bold',
              padding: '0 8px',
              background: 'rgba(255, 0, 0, 0.2)',
              borderRadius: '4px'
            }}>
              {pluginId && <span style={{ color: 'red' }}>ID:{pluginId}</span>}
              {showStandaloneButton && <span style={{ color: 'red' }}>BTN</span>}
            </div>
          )}
          <div className="plugin-window-controls">
            {showStandaloneButton && pluginId && (
              <button
                className="window-control-button standalone"
                onClick={handleOpenStandalone}
                title="弹出独立窗口"
              >
                <span>⎘</span>
              </button>
            )}
            {minimizable && (
              <button
                className="window-control-button minimize"
                onClick={handleMinimizeClick}
                title="最小化"
              >
                <span>−</span>
              </button>
            )}
            {maximizable && (
              <button
                className="window-control-button maximize"
                onClick={handleMaximizeClick}
                title={isMaximized ? "还原" : "最大化"}
              >
                {isMaximized ? <span>❐</span> : <span>□</span>}
              </button>
            )}
            {showCloseButton && (
              <button
                className="window-control-button close"
                onClick={handleCloseClick}
                title="关闭"
              >
                <span>×</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 内容区 */}
      <div className="plugin-window-content">
        {children}
      </div>
    </div>
  );
};

export default PluginWindow;
