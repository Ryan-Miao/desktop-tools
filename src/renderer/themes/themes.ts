/**
 * 主题配置
 * 定义应用的所有主题样式
 */

export interface Theme {
  id: string;
  name: string;
  icon: string;
  mode: 'light' | 'dark';
  colors: {
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
  };
  glass: {
    blur: number;
    opacity: number;
    saturate: number;
  };
}

export const themes: Theme[] = [
  // ==================== 浅色主题 ====================
  {
    id: 'light-blue',
    name: '天空蓝',
    icon: '🌤️',
    mode: 'light',
    colors: {
      background: 'rgba(255, 255, 255, 0.7)',
      foreground: '#000000',
      primary: '#007AFF',
      secondary: '#5AC8FA',
      accent: '#FF2D55',
      success: '#34C759',
      warning: '#FF9500',
      error: '#FF3B30'
    },
    glass: {
      blur: 20,
      opacity: 0.7,
      saturate: 180
    }
  },
  {
    id: 'light-purple',
    name: '薰衣草紫',
    icon: '💜',
    mode: 'light',
    colors: {
      background: 'rgba(250, 245, 255, 0.75)',
      foreground: '#1A1025',
      primary: '#AF52DE',
      secondary: '#BF5AF2',
      accent: '#FF6482',
      success: '#30D158',
      warning: '#FF9F0A',
      error: '#FF453A'
    },
    glass: {
      blur: 20,
      opacity: 0.75,
      saturate: 180
    }
  },
  {
    id: 'light-pink',
    name: '樱花粉',
    icon: '🌸',
    mode: 'light',
    colors: {
      background: 'rgba(255, 240, 245, 0.75)',
      foreground: '#1F050A',
      primary: '#FF2D55',
      secondary: '#FF6482',
      accent: '#007AFF',
      success: '#34C759',
      warning: '#FF9500',
      error: '#FF3B30'
    },
    glass: {
      blur: 20,
      opacity: 0.75,
      saturate: 180
    }
  },
  {
    id: 'light-green',
    name: '薄荷绿',
    icon: '🍃',
    mode: 'light',
    colors: {
      background: 'rgba(240, 255, 240, 0.75)',
      foreground: '#051F0A',
      primary: '#30D158',
      secondary: '34C759',
      accent: '#FF2D55',
      success: '#32D74B',
      warning: '#FF9500',
      error: '#FF453A'
    },
    glass: {
      blur: 20,
      opacity: 0.75,
      saturate: 180
    }
  },
  {
    id: 'light-orange',
    name: '暖阳橙',
    icon: '🌅',
    mode: 'light',
    colors: {
      background: 'rgba(255, 248, 240, 0.75)',
      foreground: '#1F0F00',
      primary: '#FF9500',
      secondary: '#FF5E3A',
      accent: '#007AFF',
      success: '#34C759',
      warning: '#FF9F0A',
      error: '#FF3B30'
    },
    glass: {
      blur: 20,
      opacity: 0.75,
      saturate: 180
    }
  },
  {
    id: 'light-teal',
    name: '清新青',
    icon: '🌊',
    mode: 'light',
    colors: {
      background: 'rgba(235, 250, 245, 0.75)',
      foreground: '#001A14',
      primary: '#64D2FF',
      secondary: '5AC8FA',
      accent: '#FF2D55',
      success: '#30D158',
      warning: '#FF9500',
      error: '#FF3B30'
    },
    glass: {
      blur: 20,
      opacity: 0.75,
      saturate: 180
    }
  },

  // ==================== 深色主题 ====================
  {
    id: 'dark-ocean',
    name: '深海蓝',
    icon: '🌊',
    mode: 'dark',
    colors: {
      background: 'rgba(30, 40, 50, 0.85)',
      foreground: '#FFFFFF',
      primary: '#0A84FF',
      secondary: '#64D2FF',
      accent: '#FF375F',
      success: '#30D158',
      warning: '#FF9F0A',
      error: '#FF453A'
    },
    glass: {
      blur: 20,
      opacity: 0.85,
      saturate: 180
    }
  },
  {
    id: 'dark-purple',
    name: '星云紫',
    icon: '🌌',
    mode: 'dark',
    colors: {
      background: 'rgba(40, 30, 50, 0.85)',
      foreground: '#FFFFFF',
      primary: '#BF5AF2',
      secondary: '#DA8FFF',
      accent: '#FF6482',
      success: '#32D74B',
      warning: '#FF9F0A',
      error: '#FF453A'
    },
    glass: {
      blur: 20,
      opacity: 0.85,
      saturate: 180
    }
  },
  {
    id: 'dark-forest',
    name: '森林绿',
    icon: '🌲',
    mode: 'dark',
    colors: {
      background: 'rgba(20, 40, 30, 0.85)',
      foreground: '#FFFFFF',
      primary: '#30D158',
      secondary: '#63E686',
      accent: '#FF2D55',
      success: '#32D74B',
      warning: '#FF9F0A',
      error: '#FF453A'
    },
    glass: {
      blur: 20,
      opacity: 0.85,
      saturate: 180
    }
  },
  {
    id: 'dark-sunset',
    name: '日落红',
    icon: '🌅',
    mode: 'dark',
    colors: {
      background: 'rgba(50, 30, 30, 0.85)',
      foreground: '#FFFFFF',
      primary: '#FF453A',
      secondary: '#FF6482',
      accent: '#0A84FF',
      success: '#30D158',
      warning: '#FF9F0A',
      error: '#FF6482'
    },
    glass: {
      blur: 20,
      opacity: 0.85,
      saturate: 180
    }
  },
  {
    id: 'dark-midnight',
    name: '午夜黑',
    icon: '🌑',
    mode: 'dark',
    colors: {
      background: 'rgba(20, 20, 25, 0.9)',
      foreground: '#FFFFFF',
      primary: '#0A84FF',
      secondary: '#64D2FF',
      accent: '#FF375F',
      success: '#30D158',
      warning: '#FF9F0A',
      error: '#FF453A'
    },
    glass: {
      blur: 20,
      opacity: 0.9,
      saturate: 180
    }
  },
  {
    id: 'dark-slate',
    name: '岩板灰',
    icon: '🗿',
    mode: 'dark',
    colors: {
      background: 'rgba(35, 35, 40, 0.85)',
      foreground: '#FFFFFF',
      primary: '#0A84FF',
      secondary: '#64D2FF',
      accent: '#FF375F',
      success: '#30D158',
      warning: '#FF9F0A',
      error: '#FF453A'
    },
    glass: {
      blur: 20,
      opacity: 0.85,
      saturate: 180
    }
  },

  // ==================== 特殊主题 ====================
  {
    id: 'cyberpunk',
    name: '赛博朋克',
    icon: '🤖',
    mode: 'dark',
    colors: {
      background: 'rgba(10, 10, 20, 0.9)',
      foreground: '#00FF41',
      primary: '#FF00FF',
      secondary: '#00FFFF',
      accent: '#FFFF00',
      success: '#00FF41',
      warning: '#FFFF00',
      error: '#FF0055'
    },
    glass: {
      blur: 20,
      opacity: 0.9,
      saturate: 200
    }
  },
  {
    id: 'sunset-gradient',
    name: '日落渐变',
    icon: '🌇',
    mode: 'light',
    colors: {
      background: 'linear-gradient(135deg, rgba(255, 200, 150, 0.75) 0%, rgba(255, 150, 100, 0.75) 100%)',
      foreground: '#2D1A0A',
      primary: '#FF6B35',
      secondary: '#F7931E',
      accent: '#FF375F',
      success: '#30D158',
      warning: '#FF9F0A',
      error: '#FF453A'
    },
    glass: {
      blur: 20,
      opacity: 0.75,
      saturate: 180
    }
  },
  {
    id: 'northern-lights',
    name: '极光幻彩',
    icon: '✨',
    mode: 'dark',
    colors: {
      background: 'linear-gradient(135deg, rgba(50, 20, 60, 0.85) 0%, rgba(20, 50, 60, 0.85) 100%)',
      foreground: '#FFFFFF',
      primary: '#BF5AF2',
      secondary: '#64D2FF',
      accent: '#30D158',
      success: '#32D74B',
      warning: '#FF9F0A',
      error: '#FF453A'
    },
    glass: {
      blur: 25,
      opacity: 0.85,
      saturate: 200
    }
  },
  {
    id: 'rose-gold',
    name: '玫瑰金',
    icon: '🌹',
    mode: 'light',
    colors: {
      background: 'rgba(255, 245, 240, 0.8)',
      foreground: '#1A0505',
      primary: '#B76E79',
      secondary: '#E8B4B8',
      accent: '#D4A574',
      success: '#7CBC9C',
      warning: '#D4A574',
      error: '#C75B5B'
    },
    glass: {
      blur: 20,
      opacity: 0.8,
      saturate: 160
    }
  },
  {
    id: 'ocean-depth',
    name: '海洋深邃',
    icon: '🌊',
    mode: 'dark',
    colors: {
      background: 'rgba(10, 25, 45, 0.9)',
      foreground: '#E0F7FA',
      primary: '#00BCD4',
      secondary: '#26C6DA',
      accent: '#FF6B6B',
      success: '#4DB6AC',
      warning: '#FFA726',
      error: '#EF5350'
    },
    glass: {
      blur: 25,
      opacity: 0.9,
      saturate: 180
    }
  }
];

