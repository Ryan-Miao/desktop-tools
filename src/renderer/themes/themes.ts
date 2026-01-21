/**
 * 主题配置
 * 定义应用的所有主题样式
 */

export interface Theme {
  id: string;
  name: string;
  icon: string;
  mode: "light" | "dark";
  colors: {
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    // Extended colors for better theme support
    textPrimary?: string;
    textSecondary?: string;
    textTertiary?: string;
    border?: string;
    overlay?: string;
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
    id: "light-blue",
    name: "天空蓝",
    icon: "🌤️",
    mode: "light",
    colors: {
      background: "rgb(250, 253, 255)",
      foreground: "#1a1a1a",
      primary: "#0066CC",
      secondary: "#0088FF",
      accent: "#FF2D55",
      success: "#28A745",
      warning: "#FF9500",
      error: "#DC3545",
    },
    glass: {
      blur: 0,
      opacity: 1,
      saturate: 100,
    },
  },
  {
    id: "light-purple",
    name: "薰衣草紫",
    icon: "💜",
    mode: "light",
    colors: {
      background: "rgb(252, 248, 255)",
      foreground: "#1a1a1a",
      primary: "#9B4DCA",
      secondary: "#AF52DE",
      accent: "#FF6482",
      success: "#28A745",
      warning: "#FF9500",
      error: "#DC3545",
    },
    glass: {
      blur: 0,
      opacity: 1,
      saturate: 100,
    },
  },
  {
    id: "light-pink",
    name: "樱花粉",
    icon: "🌸",
    mode: "light",
    colors: {
      background: "rgb(255, 248, 252)",
      foreground: "#1a1a1a",
      primary: "#E91E63",
      secondary: "#FF2D55",
      accent: "#0066CC",
      success: "#28A745",
      warning: "#FF9500",
      error: "#DC3545",
    },
    glass: {
      blur: 0,
      opacity: 1,
      saturate: 100,
    },
  },
  {
    id: "light-green",
    name: "薄荷绿",
    icon: "🍃",
    mode: "light",
    colors: {
      background: "rgb(248, 255, 248)",
      foreground: "#1a1a1a",
      primary: "#28A745",
      secondary: "#34C759",
      accent: "#FF2D55",
      success: "#228B22",
      warning: "#FF9500",
      error: "#DC3545",
    },
    glass: {
      blur: 0,
      opacity: 1,
      saturate: 100,
    },
  },
  {
    id: "light-orange",
    name: "暖阳橙",
    icon: "🌅",
    mode: "light",
    colors: {
      background: "rgb(255, 252, 248)",
      foreground: "#1a1a1a",
      primary: "#FF6B00",
      secondary: "#FF9500",
      accent: "#0066CC",
      success: "#28A745",
      warning: "#CC7A00",
      error: "#DC3545",
    },
    glass: {
      blur: 0,
      opacity: 1,
      saturate: 100,
    },
  },
  {
    id: "light-teal",
    name: "清新青",
    icon: "🌊",
    mode: "light",
    colors: {
      background: "rgb(248, 255, 253)",
      foreground: "#1a1a1a",
      primary: "#0097A7",
      secondary: "#00BCD4",
      accent: "#FF2D55",
      success: "#28A745",
      warning: "#FF9500",
      error: "#DC3545",
    },
    glass: {
      blur: 0,
      opacity: 1,
      saturate: 100,
    },
  },

