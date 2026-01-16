import React, { useState, useEffect, useRef, useCallback } from 'react';
import './PluginWindow.css';

interface PluginWindowProps {
  id: string;
  pluginId: string;
  title: string;
  icon?: string;
  children: React.ReactNode;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onRestore?: () => void;
  isMaximized?: boolean;
  showMinimizeButton?: boolean;
  showMaximizeButton?: boolean;
  resizable?: boolean;
  themeId?: string;
}

/**
 * 统一的插件窗口组件
 *
 * 功能：
 * - 统一的窗口头部（标题 + 控制按钮）
 * - ESC 键关闭绑定
 * - 最大化/还原
 * - 拖拽移动
 * - 主题适配
 * - Glassmorphism 风格
 */
const PluginWindow: React.FC<PluginWindowProps> = ({
  id,
  pluginId,
  title,
  icon,
  children,
  onClose,
  onMinimize,
  onMaximize,
  onRestore,
  isMaximized = false,
  showMinimizeButton = true,
  showMaximizeButton = true,
  resizable = true,
  themeId = 'light-blue'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 600, height: 400 });

  const windowRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // ESC 键关闭绑定
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // 恢复窗口状态
  useEffect(() => {
    const loadWindowState = async () => {
      try {
        const state = await window.electron?.ipcRenderer?.invoke('plugin-window:get-state', id);
        if (state) {
          if (state.x !== undefined) setPosition(prev => ({ ...prev, x: state.x }));
          if (state.y !== undefined) setPosition(prev => ({ ...prev, y: state.y }));
          if (state.width !== undefined) setSize(prev => ({ ...prev, width: state.width }));
          if (state.height !== undefined) setSize(prev => ({ ...prev, height: state.height }));
        }
      } catch (error) {
        console.error('Failed to load window state:', error);
      }
    };

    loadWindowState();
  }, [id]);

  // 保存窗口状态
  useEffect(() => {
    const saveWindowState = async () => {
      try {
        await window.electron?.ipcRenderer?.invoke('plugin-window:set-state', id, {
          x: position.x,
          y: position.y,
          width: size.width,
          height: size.height,
          isMaximized
        });
      } catch (error) {
        console.error('Failed to save window state:', error);
      }
    };

    // 防抖保存
    const timeout = setTimeout(saveWindowState, 500);
    return () => clearTimeout(timeout);
  }, [id, position, size, isMaximized]);

  // 拖拽开始
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (!resizable) return;
    if (!headerRef.current) return;

    setIsDragging(true);
    const rect = windowRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  }, [resizable]);

  // 拖拽移动
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // 窗口控制
  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const handleMinimize = useCallback(() => {
    onMinimize?.();
  }, [onMinimize]);

  const handleMaximize = useCallback(() => {
    if (isMaximized) {
      onRestore?.();
    } else {
      onMaximize?.();
    }
  }, [isMaximized, onMaximize, onRestore]);

  // 窗口样式
  const windowStyle: React.CSSProperties = {
    position: 'fixed',
    left: position.x,
    top: position.y,
    width: size.width,
    height: size.height,
    zIndex: 1000,
    cursor: isDragging ? 'move' : 'default'
  };

  return (
    <div
      ref={windowRef}
      className={`plugin-window plugin-window-${themeId}`}
      style={windowStyle}
      data-plugin-id={pluginId}
      data-window-id={id}
    >
      {/* 窗口头部 */}
      <div
        ref={headerRef}
        className="plugin-window-header"
        onMouseDown={handleDragStart}
      >
        {/* 标题 */}
        <div className="plugin-window-title">
          {icon && <span className="plugin-window-icon">{icon}</span>}
          <span className="plugin-window-title-text">{title}</span>
        </div>

        {/* 控制按钮 */}
        <div className="plugin-window-controls">
          {/* 最小化按钮 */}
          {showMinimizeButton && (
            <button
              className="plugin-window-button plugin-window-button-minimize"
              onClick={handleMinimize}
              aria-label="最小化"
              title="最小化 (M)"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect
                  x="2"
                  y="12"
                  width="10"
                  height="1"
                  rx="0.5"
                  fill="currentColor"
                />
              </svg>
            </button>
          )}

          {/* 最大化/还原按钮 */}
          {showMaximizeButton && (
            <button
              className="plugin-window-button plugin-window-button-maximize"
              onClick={handleMaximize}
              aria-label={isMaximized ? '还原' : '最大化'}
              title={isMaximized ? '还原 (Shift+M)' : '最大化 (Shift+M)'}
            >
              {isMaximized ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect
                    x="2"
                    y="2"
                    width="10"
                    height="10"
                    rx="1"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect
                    x="1"
                    y="1"
                    width="12"
                    height="12"
                    rx="2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              )}
            </button>
          )}

          {/* 关闭按钮 */}
          <button
            className="plugin-window-button plugin-window-button-close"
            onClick={handleClose}
            aria-label="关闭"
            title="关闭 (ESC)"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* 窗口内容 */}
      <div className="plugin-window-body">
        {children}
      </div>

      {/* 调整大小的手柄 */}
      {resizable && (
        <>
          <div className="plugin-window-resize-handle plugin-window-resize-handle-e" />
          <div className="plugin-window-resize-handle plugin-window-resize-handle-s" />
          <div className="plugin-window-resize-handle plugin-window-resize-handle-se" />
        </>
      )}
    </div>
  );
};

export default PluginWindow;
