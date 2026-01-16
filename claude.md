# Desktop Tool - Claude 提示词

> 将此提示词复制给 Claude，即可生成完整项目

---

## 项目概述

创建一个类似 **uTools** 的跨平台桌面工具平台，基于 Electron + React + TypeScript 构建，具有以下特点：

- Mac 风格毛玻璃 UI 效果
- 可扩展的插件系统
- 内置 15+ 实用工具
- 悬浮时钟（久坐提醒、统计功能）
- 键盘鼠标使用统计
- 数据备份和恢复

---

## 核心功能

### 1. 插件系统
- 基于 manifest.json 的插件管理
- 支持插件启用/禁用
- 插件搜索和过滤
- 15 个内置插件

### 2. 内置工具
- JSON 工具（格式化、压缩、转义、Excel 互转）
- Base64 编码/解码
- 颜色选择器
- 时间戳转换器
- UUID 生成器
- 二维码生成器
- 单位转换器
- Markdown 编辑器
- 正则表达式测试器
- 加密解密工具
- IP 地址查询
- 汇率转换器
- 图片压缩工具
- 代码格式化工具
- 悬浮时钟（独立窗口）

### 3. 统计功能
- 键盘按键次数统计
- 鼠标点击次数统计
- 鼠标移动距离统计
- 数据可视化图表
- CSV 数据导出

### 4. 主题系统
- 8 种预设主题（4 浅色 + 4 深色）
- 动态主题切换
- CSS 变量支持

---

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Electron | 28.3.3 | 跨平台桌面框架 |
| React | 18.2.0 | UI 框架 |
| TypeScript | 5.3.0 | 类型系统 |
| Vite | 5.0.0 | 构建工具 |
| Better SQLite3 | 9.2.0 | 数据库 |
| Ant Design | 5.12.0 | UI 组件库 |
| Tailwind CSS | 3.4.0 | 样式框架 |
| Zustand | 4.4.0 | 状态管理 |
| Chart.js | 4.5.1 | 图表库 |

---

## 项目结构

```
desktop-tool/
├── src/
│   ├── main/                    # Electron 主进程
│   │   ├── index.ts             # 主进程入口
│   │   ├── ipc/
│   │   │   └── handlers.ts      # IPC 通信处理器
│   │   ├── windows/
│   │   │   └── manager.ts       # 窗口管理器
│   │   ├── database/
│   │   │   └── index.ts         # SQLite 数据库服务
│   │   ├── plugins/
│   │   │   └── manager.ts       # 插件管理器
│   │   └── services/
│   │       └── InputMonitor.ts  # 输入监控服务
│   ├── preload/
│   │   └── index.ts             # 预加载脚本
│   ├── renderer/                # React 渲染进程
│   │   ├── main.tsx             # React 入口
│   │   ├── App.tsx              # 主应用组件
│   │   ├── components/          # React 组件
│   │   │   ├── SearchBox.tsx
│   │   │   ├── PluginList.tsx
│   │   │   ├── WindowControls.tsx
│   │   │   ├── SettingsPanel.tsx
│   │   │   ├── PluginManager.tsx
│   │   │   ├── StatsReport.tsx
│   │   │   ├── BackupPanel.tsx
│   │   │   └── FloatingClock.tsx
│   │   │   # ... 其他插件组件
│   │   ├── services/
│   │   │   ├── StorageService.ts    # 存储服务（带缓存）
│   │   │   └── InputEventTracker.ts # 输入事件跟踪
│   │   └── themes/
│   │       └── themes.ts        # 主题配置
│   └── shared/                  # 共享代码
│       └── types/
│           ├── config.ts
│           └── plugin.ts
├── plugins/                     # 插件清单
│   ├── json-tool/manifest.json
│   ├── base64-tool/manifest.json
│   └── ... # 其他插件清单
├── build/                       # 打包资源
├── dist/                        # 构建输出
├── dist-web/                    # Web 应用输出
├── release/                     # Electron 打包输出
├── package.json
├── tsconfig.json
├── vite.config.ts
└── electron-builder.yml
```

---

## 关键实现要点

### 1. 主进程 (src/main/index.ts)

