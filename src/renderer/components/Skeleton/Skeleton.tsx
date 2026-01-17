import React from 'react';
import './Skeleton.css';

export interface SkeletonProps {
  /** 骨架屏类型 */
  variant?: 'text' | 'circle' | 'rect' | 'card' | 'list';
  /** 宽度 */
  width?: string | number;
  /** 高度 */
  height?: string | number;
  /** 圆角 */
  borderRadius?: string | number;
  /** 是否动画 */
  animate?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 子元素（用于复杂骨架） */
  children?: React.ReactNode;
}

/**
 * 骨架屏组件
 *
 * 用于内容加载时显示占位符动画
 */
const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  borderRadius,
  animate = true,
  className = '',
  style: customStyle,
  children
}) => {
  const style: React.CSSProperties = {
    width,
    height,
    borderRadius,
    ...customStyle
  };

  const combinedClassName = `skeleton skeleton-${variant} ${animate ? 'skeleton-animate' : ''} ${className}`.trim();

  if (variant === 'card' || variant === 'list') {
    return <div className={combinedClassName}>{children}</div>;
  }

  return <div className={combinedClassName} style={style} />;
};

export default Skeleton;

/**
 * 文本骨架
 */
export function TextSkeleton({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`skeleton-text-group ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? '60%' : '100%'}
          style={{ marginBottom: i < lines - 1 ? '8px' : 0 }}
        />
      ))}
    </div>
  );
}

/**
 * 卡片骨架
 */
export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <Skeleton variant="card" className={`skeleton-card ${className}`}>
      <div className="skeleton-card-header">
        <Skeleton variant="circle" width={40} height={40} />
        <div className="skeleton-card-title">
          <Skeleton variant="text" width="60%" height={16} />
          <Skeleton variant="text" width="40%" height={14} />
        </div>
      </div>
      <div className="skeleton-card-body">
        <Skeleton variant="rect" width="100%" height={120} />
      </div>
    </Skeleton>
  );
}

/**
 * 列表项骨架
 */
export function ListItemSkeleton({ className = '' }: { className?: string }) {
  return (
    <Skeleton variant="list" className={`skeleton-list-item ${className}`}>
      <Skeleton variant="circle" width={48} height={48} />
      <div className="skeleton-list-content">
        <Skeleton variant="text" width="70%" height={16} />
        <Skeleton variant="text" width="40%" height={14} />
      </div>
    </Skeleton>
  );
}

/**
 * 插件卡片骨架
 */
export function PluginCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`skeleton-plugin-card ${className}`}>
      <Skeleton variant="text" width="100%" height={80} />
      <Skeleton variant="text" width="80%" height={16} />
      <Skeleton variant="text" width="60%" height={14} />
    </div>
  );
}