  // ==================== 深色主题 ====================
  {
    id: "dark-ocean",
    name: "深海蓝",
    icon: "🌊",
    mode: "dark",
    colors: {
      background: "rgb(18, 28, 38)",
      foreground: "#F0F0F0",
      primary: "#4DA3FF",
      secondary: "#66B3FF",
      accent: "#FF6B9D",
      success: "#4ADE80",
      warning: "#FFB84D",
      error: "#FF6B6B",
    },
    glass: {
      blur: 0,
      opacity: 1,
      saturate: 100,
    },
  },
  {
    id: "dark-purple",
    name: "星云紫",
    icon: "🌌",
    mode: "dark",
    colors: {
      background: "rgb(25, 18, 35)",
      foreground: "#F0F0F0",
      primary: "#C77DFF",
      secondary: "#D9A0FF",
      accent: "#FF8FA3",
      success: "#4ADE80",
      warning: "#FFB84D",
      error: "#FF6B6B",
    },
    glass: {
      blur: 0,
      opacity: 1,
      saturate: 100,
    },
  },
  {
    id: "dark-forest",
    name: "森林绿",
    icon: "🌲",
    mode: "dark",
    colors: {
      background: "rgb(15, 30, 20)",
      foreground: "#F0F0F0",
      primary: "#4ADE80",
      secondary: "#7DD87C",
      accent: "#FF6B9D",
      success: "#5CB85C",
      warning: "#FFB84D",
      error: "#FF6B6B",
    },
    glass: {
      blur: 0,
      opacity: 1,
      saturate: 100,
    },
  },
  {
    id: "dark-sunset",
    name: "日落红",
    icon: "🌅",
    mode: "dark",
    colors: {
      background: "rgb(35, 18, 18)",
      foreground: "#F0F0F0",
      primary: "#FF6B6B",
      secondary: "#FF8FA3",
      accent: "#4DA3FF",
      success: "#4ADE80",
      warning: "#FFB84D",
      error: "#FF8FA3",
    },
    glass: {
      blur: 0,
      opacity: 1,
      saturate: 100,
    },
  },
  {
    id: "dark-midnight",
    name: "午夜黑",
    icon: "🌑",
    mode: "dark",
    colors: {
      background: "rgb(12, 12, 16)",
      foreground: "#F0F0F0",
      primary: "#5BA3FF",
      secondary: "#7BB8FF",
      accent: "#FF6B9D",
      success: "#4ADE80",
      warning: "#FFB84D",
      error: "#FF6B6B",
    },
    glass: {
      blur: 0,
      opacity: 1,
      saturate: 100,
    },
  },
  {
    id: "dark-slate",
    name: "岩板灰",
    icon: "🗿",
    mode: "dark",
    colors: {
      background: "rgb(22, 22, 26)",
      foreground: "#F0F0F0",
      primary: "#5BA3FF",
      secondary: "#7BB8FF",
      accent: "#FF6B9D",
      success: "#4ADE80",
      warning: "#FFB84D",
      error: "#FF6B6B",
    },
    glass: {
      blur: 0,
      opacity: 1,
      saturate: 100,
    },
  },

  // ==================== 特殊主题 ====================
  {
    id: "cyberpunk",
    name: "赛博朋克",
    icon: "🤖",
    mode: "dark",
    colors: {
      background: "rgb(8, 8, 12)",
      foreground: "#00FF88",
      primary: "#FF00FF",
      secondary: "#00FFFF",
      accent: "#FFFF00",
      success: "#00FF88",
      warning: "#FFFF00",
      error: "#FF0066",
    },
    glass: {
      blur: 0,
      opacity: 1,
      saturate: 100,
    },
  },
  {
    id: "sunset-gradient",
    name: "日落渐变",
    icon: "🌇",
    mode: "light",
    colors: {
      background:
        "linear-gradient(135deg, rgb(255, 235, 220) 0%, rgb(255, 220, 200) 100%)",
      foreground: "#2D1A0A",
      primary: "#E65100",
      secondary: "#FF6B00",
      accent: "#FF6B9D",
      success: "#28A745",
      warning: "#E65100",
      error: "#DC3545",
    },
    glass: {
      blur: 0,
      opacity: 1,
      saturate: 100,
    },
  },
  {
    id: "northern-lights",
    name: "极光幻彩",
    icon: "✨",
    mode: "dark",
    colors: {
      background:
        "linear-gradient(135deg, rgb(35, 12, 45) 0%, rgb(12, 35, 45) 100%)",
      foreground: "#F0F0F0",
      primary: "#C77DFF",
      secondary: "#4DA3FF",
      accent: "#4ADE80",
      success: "#5CB85C",
      warning: "#FFB84D",
      error: "#FF6B6B",
    },
    glass: {
      blur: 0,
      opacity: 1,
      saturate: 100,
    },
  },
  {
    id: "rose-gold",
    name: "玫瑰金",
    icon: "🌹",
    mode: "light",
    colors: {
      background: "rgb(255, 248, 245)",
      foreground: "#2D1A1A",
      primary: "#C77D83",
      secondary: "#E8A0A8",
      accent: "#C4A070",
      success: "#6BA88A",
      warning: "#C4A070",
      error: "#C75B5B",
    },
    glass: {
      blur: 0,
      opacity: 1,
      saturate: 100,
    },
  },
  {
    id: "ocean-depth",
    name: "海洋深邃",
    icon: "🌊",
    mode: "dark",
    colors: {
      background: "rgb(6, 18, 32)",
      foreground: "#E0F7FA",
      primary: "#00D4FF",
      secondary: "#33E5FF",
      accent: "#FF8FA3",
      success: "#4ADE80",
      warning: "#FFB84D",
      error: "#FF6B6B",
    },
    glass: {
      blur: 0,
      opacity: 1,
      saturate: 100,
    },
  },

