import React from 'react';
import './Loading.css';

export interface LoadingProps {
  /** 加载类型 */
  type?: 'spinner' | 'dots' | 'pulse' | 'bar';
  /** 尺寸 */
  size?: 'small' | 'medium' | 'large';
  /** 颜色 */
  color?: string;
  /** 文本提示 */
  text?: string;
  /** 全屏显示 */
  fullscreen?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 遮罩背景 */
  overlay?: boolean;
}

/**
 * 统一加载状态组件
 *
 * 支持多种加载动画样式：
 * - spinner: 旋转圆环
 * - dots: 点状动画
 * - pulse: 脉冲动画
 * - bar: 进度条
 */
const Loading: React.FC<LoadingProps> = ({
  type = 'spinner',
  size = 'medium',
  color,
  text,
  fullscreen = false,
  className = '',
  overlay = false
}) => {
  const sizeClass = `loading-${size}`;
  const typeClass = `loading-${type}`;
  const combinedClassName = `loading ${sizeClass} ${typeClass} ${className}`.trim();

  const content = (
    <div className={combinedClassName}>
      {/* Spinner 旋转圆环 */}
      {type === 'spinner' && (
        <div className="loading-spinner">
          <div className="spinner-ring" style={color ? { borderColor: color } : undefined}></div>
          <div className="spinner-ring" style={color ? { borderColor: color } : undefined}></div>
          <div className="spinner-ring" style={color ? { borderColor: color } : undefined}></div>
          <div className="spinner-ring" style={color ? { borderColor: color } : undefined}></div>
        </div>
      )}

      {/* Dots 点状动画 */}
      {type === 'dots' && (
        <div className="loading-dots">
          <div className="dot" style={{ backgroundColor: color }}></div>
          <div className="dot" style={{ backgroundColor: color }}></div>
          <div className="dot" style={{ backgroundColor: color }}></div>
        </div>
      )}

      {/* Pulse 脉冲动画 */}
      {type === 'pulse' && (
        <div className="loading-pulse">
          <div className="pulse-ring" style={{ borderColor: color }}></div>
          <div className="pulse-ring" style={{ borderColor: color }}></div>
          <div className="pulse-ring" style={{ borderColor: color }}></div>
        </div>
      )}

      {/* Bar 进度条 */}
      {type === 'bar' && (
        <div className="loading-bar">
          <div className="bar-track" style={{ backgroundColor: `${color}20` }}>
            <div className="bar-fill" style={{ backgroundColor: color }}></div>
          </div>
        </div>
      )}

      {/* 文本提示 */}
      {text && <div className="loading-text">{text}</div>}
    </div>
  );

  // 全屏模式
  if (fullscreen) {
    return (
      <div className="loading-fullscreen">
        {overlay && <div className="loading-overlay"></div>}
        {content}
      </div>
    );
  }

  return content;
};

export { Loading };
export default Loading;

/**
 * 快捷方法：全屏加载
 */
export function FullscreenLoading(props: Omit<LoadingProps, 'fullscreen'>) {
  return <Loading {...props} fullscreen overlay />;
}

/**
 * 快捷方法：小尺寸加载
 */
export function SmallLoading(props: LoadingProps) {
  return <Loading {...props} size="small" />;
}

/**
 * 快捷方法：点状加载
 */
export function DotsLoading(props: LoadingProps) {
  return <Loading {...props} type="dots" />;
}
