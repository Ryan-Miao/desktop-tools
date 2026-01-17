/**
 * 统一动画过渡系统
 *
 * 提供常用的动画效果和过渡配置
 * 使用 CSS animations 和 transitions 实现，无需额外依赖
 */

// ==================== 动画类型 ====================

export type AnimationType =
  | 'fadeIn'
  | 'fadeOut'
  | 'slideUp'
  | 'slideDown'
  | 'slideLeft'
  | 'slideRight'
  | 'scaleIn'
  | 'scaleOut'
  | 'bounceIn'
  | 'flipIn';

// ==================== 动画配置接口 ====================

export interface AnimationConfig {
  /** 动画类型 */
  type: AnimationType;
  /** 持续时间（毫秒） */
  duration?: number;
  /** 延迟（毫秒） */
  delay?: number;
  /** 缓动函数 */
  easing?: string;
  /** 是否在动画完成后保持最终状态 */
  fillMode?: 'forwards' | 'backwards' | 'both' | 'none';
}

// ==================== 预定义动画配置 ====================

/**
 * 淡入动画
 */
export const fadeIn: AnimationConfig = {
  type: 'fadeIn',
  duration: 200,
  easing: 'ease-out',
  fillMode: 'forwards'
};

/**
 * 淡出动画
 */
export const fadeOut: AnimationConfig = {
  type: 'fadeOut',
  duration: 150,
  easing: 'ease-in',
  fillMode: 'forwards'
};

/**
 * 向上滑入动画
 */
export const slideUp: AnimationConfig = {
  type: 'slideUp',
  duration: 300,
  easing: 'ease-out',
  fillMode: 'forwards'
};

/**
 * 向下滑出动画
 */
export const slideDown: AnimationConfig = {
  type: 'slideDown',
  duration: 300,
  easing: 'ease-in',
  fillMode: 'forwards'
};

/**
 * 从左侧滑入动画
 */
export const slideLeft: AnimationConfig = {
  type: 'slideLeft',
  duration: 250,
  easing: 'ease-out',
  fillMode: 'forwards'
};

/**
 * 从右侧滑入动画
 */
export const slideRight: AnimationConfig = {
  type: 'slideRight',
  duration: 250,
  easing: 'ease-out',
  fillMode: 'forwards'
};

/**
 * 缩放淡入动画
 */
export const scaleIn: AnimationConfig = {
  type: 'scaleIn',
  duration: 200,
  easing: 'ease-out',
  fillMode: 'forwards'
};

/**
 * 缩放淡出动画
 */
export const scaleOut: AnimationConfig = {
  type: 'scaleOut',
  duration: 150,
  easing: 'ease-in',
  fillMode: 'forwards'
};

/**
 * 弹跳进入动画
 */
export const bounceIn: AnimationConfig = {
  type: 'bounceIn',
  duration: 600,
  easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  fillMode: 'forwards'
};

/**
 * 翻转进入动画
 */
export const flipIn: AnimationConfig = {
  type: 'flipIn',
  duration: 400,
  easing: 'ease-out',
  fillMode: 'forwards'
};

// ==================== 动画配置集合 ====================

export const animations = {
  fadeIn,
  fadeOut,
  slideUp,
  slideDown,
  slideLeft,
  slideRight,
  scaleIn,
  scaleOut,
  bounceIn,
  flipIn
};

// ==================== 常用缓动函数 ====================

export const easings = {
  /** 线性 */
  linear: 'linear',

  /** 缓入 */
  easeIn: 'ease-in',

  /** 缓出 */
  easeOut: 'ease-out',

  /** 缓入缓出 */
  easeInOut: 'ease-in-out',

  /** 自定义缓动 */
  custom: {
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bouncy: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)'
  }
};

// ==================== 动画工具函数 ====================

/**
 * 生成动画 CSS 字符串
 */
export function getAnimationString(config: AnimationConfig): string {
  const { type, duration = 300, easing = 'ease-out', delay = 0, fillMode = 'forwards' } = config;

  const animationName = `${type}-${Date.now()}`;
  const animationValue = `${type} ${duration}ms ${easing} ${delay}ms ${fillMode}`;

  return {
    animationName,
    animationValue
  }.animationValue;
}

/**
 * 应用动画到元素
 */
export function applyAnimation(
  element: HTMLElement,
  config: AnimationConfig
): void {
  const animationString = getAnimationString(config);
  element.style.animation = animationString;
}

/**
 * 移除动画
 */
export function removeAnimation(element: HTMLElement): void {
  element.style.animation = '';
}

/**
 * 等待动画完成
 */
export function waitForAnimation(element: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    const handleAnimationEnd = () => {
      element.removeEventListener('animationend', handleAnimationEnd);
      resolve();
    };

    element.addEventListener('animationend', handleAnimationEnd);
  });
}

// ==================== React Hook ====================

/**
 * 动画 Hook（用于 React 组件）
 * 返回动画类名和样式
 */
export interface UseAnimationResult {
  className: string;
  style: React.CSSProperties;
}

export function useAnimation(config: AnimationConfig): UseAnimationResult {
  const animationStyle: React.CSSProperties = {
    animation: getAnimationString(config)
  };

  return {
    className: `animate-${config.type}`,
    style: animationStyle
  };
}

// ==================== 预设动画组合 ====================

/**
 * 页面切换动画组合
 */
export const pageTransitions = {
  enter: scaleIn,
  exit: scaleOut
};

/**
 * 模态框动画组合
 */
export const modalTransitions = {
  enter: fadeIn,
  exit: fadeOut
};

/**
 * 侧边栏动画组合
 */
export const sidebarTransitions = {
  enter: slideLeft,
  exit: slideLeft
};

/**
 * 提示框动画组合
 */
export const tooltipTransitions = {
  enter: fadeIn,
  exit: fadeOut
};

/**
 * 卡片动画组合
 */
export const cardTransitions = {
  enter: scaleIn,
  exit: scaleOut
};

// ==================== 动画状态 ====================

export interface AnimationState {
  isAnimating: boolean;
  animationType?: AnimationType;
}

/**
 * 创建动画状态
 */
export function createAnimationState(
  initial: AnimationState = { isAnimating: false }
): AnimationState {
  return initial;
}

// ==================== 导出所有 ====================

export default {
  animations,
  easings,
  applyAnimation,
  removeAnimation,
  waitForAnimation,
  useAnimation,
  pageTransitions,
  modalTransitions,
  sidebarTransitions,
  tooltipTransitions,
  cardTransitions
};