  // ==================== 高对比度主题 ====================
  {
    id: "high-contrast-dark",
    name: "深邃黑",
    icon: "🌑",
    mode: "dark",
    colors: {
      background: "#000000",
      foreground: "#ffffff",
      primary: "#00d9ff",
      secondary: "#0099cc",
      accent: "#ff2d55",
      success: "#00ff88",
      warning: "#ffcc00",
      error: "#ff3366",
      textPrimary: "#ffffff",
      textSecondary: "#e0e0e0",
      textTertiary: "#b0b0b0",
      border: "#404040",
      overlay: "rgba(0, 0, 0, 0.8)",
    },
    glass: {
      blur: 0,
      opacity: 1,
      saturate: 100,
    },
  },
  {
    id: "high-contrast-light",
    name: "纯粹白",
    icon: "⚪",
    mode: "light",
    colors: {
      background: "#ffffff",
      foreground: "#000000",
      primary: "#0066cc",
      secondary: "#0052a3",
      accent: "#ff2d55",
      success: "#00aa44",
      warning: "#ff9900",
      error: "#dd2222",
      textPrimary: "#000000",
      textSecondary: "#1a1a1a",
      textTertiary: "#4a4a4a",
      border: "#cccccc",
      overlay: "rgba(0, 0, 0, 0.5)",
    },
    glass: {
      blur: 0,
      opacity: 1,
      saturate: 100,
    },
  },
  {
    id: "cyber-dark",
    name: "赛博紫",
    icon: "🌆",
    mode: "dark",
    colors: {
      background: "#0d0221",
      foreground: "#00fff9",
      primary: "#ff00ff",
      secondary: "#bd00ff",
      accent: "#00fff9",
      success: "#00ff88",
      warning: "#ffcc00",
      error: "#ff3366",
      textPrimary: "#00fff9",
      textSecondary: "#b000ff",
      textTertiary: "#7a00aa",
      border: "#ff00ff",
      overlay: "rgba(13, 2, 33, 0.9)",
    },
    glass: {
      blur: 10,
      opacity: 0.9,
      saturate: 120,
    },
  },
  {
    id: "sunset-orange",
    name: "日落橙",
    icon: "🌅",
    mode: "dark",
    colors: {
      background: "#1a0a00",
      foreground: "#ffd700",
      primary: "#ff6b00",
      secondary: "#ff8c00",
      accent: "#ffd700",
      success: "#00ff88",
      warning: "#ffcc00",
      error: "#ff4444",
      textPrimary: "#ffd700",
      textSecondary: "#ffaa00",
      textTertiary: "#cc8800",
      border: "#ff6b00",
      overlay: "rgba(26, 10, 0, 0.9)",
    },
    glass: {
      blur: 8,
      opacity: 0.85,
      saturate: 110,
    },
  },
];

/**
 * 调整颜色透明度
 * @param color 颜色值（支持 #hex, rgb, rgba）
 * @param alpha 透明度 0-1
 */
function adjustOpacity(color: string, alpha: number): string {
  if (color.startsWith("#")) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  if (color.startsWith("rgb(")) {
    return color.replace("rgb", "rgba").replace(")", `, ${alpha})`);
  }
  if (color.startsWith("rgba(")) {
    // Already rgba, just replace alpha
    return color.replace(/[\d.]+\)$/, `${alpha})`);
  }
  return color;
}

/**
 * 应用主题到 CSS 变量（带平滑过渡动画）
 */