```typescript
import { app, BrowserWindow } from 'electron';
import { setupIPCHandlers } from './ipc/handlers';
import { DatabaseService } from './database';
import { PluginManager } from './plugins/manager';
import { WindowManager } from './windows/manager';
import { InputMonitor } from './services/InputMonitor';

export default class MainProcess {
  private database: DatabaseService;
  private pluginManager: PluginManager;
  private windowManager: WindowManager;
  private inputMonitor: InputMonitor;
  private mainWindow: BrowserWindow | null = null;

  constructor() {
    this.database = new DatabaseService();
    this.pluginManager = new PluginManager();
    this.windowManager = new WindowManager();
    this.inputMonitor = new InputMonitor(this.database);
  }

  async initialize() {
    // 初始化数据库
    await this.database.initialize();

    // 加载插件
    await this.pluginManager.loadAllPlugins();

    // 创建主窗口
    this.mainWindow = await this.windowManager.createMainWindow();

    // 设置 IPC 处理器
    setupIPCHandlers(this);

    // 启动输入监听器
    this.inputMonitor.start();

    // 设置统计数据更新回调
    this.inputMonitor.onStatsUpdate((stats) => {
      BrowserWindow.getAllWindows().forEach(window => {
        if (!window.isDestroyed()) {
          window.webContents.send('input-stats:update', stats);
        }
      });
    });
  }

  // ... getter 方法
}

// 初始化
app.whenReady().then(async () => {
  try {
    const mainProcess = new MainProcess();
    await mainProcess.initialize();
  } catch (error) {
    console.error('Failed to initialize application:', error);
    app.quit();
  }
});
```

### 2. 数据库服务 (src/main/database/index.ts)

使用 Better SQLite3，包含以下表：

```sql
-- 时钟配置表
CREATE TABLE clock_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  theme TEXT DEFAULT 'light',
  color TEXT DEFAULT '#000000',
  font_family TEXT DEFAULT 'system-ui',
  font_size INTEGER DEFAULT 14,
  opacity REAL DEFAULT 1.0,
  position_x INTEGER DEFAULT 100,
  position_y INTEGER DEFAULT 100,
  work_duration INTEGER DEFAULT 3600000,
  break_duration INTEGER DEFAULT 300000,
  enable_reminder INTEGER DEFAULT 1
);

-- 键盘统计表
CREATE TABLE keyboard_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  count INTEGER NOT NULL,
  timestamp DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 鼠标点击统计表
CREATE TABLE mouse_click_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  button TEXT NOT NULL,
  count INTEGER NOT NULL,
  timestamp DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 鼠标移动统计表
CREATE TABLE mouse_move_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  distance REAL NOT NULL,
  timestamp DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 3. 插件管理器 (src/main/plugins/manager.ts)

```typescript
export class PluginManager {
  private plugins: Map<string, IPlugin> = new Map();
  private pluginsDir: string;

  async loadAllPlugins() {
    const builtinPluginsPath = path.join(process.cwd(), 'plugins');
    // 读取所有 manifest.json 并加载插件
  }

  getPluginsList(): PluginManifest[] {
    return Array.from(this.plugins.values()).map(p => p.manifest);
  }
}
```

### 4. React 主应用 (src/renderer/App.tsx)

核心功能：
- 插件列表渲染
- 搜索过滤
- 主题切换
- 实时统计显示
- 插件模态框管理

### 5. 存储服务 (src/renderer/services/StorageService.ts)

带缓存的 localStorage 封装：

```typescript
class StorageService {
  private cache: StorageData | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 1000; // 1秒缓存

  getData(): StorageData {
    // 返回缓存数据（如果有效）
    // 否则从 localStorage 读取
  }

  saveData(data: StorageData): void {
    // 保存到 localStorage
    // 更新缓存
  }
}
```

### 6. 输入事件跟踪 (src/renderer/services/InputEventTracker.ts)

节流优化的事件监听：

```typescript
class InputEventTracker {
  private mouseMoveThrottle: number = 0;