/**
 * 应用主题到 CSS 变量
 */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;

  // 设置颜色变量
  root.style.setProperty('--background', theme.colors.background);
  root.style.setProperty('--text-primary', theme.colors.foreground);
  root.style.setProperty('--primary-color', theme.colors.primary);
  root.style.setProperty('--secondary-color', theme.colors.secondary);
  root.style.setProperty('--accent-color', theme.colors.accent);
  root.style.setProperty('--success-color', theme.colors.success);
  root.style.setProperty('--warning-color', theme.colors.warning);
  root.style.setProperty('--error-color', theme.colors.error);

  // 设置毛玻璃效果
  if (theme.mode === 'dark') {
    root.style.setProperty('--text-secondary', 'rgba(255, 255, 255, 0.6)');
    root.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.1)');
    root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.3)');
  } else {
    root.style.setProperty('--text-secondary', 'rgba(0, 0, 0, 0.6)');
    root.style.setProperty('--border-color', 'rgba(0, 0, 0, 0.1)');
    root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.1)');
  }

  // 如果是渐变背景，特殊处理
  if (theme.colors.background.includes('gradient')) {
    root.style.setProperty('--background', theme.colors.background);
  }

  // 注意：不在这里设置面板透明度，因为 --panel-opacity 变量可能还未设置
  // 面板透明度将在 App.tsx 中单独设置
}