export function applyTheme(theme: Theme, opacity?: string): void {
  // 保存当前主题引用，用于透明度更新
  currentTheme = theme;

  const root = document.documentElement;

  // 添加平滑过渡效果
  root.style.transition =
    "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease";

  // 设置颜色变量
  root.style.setProperty("--background", theme.colors.background);
  root.style.setProperty("--text-primary", theme.colors.foreground);
  root.style.setProperty("--primary-color", theme.colors.primary);
  root.style.setProperty("--secondary-color", theme.colors.secondary);
  root.style.setProperty("--accent-color", theme.colors.accent);
  root.style.setProperty("--success-color", theme.colors.success);
  root.style.setProperty("--warning-color", theme.colors.warning);
  root.style.setProperty("--error-color", theme.colors.error);

  // 文字颜色层级（使用主题定义的颜色或自动计算）
  const textPrimary = theme.colors.textPrimary || theme.colors.foreground;
  const textSecondary =
    theme.colors.textSecondary || adjustOpacity(theme.colors.foreground, 0.7);
  const textTertiary =
    theme.colors.textTertiary || adjustOpacity(theme.colors.foreground, 0.5);

  root.style.setProperty("--text-primary", textPrimary);
  root.style.setProperty("--text-secondary", textSecondary);
  root.style.setProperty("--text-tertiary", textTertiary);

  // 功能颜色（使用主题定义的颜色或自动计算）
  const borderColor =
    theme.colors.border || adjustOpacity(theme.colors.foreground, 0.1);
  const overlayBg =
    theme.colors.overlay ||
    (theme.mode === "dark" ? "rgba(0, 0, 0, 0.8)" : "rgba(0, 0, 0, 0.6)");

  root.style.setProperty("--border-color", borderColor);
  root.style.setProperty("--overlay-bg", overlayBg);

  // 按钮状态（自动计算）
  root.style.setProperty(
    "--button-bg",
    adjustOpacity(theme.colors.foreground, 0.05),
  );
  root.style.setProperty(
    "--button-hover-bg",
    adjustOpacity(theme.colors.foreground, 0.1),
  );
  root.style.setProperty(
    "--list-item-hover-bg",
    adjustOpacity(theme.colors.primary, 0.08),
  );

  // 主色调变体
  root.style.setProperty(
    "--primary-text",
    theme.mode === "dark" ? "#ffffff" : "#ffffff",
  );
  root.style.setProperty(
    "--primary-color-light",
    adjustOpacity(theme.colors.primary, 0.1),
  );
  root.style.setProperty(
    "--primary-color-dark",
    adjustOpacity(theme.colors.primary, 0.8),
  );

  // 错误颜色变体
  root.style.setProperty(
    "--error-color-light",
    adjustOpacity(theme.colors.error, 0.1),
  );

  // 工具栏背景
  root.style.setProperty(
    "--toolbar-bg",
    adjustOpacity(theme.colors.foreground, 0.03),
  );

  // 设置毛玻璃效果
  if (theme.mode === "dark") {
    root.style.setProperty("--shadow-color", "rgba(0, 0, 0, 0.3)");
  } else {
    root.style.setProperty("--shadow-color", "rgba(0, 0, 0, 0.1)");
  }

  // 设置面板背景色（使用主题自带的透明度，或者使用传入的 opacity 值）
  let panelBackground = theme.colors.background;

  // 如果背景色是 rgba/rgb 格式，应用透明度
  const rgbaMatch = theme.colors.background.match(
    /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/,
  );
  if (rgbaMatch) {
    const [, r, g, b, originalOpacity] = rgbaMatch;
    // 使用传入的 opacity，或者使用主题原有的透明度
    const finalOpacity = opacity || originalOpacity || "0.85";
    panelBackground = `rgba(${r}, ${g}, ${b}, ${finalOpacity})`;
  } else if (opacity) {
    // 对于渐变等复杂背景，尝试应用透明度
    root.style.setProperty("--panel-opacity", opacity);
  }

  root.style.setProperty("--panel-background", panelBackground);

  // 同时更新内联样式以确保立即生效（添加过渡）
  requestAnimationFrame(() => {
    // 添加过渡样式到所有需要更新的元素
    const elementsToUpdate = document.querySelectorAll(
      ".main-window, .modal-content, .plugin-window, .app-container",
    );
    elementsToUpdate.forEach((element) => {
      (element as HTMLElement).style.transition =
        "background-color 0.3s ease, box-shadow 0.3s ease";
    });

    const mainWindow = document.querySelector(".main-window");
    if (mainWindow) {
      (mainWindow as HTMLElement).style.background = panelBackground;
    }

    // 更新所有模态面板（除了 FloatingClock）
    const modals = document.querySelectorAll(
      ".modal-content:not(.floating-clock-modal)",
    );
    modals.forEach((modal) => {
      (modal as HTMLElement).style.background = panelBackground;
    });

    // FloatingClock 特殊处理：保持深色渐变，应用透明度
    const floatingClockModals = document.querySelectorAll(
      ".floating-clock-modal",
    );
    const opacityValue = opacity || "0.85";
    const gradientOpacity = (parseFloat(opacityValue) * 0.95).toFixed(2);
    const clockBackground = `linear-gradient(135deg, rgba(26, 26, 46, ${gradientOpacity}) 0%, rgba(22, 33, 62, ${gradientOpacity}) 100%)`;
    floatingClockModals.forEach((modal) => {
      (modal as HTMLElement).style.background = clockBackground;
    });

    // 300ms 后清除过渡属性（避免影响其他交互）
    setTimeout(() => {
      elementsToUpdate.forEach((element) => {
        (element as HTMLElement).style.transition = "";
      });
      root.style.transition = "";
    }, 300);
  });
}

