/**
 * Accessibility Utilities
 *
 * Helper functions for ARIA labels and accessibility features
 */

export const ARIA_LABELS = {
  // Window Controls
  MINIMIZE: '最小化窗口',
  MAXIMIZE: '最大化窗口',
  RESTORE: '还原窗口',
  CLOSE: '关闭窗口',

  // Settings
  OPEN_SETTINGS: '打开设置',
  CLOSE_SETTINGS: '关闭设置',
  THEME_TOGGLE: '切换主题',

  // Plugin Manager
  OPEN_PLUGIN_MANAGER: '打开插件管理器',
  CLOSE_PLUGIN_MANAGER: '关闭插件管理器',
  ENABLE_PLUGIN: '启用插件',
  DISABLE_PLUGIN: '禁用插件',
  DELETE_PLUGIN: '删除插件',
  EXPORT_PLUGIN: '导出插件',

  // Plugin Market
  OPEN_PLUGIN_MARKET: '打开插件市场',
  CLOSE_PLUGIN_MARKET: '关闭插件市场',
  INSTALL_PLUGIN: '安装插件',
  SEARCH_PLUGINS: '搜索插件',

  // Backup
  OPEN_BACKUP: '打开数据备份',
  CLOSE_BACKUP: '关闭数据备份',
  CREATE_BACKUP: '创建备份',
  RESTORE_BACKUP: '恢复备份',

  // General
  SEARCH: '搜索',
  CLEAR_SEARCH: '清除搜索',
  LOADING: '加载中',
  ERROR: '错误',
  SUCCESS: '成功',
} as const;

/**
 * Generate ARIA props for button-like elements
 */
export function getButtonAriaProps(options: {
  label: string;
  description?: string;
  pressed?: boolean;
  expanded?: boolean;
  disabled?: boolean;
}) {
  const props: Record<string, any> = {
    'aria-label': options.label,
    role: 'button',
  };

  if (options.description) {
    props['aria-describedby'] = options.description;
  }

  if (options.pressed !== undefined) {
    props['aria-pressed'] = options.pressed;
  }

  if (options.expanded !== undefined) {
    props['aria-expanded'] = options.expanded;
  }

  if (options.disabled !== undefined) {
    props['aria-disabled'] = options.disabled;
  }

  return props;
}

/**
 * Generate ARIA props for input elements
 */
export function getInputAriaProps(options: {
  label: string;
  description?: string;
  required?: boolean;
  invalid?: boolean;
  errorMessage?: string;
}) {
  const props: Record<string, any> = {
    'aria-label': options.label,
  };

  if (options.description) {
    props['aria-describedby'] = options.description;
  }

  if (options.required) {
    props['aria-required'] = true;
  }

  if (options.invalid !== undefined) {
    props['aria-invalid'] = options.invalid;
  }

  if (options.errorMessage) {
    props['aria-errormessage'] = options.errorMessage;
  }

  return props;
}

/**
 * Generate ARIA props for dialog/modal
 */
export function getDialogAriaProps(options: {
  label: string;
  description?: string;
  modal?: boolean;
}) {
  const props: Record<string, any> = {
    role: 'dialog',
    'aria-label': options.label,
  };

  if (options.description) {
    props['aria-describedby'] = options.description;
  }

  if (options.modal) {
    props['aria-modal'] = true;
  }

  return props;
}

/**
 * Generate ARIA live region props for dynamic content
 */
export function getLiveRegionProps(options: {
  polite?: boolean;
  assertive?: boolean;
}) {
  const props: Record<string, any> = {
    'aria-live': options.polite ? 'polite' : 'assertive',
  };

  return props;
}

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  // Create or get live region
  let liveRegion = document.getElementById(`a11y-live-region-${priority}`);

  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = `a11y-live-region-${priority}`;
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-10000px';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.overflow = 'hidden';
    document.body.appendChild(liveRegion);
  }

  // Clear and set new message
  liveRegion.textContent = '';
  setTimeout(() => {
    liveRegion!.textContent = message;
  }, 100);
}

/**
 * Trap focus within a container (for modals)
 */
export function trapFocus(container: HTMLElement) {
  const focusableElements = container.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };

  container.addEventListener('keydown', handleTabKey);

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleTabKey);
  };
}

/**
 * Check if element is focusable
 */
export function isFocusable(element: HTMLElement): boolean {
  if (
    element.hasAttribute('disabled') ||
    element.getAttribute('tabindex') === '-1'
  ) {
    return false;
  }

  const focusableTags = ['BUTTON', 'A', 'INPUT', 'TEXTAREA', 'SELECT'];
  const isFocusableTag = focusableTags.includes(element.tagName);
  const hasTabindex = element.hasAttribute('tabindex');

  return isFocusableTag || hasTabindex;
}

/**
 * Get all focusable elements in a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  return Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
}