/**
 * 更新面板透明度
 * @param opacity 0-1 之间的值
 */
export function updatePanelOpacity(opacity: string): void {
  const root = document.documentElement;

  // 解析当前主题的背景色
  const background = getComputedStyle(root).getPropertyValue('--background').trim();

  if (!background) {
    console.warn('--background CSS variable not found');
    return;
  }

  // 如果背景色是 rgba/rgb 格式，提取 rgb 部分并应用新的透明度
  const rgbaMatch = background.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbaMatch) {
    const [, r, g, b] = rgbaMatch;
    const newBackground = `rgba(${r}, ${g}, ${b}, ${opacity})`;

    // 设置 CSS 变量
    root.style.setProperty('--panel-background', newBackground);
    console.log(`Panel opacity updated: ${opacity} -> ${newBackground}`);

    // 直接查找并更新主面板元素的背景色（确保立即生效）
    const mainWindow = document.querySelector('.main-window');
    if (mainWindow) {
      (mainWindow as HTMLElement).style.background = newBackground;
      console.log('Main window background updated directly');
    }
  } else {
    // 如果不是 rgba 格式，使用原背景色
    root.style.setProperty('--panel-background', background);
    console.warn(`Background format not supported: ${background}`);
  }
}

/**
 * 获取默认主题
 */
export function getDefaultTheme(): Theme {
  return themes[0]; // 天空蓝
}

/**
 * 根据ID获取主题
 */
export function getThemeById(id: string): Theme | undefined {
  return themes.find(t => t.id === id);
}

/**
 * 获取浅色主题
 */
export function getLightThemes(): Theme[] {
  return themes.filter(t => t.mode === 'light');
}

/**
 * 获取深色主题
 */
export function getDarkThemes(): Theme[] {
  return themes.filter(t => t.mode === 'dark');
}