  private handleMouseMove = (event: MouseEvent) => {
    // 计算距离
    // 节流更新（每10帧更新一次）
    this.mouseMoveThrottle++;
    if (this.mouseMoveThrottle % 10 === 0) {
      this.scheduleUpdate();
    }
  };
}
```

### 7. 主题系统 (src/renderer/themes/themes.ts)

8 种预设主题配置，使用 CSS 变量：

```typescript
export const themes: Theme[] = [
  {
    id: 'light-blue',
    name: 'Light Blue',
    mode: 'light',
    colors: {
      primary: '#1890ff',
      background: 'rgba(255, 255, 255, 0.8)',
      // ...
    }
  },
  // ... 其他主题
];
```

---

## Mac 风格 UI 实现

### 窗口配置

```typescript
const mainWindow = new BrowserWindow({
  width: 800,
  height: 600,
  frame: false,
  transparent: true,
  backgroundColor: '#00000000',
  vibrancy: 'under-window',
  visualEffectState: 'active',
  roundedCorners: true,
  titleBarStyle: 'hiddenInset'
});
```

### 样式实现

```css
.main-window {
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.3),
    0 20px 40px rgba(0, 0, 0, 0.2);
}
```

---

## 性能优化要点

1. **事件监听节流**
   - 鼠标移动：每 10 帧更新一次
   - IPC 通信：1 秒间隔

2. **存储缓存**
   - localStorage 数据缓存 1 秒
   - SQLite 使用预编译语句

3. **React 优化**
   - useMemo 缓存计算结果
   - useCallback 稳定函数引用
   - 避免不必要的重渲染

4. **内存管理**
   - 及时清理事件监听器
   - 使用 `.off()` 而非 `.removeAllListeners()`
   - useEffect cleanup 函数

---

## 调试修复记录

### 已修复的 Bug

1. **src/main/index.ts**
   - ✅ 添加 try-catch 错误处理
   - ✅ 添加 before-quit 事件处理

2. **src/renderer/App.tsx**
   - ✅ 修复 `mouseClickCount` vs `mouseClicks` 字段不匹配
   - ✅ 修复 useEffect 依赖问题（内联初始化代码）
   - ✅ 使用 `.off()` 替代 `.removeAllListeners()`

3. **src/main/database/index.ts**
   - ✅ 添加 seedTestData 错误处理
   - ✅ 添加 setTimeout 确保表创建完成

4. **src/renderer/services/InputEventTracker.ts**
   - ✅ 添加鼠标移动节流优化

5. **src/renderer/services/StorageService.ts**
   - ✅ 添加数据缓存机制（1秒缓存期）

---

## 打包配置

### electron-builder.yml

```yaml
appId: com.desktop-tool.app
productName: Desktop Tool
directories:
  output: release
  buildResources: build

win:
  target:
    - nsis
    - portable
  icon: build/icon.ico

mac:
  target:
    - dmg
    - zip
  icon: build/icon.icns
  category: public.app-category.productivity

linux:
  target:
    - AppImage
    - deb
    - rpm
  icon: build/icon.png
  category: Utility
```

---

## 构建命令

```bash
# 开发模式
npm run dev

# Web 模式
npm run dev:web

# 构建
npm run build:electron
npm run build:web

# 打包
npm run dist
npm run dist:win
npm run dist:mac
npm run dist:linux
```

---

## 环境要求

- Node.js: >= 18.0.0 < 21.0.0
- npm / yarn / pnpm
- Windows 10+ / macOS 10.15+ / Linux (Ubuntu 20.04+)

---

## 启动步骤

```bash
# 1. 克隆项目
git clone <repo-url>
cd desktop-tool

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 打包应用
npm run dist
```

---

## 注意事项

1. **better-sqlite3 编译**
   - Windows: 安装 Visual Studio Build Tools
   - macOS: `xcode-select --install`
   - Linux: `sudo apt-get install build-essential`

2. **权限问题**
   - 某些功能需要特殊权限（输入监控）
   - 首次运行可能需要用户授权

3. **Web 模式限制**
   - 无窗口控制
   - 无系统托盘
   - 无输入监控
   - 纯前端工具正常工作

---

## 文档

- README.md - 完整的项目说明
- PLUGIN_DEVELOPMENT.md - 详细的插件开发指南
- BUILD.md - 构建和打包指南（待创建）

---

## 许可证

MIT License

---

**使用此提示词，Claude 将能够完全复制此项目。**
