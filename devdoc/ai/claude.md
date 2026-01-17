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

## AI 开发规范

本规范为 AI 辅助开发提供明确的指导原则和最佳实践，确保代码质量和开发效率。

### 测试驱动开发（TDD）规范

#### 核心原则

```
开发新功能 = 编写测试 + 实现功能 + 测试通过
```

#### 测试要求

- ✅ **必须为每个新组件编写测试**
- ✅ **测试覆盖率不低于 80%**
- ✅ **关键业务逻辑覆盖率 100%**
- ✅ **所有测试必须通过才能提交代码**

#### 测试文件组织

```
src/renderer/components/ComponentName/
  ├── ComponentName.tsx
  ├── ComponentName.css
  └── __tests__/
      └── ComponentName.test.tsx
```

#### 测试类型

1. **单元测试**：测试单个组件、函数、类
2. **集成测试**：测试多个组件协作
3. **E2E 测试**：测试完整的用户流程

---

### 测试编写规范

#### React 组件测试模板

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ComponentName from '../ComponentName';

describe('ComponentName', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<ComponentName />);
      expect(screen.getByTestId('component-name')).toBeInTheDocument();
    });

    it('displays correct props', () => {
      render(<ComponentName title="Test Title" />);
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('renders loading state correctly', () => {
      render(<ComponentName loading />);
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('handles click events', async () => {
      const handleClick = vi.fn();
      render(<ComponentName onClick={handleClick} />);

      fireEvent.click(screen.getByTestId('action-button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('handles input changes', async () => {
      render(<ComponentName />);

      const input = screen.getByLabelText('Input');
      fireEvent.change(input, { target: { value: 'test value' } });

      await waitFor(() => {
        expect(input).toHaveValue('test value');
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles empty data gracefully', () => {
      render(<ComponentName data={[]} />);
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('handles error state correctly', () => {
      render(<ComponentName error="Failed to load" />);
      expect(screen.getByText('Failed to load')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<ComponentName />);
      expect(screen.getByRole('button')).toHaveAttribute('aria-label');
    });

    it('supports keyboard navigation', () => {
      render(<ComponentName />);
      const button = screen.getByRole('button');
      expect(button).toHaveFocus();
    });
  });
});
```

#### 测试运行命令

```bash
# 开发时：监听模式（自动重新运行）
npm test -- --watch

# 运行特定测试文件
npm test -- ComponentName

# 提交前：完整测试
npm test

# 查看覆盖率报告
npm run test:coverage

# 测试 UI 界面（可视化）
npm run test:ui
```

#### 测试覆盖率目标

- **总体覆盖率**：≥ 80%
- **核心业务逻辑**：100%
- **组件渲染**：≥ 90%
- **边界情况**：≥ 70%

---

### 日志使用规范

#### 日志级别使用原则

| 级别 | 用途 | 示例场景 |
|------|------|----------|
| **DEBUG** | 开发调试信息 | 函数调用、变量值、中间状态 |
| **INFO** | 重要业务流程 | 用户操作、状态变更、数据持久化 |
| **WARN** | 警告信息 | 非预期数据、降级操作、性能问题 |
| **ERROR** | 错误信息 | 异常、失败操作、系统错误 |

#### 日志使用模板

```typescript
import { createLogger } from '@shared/logger';

const logger = createLogger('ModuleName');

// 1. 函数入口（DEBUG 级别）
function processData(data: any) {
  logger.debug('processData called', { dataType: typeof data, size: data?.length });

  // ...
}

// 2. 重要操作（INFO 级别）
async function saveUserData(userId: string, data: any) {
  try {
    await database.save(userId, data);
    logger.info('User data saved successfully', { userId, dataSize: JSON.stringify(data).length });
  } catch (error) {
    logger.error('Failed to save user data', { userId, error: error.message });
    throw error;
  }
}

// 3. 警告信息（WARN 级别）
function validateEmail(email: string) {
  if (!email.includes('@')) {
    logger.warn('Invalid email format', { email, expectedFormat: 'user@domain.com' });
    return false;
  }
  return true;
}

// 4. 错误处理（ERROR 级别）
try {
  riskyOperation();
} catch (error) {
  logger.error('Operation failed', {
    operation: 'riskyOperation',
    error: error.message,
    stack: error.stack,
    context: { additionalInfo }
  });
}
```

#### 条件日志（调试模式）

```typescript
// 方式 1：基于环境变量
if (process.env.NODE_ENV === 'development') {
  logger.debug('Detailed state in development', { complexState });
}

// 方式 2：基于应用设置
import { storageService } from './services/StorageService';

const settings = storageService.getAppSettings();
if (settings.debugMode) {
  logger.debug('Debug info enabled', { data });
  logger.setMinLevel(LogLevel.DEBUG); // 动态调整日志级别
}

// 方式 3：基于 URL 参数
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('debug') === 'true') {
  logger.setMinLevel(LogLevel.DEBUG);
}
```

#### 日志最佳实践

```typescript
// ✅ 好的做法
logger.debug('Processing request', { userId, action, params });
logger.info('User logged in', { userId, timestamp });
logger.warn('Rate limit approaching', { currentRequests, limit });
logger.error('Database connection failed', { error, retryCount });

// ❌ 避免的做法
console.log('Debug info');  // 不要使用 console.log
console.error('Error');     // 使用 logger 替代
logger.info('Data:', data); // 数据应该作为第二个参数
```

---

### 开发流程规范

#### 标准 TDD 开发流程

```
1. 理解需求
   ↓
2. 编写测试用例（预期失败 - Red）
   ↓
3. 实现最小功能代码（测试通过 - Green）
   ↓
4. 重构优化（保持测试通过 - Refactor）
   ↓
5. 添加适当的日志
   ↓
6. 运行完整测试套件
   ↓
7. 代码审查/自检
   ↓
8. 提交代码
```

#### 开发检查清单

**开始开发前**：
- [ ] 明确需求和边界情况
- [ ] 确定需要修改的文件
- [ ] 检查是否有相关测试需要更新
- [ ] 准备测试数据和环境

**开发过程中**：
- [ ] 先编写测试用例（TDD）
- [ ] 实现功能代码
- [ ] 添加适当的日志（关键点）
- [ ] 运行测试确保通过
- [ ] 检查 TypeScript 类型

**提交代码前**：
- [ ] 所有测试通过（`npm test`）
- [ ] 覆盖率达标（`npm run test:coverage`）
- [ ] 类型检查通过（`npm run type-check`）
- [ ] 代码规范检查（`npm run lint`）
- [ ] 无 console.log，使用 logger
- [ ] 更新相关文档

---

### AI 交互最佳实践

#### 提示词优化

```typescript
// ❌ 差的提示词
"帮我写个组件"

// ✅ 好的提示词
"创建一个名为 UserProfile 的 React 组件，包含以下功能：
1. 显示用户头像（圆形，60x60px）、昵称、邮箱
2. 点击头像触发更换头像回调
3. 表单验证邮箱格式（xxx@xxx.xxx）
4. 加载状态显示 spinner
5. 错误状态显示错误信息

Props 接口：
interface UserProfileProps {
  userId: string;
  onAvatarChange: (file: File) => void;
}

要求：
- 使用 TypeScript
- 遵循项目代码风格
- 包含完整的测试（覆盖率 > 80%）
- 使用 createLogger 添加日志
- 使用 CSS Modules"
```

#### 分步实现策略

```typescript
// 第 1 步：让 AI 编写测试
"请为 UserProfile 组件编写完整的测试用例，包括：
- 渲染测试（props、loading、error）
- 交互测试（点击、输入）
- 边界情况测试（空数据、错误处理）
- 可访问性测试（ARIA、键盘导航）
- 测试覆盖率目标：> 80%"

// 第 2 步：让 AI 实现功能
"基于上面编写的测试，实现 UserProfile 组件：
- 遵循 TDD 原则
- 使所有测试通过
- 添加适当的日志（DEBUG/INFO/ERROR）
- 使用 TypeScript 严格类型"

// 第 3 步：运行测试验证
npm test -- UserProfile

// 第 4 步：根据测试结果调整
// 如果测试失败，让 AI 修复问题
```

#### 代码审查提示词

```typescript
"请审查以下代码，检查：
1. 是否符合项目测试规范（覆盖率、测试类型）
2. 是否正确使用日志（级别、时机、内容）
3. 是否有潜在的 bug 或边界情况
4. 是否需要性能优化
5. 是否遵循 TypeScript 最佳实践
6. 代码可读性和可维护性

代码文件：src/components/UserProfile/UserProfile.tsx

请提供具体的改进建议。"
```

#### 高效交互技巧

**1. 提供上下文**：
```typescript
"基于现有的 StorageService（src/renderer/services/StorageService.ts），
创建一个新的 CacheService 类，具有类似的缓存机制..."
```

**2. 引用示例**：
```typescript
"参考 Loading 组件（src/renderer/components/Loading/Loading.tsx）
的实现方式，创建一个类似的 ProgressBar 组件..."
```

**3. 明确约束**：
```typescript
"创建一个倒计时组件，要求：
- 必须使用 React hooks（useState, useEffect, useCallback）
- 不能使用外部库（纯 React 实现）
- 测试覆盖率必须达到 90%
- 必须包含组件测试和 Hook 测试"
```

**4. 分阶段执行**：
```typescript
"第 1 阶段：先实现基础的倒计时功能（只显示剩余时间）
第 2 阶段：添加暂停/继续/重置控制
第 3 阶段：添加完成回调
第 4 阶段：添加样式和动画

每个阶段完成后运行测试验证。"
```

---

### 调试技巧

#### 调试模式配置

```typescript
// 1. 在设置中添加调试模式开关
interface AppSettings {
  debugMode: boolean;
  logLevel: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  // ...
}

// 2. 应用启动时初始化日志级别
import { createLogger, LogLevel } from '@shared/logger';

const logger = createLogger('App');

function initializeLogger(settings: AppSettings) {
  if (settings.debugMode) {
    logger.setMinLevel(LogLevel.DEBUG);
  } else {
    switch (settings.logLevel) {
      case 'DEBUG':
        logger.setMinLevel(LogLevel.DEBUG);
        break;
      case 'INFO':
        logger.setMinLevel(LogLevel.INFO);
        break;
      case 'WARN':
        logger.setMinLevel(LogLevel.WARN);
        break;
      case 'ERROR':
        logger.setMinLevel(LogLevel.ERROR);
        break;
    }
  }
}

// 3. 在开发环境中自动启用调试模式
if (process.env.NODE_ENV === 'development') {
  logger.setMinLevel(LogLevel.DEBUG);
}
```

#### 常见问题调试

**1. 组件不渲染**：
```typescript
// 添加调试日志
const MyComponent = ({ data }) => {
  logger.debug('MyComponent render', { data, hasData: !!data });

  if (!data) {
    logger.warn('MyComponent: no data provided');
    return <div>No data</div>;
  }

  return <div>{data.title}</div>;
};
```

**2. 事件不触发**：
```typescript
const handleClick = (event) => {
  logger.debug('Button clicked', { eventType: event.type, target: event.target });
  // ...
};

<Button onClick={handleClick}>Click me</Button>
```

**3. 状态不更新**：
```typescript
const [state, setState] = useState(initialState);

const updateState = (newState) => {
  logger.debug('Updating state', { oldState: state, newState });
  setState(newState);
};

// 使用 useEffect 监控状态变化
useEffect(() => {
  logger.info('State changed', { state });
}, [state]);
```

**4. 异步操作失败**：
```typescript
const fetchData = async () => {
  logger.debug('Fetching data started');

  try {
    const result = await api.fetch();
    logger.info('Data fetched successfully', { resultSize: result.length });
    return result;
  } catch (error) {
    logger.error('Failed to fetch data', {
      error: error.message,
      stack: error.stack,
      url: api.url
    });
    throw error;
  }
};
```

#### 性能调试

```typescript
// 1. 检测不必要的重渲染
import { useEffect, useRef } from 'react';

const MyComponent = ({ prop1, prop2 }) => {
  const renderCount = useRef(0);
  renderCount.current += 1;

  useEffect(() => {
    if (renderCount.current > 10) {
      logger.warn('Component re-rendered many times', {
        count: renderCount.current,
        prop1,
        prop2
      });
    }
  });

  return <div>...</div>;
};

// 2. 检测慢操作
const slowOperation = async () => {
  const startTime = Date.now();

  // 执行操作
  await doSomething();

  const duration = Date.now() - startTime;
  if (duration > 1000) {
    logger.warn('Slow operation detected', { duration, operation: 'doSomething' });
  } else {
    logger.debug('Operation completed', { duration, operation: 'doSomething' });
  }
};
```

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
├── doc/                         # 用户文档（面向用户）
│   ├── README.md                # 项目主文档
│   ├── PLUGIN_DEVELOPMENT.md    # 插件开发指南
│   ├── BUILD.md                 # 构建和打包文档
│   └── UX_GUIDE.md              # UI/UX 设计指南
├── devdoc/                      # 开发文档（面向开发者）
│   ├── ai/                      # AI 辅助开发配置
│   │   └── claude.md            # Claude Code 配置和规范
│   ├── plans/                   # 开发计划和任务规划
│   │   ├── task_plan.md         # 总体任务计划
│   │   ├── plugin_task_plan.md  # 插件任务计划
│   │   └── *_PLAN.md            # 其他计划文档
│   ├── summaries/               # 开发总结和测试报告
│   │   ├── *_SUMMARY.md         # 各种总结文档
│   │   └── *_REPORT.md          # 各种测试报告
│   └── progress/                # 项目进度跟踪
│       ├── progress.md          # 项目进度
│       ├── todo.md              # 待办事项
│       └── *_STATUS.md          # 各种状态文档
├── build/                       # 打包资源
├── dist/                        # 构建输出
├── dist-web/                    # Web 应用输出
├── release/                     # Electron 打包输出
├── package.json
├── tsconfig.json
├── vite.config.ts
└── electron-builder.yml
```

### 文档组织规范

**重要**：项目采用分离的文档组织结构，请严格遵守以下规范：

#### 用户文档 (`doc/`)

面向用户和外部开发者的文档：
- **README.md** - 项目介绍、快速开始、特性说明
- **PLUGIN_DEVELOPMENT.md** - 插件开发指南
- **BUILD.md** - 构建和打包说明
- **UX_GUIDE.md** - UI/UX 设计指南

#### 开发文档 (`devdoc/`)

面向项目团队的开发文档：

1. **AI 配置 (`devdoc/ai/`)**
   - `claude.md` - AI 辅助开发配置和开发规范（本文件）

2. **开发计划 (`devdoc/plans/`)**
   - 任务计划、架构设计、功能规划
   - 测试计划、优化计划等

3. **开发总结 (`devdoc/summaries/`)**
   - 开发总结、测试报告、优化报告
   - 性能测试、浏览器测试等
   - 按日期或主题分类的总结文档

4. **进度跟踪 (`devdoc/progress/`)**
   - 当前进度、待办事项、状态更新
   - 发现和问题记录

#### 根目录符号链接

- 根目录的 `README.md` 是指向 `doc/README.md` 的符号链接
- 保持 GitHub/平台默认文档位置不变

#### 文档创建指南

创建新文档时，请按以下规则放置：

| 文档类型 | 放置位置 | 命名规范 |
|---------|---------|---------|
| 用户指南 | `doc/` | `GUIDE.md` |
| 插件文档 | `doc/` | `PLUGIN_*.md` |
| AI 规范 | `devdoc/ai/` | `claude.md` |
| 开发计划 | `devdoc/plans/` | `*_PLAN.md`, `*_DESIGN.md` |
| 测试报告 | `devdoc/summaries/` | `*_REPORT.md`, `*_SUMMARY.md` |
| 进度更新 | `devdoc/progress/` | `progress.md`, `todo.md`, `*_STATUS.md` |

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

### 依赖和环境

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

### 开发规范

4. **测试要求**
   - 每个新组件必须有对应的测试文件
   - 测试覆盖率不低于 80%
   - 核心业务逻辑覆盖率必须 100%
   - 提交代码前必须运行 `npm test` 确保所有测试通过

5. **日志规范**
   - 使用 `createLogger` 创建日志器，不使用 `console.log`
   - DEBUG 级别：开发调试信息（函数入口、变量值）
   - INFO 级别：重要业务流程（用户操作、状态变更）
   - WARN 级别：警告信息（非预期数据、性能问题）
   - ERROR 级别：错误信息（异常、失败操作）
   - 根据调试模式动态调整日志级别

6. **代码质量**
   - 遵循 TypeScript 严格类型检查
   - 提交前运行 `npm run type-check` 和 `npm run lint`
   - 使用有意义的变量和函数命名
   - 保持函数简洁（单一职责原则）

7. **性能优化**
   - 使用 `useMemo` 和 `useCallback` 优化性能
   - 避免不必要的重渲染
   - 使用懒加载（`React.lazy`）优化启动时间
   - 事件监听使用节流/防抖

### AI 辅助开发

8. **使用 AI 开发新功能**
   - 遵循 TDD 流程：先编写测试，再实现功能
   - 在提示词中明确指定测试覆盖率要求（> 80%）
   - 要求 AI 添加适当的日志（DEBUG/INFO/WARN/ERROR）
   - 让 AI 先提供代码审查建议，再实现功能

9. **AI 交互技巧**
   - 提供明确的上下文和约束条件
   - 分阶段执行复杂任务
   - 引用现有代码示例作为参考
   - 运行测试验证 AI 生成的代码

10. **调试和问题排查**
    - 使用开发者工具查看日志和错误
    - 在设置中启用调试模式查看详细日志
    - 使用 `npm run test:ui` 可视化调试测试
    - 检查覆盖率报告找出未测试的代码

---

## 文档

- README.md - 完整的项目说明
- PLUGIN_DEVELOPMENT.md - 详细的插件开发指南
- BUILD.md - 构建和打包指南（待创建）

---

## 开发检查清单

### 开始开发前

**需求理解**：
- [ ] 明确功能需求和边界情况
- [ ] 确定用户交互流程
- [ ] 识别可能的错误场景

**技术准备**：
- [ ] 确定需要修改的文件
- [ ] 检查是否有相关测试需要更新
- [ ] 准备测试数据和环境

**依赖检查**：
- [ ] 确认所需依赖已安装
- [ ] 检查是否需要新的依赖包
- [ ] 验证 API 兼容性

### 开发过程中

**TDD 流程**：
- [ ] 先编写测试用例（预期失败）
- [ ] 实现最小功能代码
- [ ] 运行测试验证通过
- [ ] 重构优化代码
- [ ] 再次运行测试确保仍然通过

**日志记录**：
- [ ] 在函数入口添加 DEBUG 日志
- [ ] 在关键操作添加 INFO 日志
- [ ] 在异常处理添加 ERROR 日志
- [ ] 在边界情况添加 WARN 日志
- [ ] 避免使用 console.log

**代码质量**：
- [ ] 遵循 TypeScript 严格类型
- [ ] 使用有意义的变量和函数名
- [ ] 添加必要的注释
- [ ] 保持函数简洁（单一职责）
- [ ] 检查 TypeScript 类型错误

### 提交代码前

**测试验证**：
- [ ] 所有测试通过（`npm test`）
- [ ] 覆盖率达标（≥ 80%）（`npm run test:coverage`）
- [ ] 核心业务逻辑 100% 覆盖
- [ ] 边界情况有对应测试

**代码检查**：
- [ ] TypeScript 类型检查通过（`npm run type-check`）
- [ ] ESLint 代码规范检查通过（`npm run lint`）
- [ ] 无 console.log，全部使用 logger
- [ ] 无 debugger 语句
- [ ] 无 TODO 或 FIXME 注释

**功能验证**：
- [ ] 手动测试主要功能
- [ ] 检查错误处理
- [ ] 验证边界情况
- [ ] 测试不同主题（浅色/深色）

**文档更新**：
- [ ] 更新相关文档
- [ ] 更新 CHANGELOG（如有重大变更）
- [ ] 添加或更新 API 文档

### 快速参考

**测试命令**：
```bash
npm test              # 运行所有测试
npm test -- --watch   # 监听模式
npm run test:coverage # 查看覆盖率
npm run test:ui       # 测试 UI 界面
```

**代码检查命令**：
```bash
npm run type-check    # TypeScript 类型检查
npm run lint          # ESLint 检查
```

**日志级别选择**：
- DEBUG：开发调试、变量追踪
- INFO：重要业务流程、用户操作
- WARN：非预期情况、性能问题
- ERROR：异常、错误、失败操作

---

## 许可证

MIT License

---

**使用此提示词，Claude 将能够完全复制此项目。**
