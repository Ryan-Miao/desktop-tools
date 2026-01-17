import React from 'react';
import './ProgressBar.css';

export interface ProgressBarProps {
  /** 进度值 (0-100)，undefined 表示不确定进度 */
  value?: number;
  /** 颜色 */
  color?: string;
  /** 高度 */
  size?: 'small' | 'medium' | 'large';
  /** 是否显示百分比文本 */
  showLabel?: boolean;
  /** 状态 */
  status?: 'normal' | 'success' | 'warning' | 'error';
  /** 自定义类名 */
  className?: string;
  /** 动画持续时间 */
  animationDuration?: number;
}

/**
 * 进度条组件
 *
 * 支持确定和不确定的进度动画
 */
const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  color,
  size = 'medium',
  showLabel = false,
  status = 'normal',
  className = '',
  animationDuration = 300
}) => {
  const isIndeterminate = value === undefined;
  const percentage = value ? Math.min(100, Math.max(0, value)) : 0;

  const style: React.CSSProperties = {
    '--progress-value': `${percentage}%`,
    '--progress-color': color || '',
    '--progress-duration': `${animationDuration}ms`
  } as React.CSSProperties;

  const combinedClassName = `progress-bar progress-${size} progress-${status} ${isIndeterminate ? 'progress-indeterminate' : ''} ${className}`.trim();

  return (
    <div className={combinedClassName} style={style}>
      <div className="progress-track">
        <div className="progress-fill"></div>
        {isIndeterminate && <div className="progress-indeterminate-overlay"></div>}
      </div>
      {showLabel && !isIndeterminate && (
        <div className="progress-label">{percentage}%</div>
      )}
    </div>
  );
};

export default ProgressBar;

/**
 * 线形进度条（默认）
 */
export function LinearProgress(props: ProgressBarProps) {
  return <ProgressBar {...props} />;
}

/**
 * 圆形进度条
 */
export interface CircularProgressProps extends Omit<ProgressBarProps, 'size'> {
  /** 尺寸（像素） */
  size?: number;
  /** 线条宽度 */
  strokeWidth?: number;
}

export function CircularProgress({
  value,
  size = 40,
  strokeWidth = 4,
  color,
  showLabel = false,
  status = 'normal',
  className = ''
}: CircularProgressProps) {
  const isIndeterminate = value === undefined;
  const percentage = value ? Math.min(100, Math.max(0, value)) : 0;

  // 计算圆周长
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const style: React.CSSProperties = {
    width: size,
    height: size,
    '--progress-size': `${size}px`,
    '--progress-stroke': `${strokeWidth}px`,
    '--progress-circumference': `${circumference}px`,
    '--progress-offset': `${offset}px`,
    '--progress-color': color || ''
  } as React.CSSProperties;

  const combinedClassName = `circular-progress ${isIndeterminate ? 'circular-indeterminate' : ''} circular-${status} ${className}`.trim();

  return (
    <div className={combinedClassName} style={style}>
      <svg className="circular-progress-svg" viewBox={`0 0 ${size} ${size}`}>
        {/* 背景圆 */}
        <circle
          className="circular-progress-track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
        />
        {/* 进度圆 */}
        <circle
          className="circular-progress-fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      {showLabel && !isIndeterminate && (
        <div className="circular-progress-label">{percentage}%</div>
      )}
    </div>
  );
}

/**
 * 分段进度条
 */
export interface SegmentedProgressProps {
  /** 总段数 */
  total: number;
  /** 当前进度 */
  current: number;
  /** 颜色 */
  color?: string;
  /** 大小 */
  size?: 'small' | 'medium' | 'large';
  /** 自定义类名 */
  className?: string;
}

export function SegmentedProgress({
  total,
  current,
  color,
  size = 'medium',
  className = ''
}: SegmentedProgressProps) {
  const segments = Array.from({ length: total }, (_, i) => i < current);

  return (
    <div className={`segmented-progress segmented-${size} ${className}`}>
      {segments.map((_, i) => (
        <div
          key={i}
          className="segment"
          style={{
            backgroundColor: _ ? color : 'rgba(0, 0, 0, 0.1)'
          }}
        />
      ))}
    </div>
  );
}