// 当前主题引用，用于透明度更新
let currentTheme: Theme = getDefaultTheme();

/**
 * 解析 rgb/rgba 颜色字符串，提取 RGB 值
 */
function parseRGB(color: string): { r: string; g: string; b: string } | null {
  const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbaMatch) {
    const [, r, g, b] = rgbaMatch;
    return { r: r || "0", g: g || "0", b: b || "0" };
  }
  return null;
}

/**
 * 更新面板透明度
 * @param opacity 0-1 之间的值
 */
export function updatePanelOpacity(opacity: string): void {
  const root = document.documentElement;

  // 使用当前主题的背景色
  const rgb = parseRGB(currentTheme.colors.background);
  let newBackground = currentTheme.colors.background;

  if (rgb) {
    newBackground = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
  }

  // 设置 CSS 变量
  root.style.setProperty("--panel-background", newBackground);
  root.style.setProperty("--panel-opacity", opacity);

  // 立即更新所有使用面板背景的元素
  requestAnimationFrame(() => {
    // 更新主窗口
    const mainWindow = document.querySelector(".main-window");
    if (mainWindow) {
      (mainWindow as HTMLElement).style.setProperty(
        "background",
        newBackground,
        "important",
      );
    }

    // 更新所有模态面板（除了 FloatingClock，它有自己的渐变背景）
    const modals = document.querySelectorAll(
      ".modal-content:not(.floating-clock-modal)",
    );
    modals.forEach((modal) => {
      (modal as HTMLElement).style.background = newBackground;
    });

    // FloatingClock 特殊处理：保持深色渐变，只调整透明度
    const floatingClockModals = document.querySelectorAll(
      ".floating-clock-modal",
    );
    floatingClockModals.forEach((modal) => {
      // 为 FloatingClock 创建半透明的深色渐变
      const gradientOpacity = (parseFloat(opacity) * 0.95).toFixed(2);
      const clockBackground = `linear-gradient(135deg, rgba(26, 26, 46, ${gradientOpacity}) 0%, rgba(22, 33, 62, ${gradientOpacity}) 100%)`;
      (modal as HTMLElement).style.background = clockBackground;
    });

    // 更新插件窗口
    const pluginWindows = document.querySelectorAll(
      ".plugin-window, .plugin-modal",
    );
    pluginWindows.forEach((window) => {
      (window as HTMLElement).style.background = newBackground;
    });
  });
}

/**
 * 获取默认主题
 */
export function getDefaultTheme(): Theme {
  return (
    themes[0] || {
      id: "default",
      name: "Default",
      icon: "🎨",
      mode: "light",
      colors: {
        background: "#ffffff",
        foreground: "#000000",
        primary: "#007bff",
        secondary: "#6c757d",
        accent: "#ff6b6b",
        success: "#28a745",
        warning: "#ffc107",
        error: "#dc3545",
        textPrimary: "#000000",
        textSecondary: "#6c757d",
        textTertiary: "#95a5a6",
        border: "#dee2e6",
        overlay: "#ffffff",
      },
      glass: { blur: 10, opacity: 0.8, saturate: 1 },
    }
  ); // 确保返回第一个主题
}

/**
 * 根据ID获取主题
 */
export function getThemeById(id: string): Theme | undefined {
  return themes.find((t) => t.id === id);
}

/**
 * 获取浅色主题
 */
export function getLightThemes(): Theme[] {
  return themes.filter((t) => t.mode === "light");
}

/**
 * 获取深色主题
 */
export function getDarkThemes(): Theme[] {
  return themes.filter((t) => t.mode === "dark");
}
