# Desktop Tool - Claude 提示词

> 将此提示词复制给 Claude，即可生成完整项目

---

## 项目定位

### 核心理念
Desktop Tool 是一个**可扩展的桌面工具框架**，重点在于：
- 🏗️ **完整的插件架构** - 支持独立窗口、状态管理
- 🎨 **强大的主题系统** - 18+ 主题，CSS 变量驱动
- 🔧 **开发者友好的 API** - 插件开发简单快捷
- 📝 **完善的基础设施** - EventBus、Logger、IPC

### 当前状态
- ✅ **架构完成**：插件系统、主题系统、事件总线、日志系统
- ⚙️ **示例插件**：1 个计算器插件（演示插件开发流程）
- 🚧 **功能开发中**：更多插件待开发

### 设计目标
- 不是"开箱即用"的工具集
- 而是"快速开发工具"的框架
- 类似于：Electron 版的 VS Code 插件系统

---

## 已实现的核心架构

### 1. 插件系统
- ✅ 独立窗口支持（BrowserWindow）
- ✅ 自定义标题栏（PluginWindow 组件）
- ✅ 窗口控制（最小化、最大化、关闭）
- ✅ 拖拽移动（Drag API）
- ✅ 状态持久化（位置、大小、最大化状态）
- ✅ ESC 快速关闭
- ✅ 主题适配（自动切换）

**代码位置**:
- 插件窗口组件：`src/renderer/components/PluginWindow/`
- 窗口管理器：`src/main/windows/manager.ts`
- 插件管理器：`src/main/plugins/manager.ts`

### 2. 主题系统
- ✅ 18+ 预设主题（6 浅色 + 11 深色 + 1 渐变）
- ✅ CSS 变量驱动（完全动态切换）
- ✅ 透明度可调（0-100%）
- ✅ 高对比度主题（4 个）
- ✅ 自定义主题支持

**代码位置**:
- 主题定义：`src/renderer/themes/themes.ts`
- 全局样式：`src/renderer/styles/global.css`

### 3. 事件总线（EventBus）
- ✅ 渲染进程组件间通信
- ✅ 避免 Props Drilling
- ✅ 自动清理监听器
- ✅ 类型安全的事件定义

**代码位置**:
- 事件总线：`src/renderer/utils/eventBus.ts`

**使用示例**:
```typescript
import { eventBus, AppEvents } from '../utils/eventBus';

// 发送事件
eventBus.emit(AppEvents.PLUGINS_CHANGED);

// 监听事件
const cleanup = eventBus.on(AppEvents.PLUGINS_CHANGED, () => {
  // 处理事件
});

// 清理监听（重要！）
cleanup();
```

### 4. 日志系统
- ✅ 跨进程日志（主进程/渲染进程/Web）
- ✅ 依赖注入模式
- ✅ 日志级别控制（DEBUG/INFO/WARN/ERROR）
- ✅ 彩色输出和格式化
- ✅ 文件持久化

**代码位置**:
- 日志核心：`src/shared/logger/index.ts`
- 主进程日志服务：`src/main/services/LogService.ts`

**使用示例**:
```typescript
import { createLogger } from '../../shared/logger';

const logger = createLogger('ModuleName');

logger.debug('Processing request', { userId, action });
logger.info('User logged in', { userId, timestamp });
logger.warn('Rate limit approaching', { currentRequests });
logger.error('Operation failed', { error, retryCount });
```

### 5. 插件管理器
- ✅ 插件列表展示
- ✅ 启用/禁用插件
- ✅ 导入/导出插件
- ✅ 内联确认 + Toast 通知
- ✅ 主题适配

**代码位置**:
- 插件管理器 UI：`src/renderer/components/PluginManager.tsx`
- 插件状态管理：`src/main/plugins/manager.ts`

### 6. 数据持久化
- ✅ SQLite 数据库（主进程）
- ✅ localStorage（渲染进程）
- ✅ 数据备份和恢复
- ✅ 存储服务缓存机制

**代码位置**:
- 数据库服务：`src/main/database/index.ts`
- 存储服务：`src/renderer/services/StorageService.ts`
- 备份服务：`src/main/services/BackupService.ts`

---

## 实际功能状态

### ✅ 已实现的功能

**核心功能**:
- 计算器插件（1 个示例插件，演示插件开发流程）
- 插件管理界面（启用/禁用、导入/导出）
- 主题切换（18+ 主题）
- 数据备份和恢复
- 性能监控面板
- 设置管理

**基础设施**:
- 插件系统架构（独立窗口、状态管理）
- 主题系统架构（CSS 变量、动态切换）
- 事件总线（组件间通信）
- 日志系统（跨进程、依赖注入）
- 数据持久化（SQLite + localStorage）
- IPC 通信（主进程 ↔ 渲染进程）

### 🚧 计划中（未实现）

以下功能有数据库表结构或代码框架，但 UI 或完整功能未实现：

**更多内置插件**（计划开发）:
- JSON 工具（格式化、压缩、转义）
- Markdown 编辑器
- 正则表达式测试器
- Base64 编码/解码
- 颜色选择器
- 时间戳转换器
- UUID 生成器
- 单位转换器
- 加密解密工具
- 二维码生成器

**统计功能**（有数据库表，无 UI）:
- 键盘鼠标使用统计（数据库表已创建，但 UI 组件已删除）
- 输入事件监控服务（InputMonitor 已删除）

**高级功能**（计划中）:
- 在线插件市场
- 云同步功能
- 外部插件加载
- 自动更新功能

### 📊 当前项目状态

- **开发阶段**：早期阶段（框架搭建完成，功能开发中）
- **核心价值**：提供完整的插件开发框架，而非开箱即用的工具集
- **测试覆盖率**：< 20%（当前阶段优先功能开发，测试逐步完善）
- **代码提交**：约 50+ commits
- **示例插件**：1 个计算器插件

### 🎯 开发优先级

1. **框架优先**：确保插件系统、主题系统等核心架构稳定
2. **示例优先**：通过计算器插件演示插件开发流程
3. **渐进开发**：逐步添加更多实用插件
4. **文档优先**：提供清晰的开发指南和 API 文档

---

## 快速开始指南

### 了解项目架构（5 分钟）

**核心文件位置**：
```
src/
├── main/
│   ├── index.ts                    # 主进程入口
│   ├── windows/manager.ts          # 窗口管理器
│   ├── plugins/manager.ts          # 插件管理器
│   └── services/LogService.ts      # 日志服务
├── renderer/
│   ├── App.tsx                     # 主应用组件
│   ├── components/
│   │   ├── PluginWindow/           # 插件窗口组件
│   │   │   ├── PluginWindow.tsx
│   │   │   └── PluginWindow.css
│   │   ├── CalculatorPad.tsx       # 计算器插件示例
│   │   ├── PluginManager.tsx       # 插件管理器
│   │   └── SettingsPanel.tsx       # 设置面板
│   ├── utils/eventBus.ts           # 事件总线
│   └── themes/themes.ts            # 主题定义
└── shared/logger/                  # 日志系统
```

**快速查看**：
1. 阅读 `src/renderer/components/CalculatorPad.tsx` 了解插件结构
2. 查看 `src/renderer/components/PluginWindow/PluginWindow.tsx` 了解窗口包装器
3. 查看 `src/renderer/themes/themes.ts` 了解主题系统
4. 查看 `src/renderer/utils/eventBus.ts` 了解事件总线

### 开发你的第一个插件（15 分钟）

**步骤 1：创建插件组件**

```typescript
// src/renderer/components/TodoList/TodoList.tsx
import React, { useState } from 'react';
import PluginWindow from '../PluginWindow/PluginWindow';
import { createLogger } from '../../../shared/logger';
import './TodoList.css';

const logger = createLogger('TodoList');

interface TodoListProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

const TodoList: React.FC<TodoListProps> = ({
  onClose,
  onMinimize,
  onMaximize
}) => {
  const [todos, setTodos] = useState<string[]>([]);
  const [input, setInput] = useState('');

  const handleAdd = () => {
    if (input.trim()) {
      logger.info('Adding todo item', { item: input });
      setTodos([...todos, input]);
      setInput('');
    }
  };

  return (
    <PluginWindow
      title="待办事项"
      icon="📝"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      className="todolist-standalone"
      pluginId="todolist"
      showStandaloneButton={false}
    >
      <div className="todolist-content">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="添加待办事项..."
        />
        <button onClick={handleAdd}>添加</button>
        <ul>
          {todos.map((todo, index) => (
            <li key={index}>{todo}</li>
          ))}
        </ul>
      </div>
    </PluginWindow>
  );
};

export default TodoList;
```

**步骤 2：添加样式（使用 CSS 变量）**

```css
/* src/renderer/components/TodoList/TodoList.css */
.todolist-content {
  padding: 20px;
  background: var(--panel-background);
  color: var(--text-primary);
}

.todolist-content input {
  width: 70%;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--panel-background);
  color: var(--text-primary);
  margin-right: 8px;
}

.todolist-content button {
  padding: 8px 16px;
  background: var(--primary-color);
  color: var(--primary-text);
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.todolist-content button:hover {
  background: var(--primary-color-dark);
}

.todolist-content ul {
  margin-top: 20px;
  list-style: none;
}

.todolist-content li {
  padding: 8px 12px;
  background: var(--list-item-hover-bg);
  border-radius: 4px;
  margin-bottom: 8px;
}
```

**步骤 3：导出组件**

```typescript
// src/renderer/components/TodoList/index.ts
export { default } from './TodoList';
```

**步骤 4：在 App.tsx 中注册插件**

```typescript
// src/renderer/App.tsx
import TodoList from './components/TodoList';

const plugins: Plugin[] = [
  // ... 其他插件
  {
    id: 'todolist',
    name: '待办事项',
    description: '简单的待办事项管理工具',
    icon: '📝',
    component: TodoList
  }
];
```

**步骤 5：测试运行**

```bash
npm run dev
```

### 使用 EventBus（5 分钟）

**场景**：插件列表更新后，通知主面板刷新

```typescript
// 1. 导入事件总线
import { eventBus, AppEvents } from '../utils/eventBus';

// 2. 在组件中监听事件
useEffect(() => {
  const handlePluginsChanged = () => {
    logger.info('Plugins changed, refreshing...');
    loadPlugins(); // 刷新插件列表
  };

  const cleanup = eventBus.on(AppEvents.PLUGINS_CHANGED, handlePluginsChanged);

  return () => {
    cleanup(); // 组件卸载时清理监听器
  };
}, []);

// 3. 发送事件
const handlePluginInstalled = () => {
  // 安装插件后通知其他组件
  eventBus.emit(AppEvents.PLUGINS_CHANGED);
};
```

### 添加自定义主题（5 分钟）

**步骤 1：打开 themes.ts**

```typescript
// src/renderer/themes/themes.ts
export const themes: Theme[] = [
  // ... 现有主题

  // 步骤 2：添加新主题
  {
    id: 'my-custom-theme',
    name: '我的主题',
    icon: '🎨',
    mode: 'light', // or 'dark'
    colors: {
      background: 'rgba(255, 255, 255, 0.8)',
      foreground: '#0a0a0a',
      primary: '#YOUR_COLOR',
      secondary: '#YOUR_COLOR',
      accent: '#YOUR_COLOR',
      success: '#28A745',
      warning: '#FF9500',
      error: '#DC3545',

      // 可选：自定义文字颜色层级
      textPrimary: '#000000',
      textSecondary: '#333333',
      textTertiary: '#666666',
      border: '#cccccc',
      overlay: 'rgba(0, 0, 0, 0.5)'
    },
    glass: {
      blur: 20,
      opacity: 80,
      saturate: 180
    }
  }
];
```

**步骤 3：重启应用，新主题会自动出现在设置中**

### 使用 Logger（3 分钟）

```typescript
import { createLogger } from '../../shared/logger';

const logger = createLogger('ComponentName');

// DEBUG 级别：开发调试信息
logger.debug('Function called', { param1, param2 });

// INFO 级别：重要业务流程
logger.info('User action completed', { userId, action });

// WARN 级别：警告信息
logger.warn('Performance issue', { duration: 1500 });

// ERROR 级别：错误信息
logger.error('Operation failed', { error: err.message, stack: err.stack });
```

### 常见开发任务

**创建新组件**：
```bash
# 1. 创建组件目录
mkdir src/renderer/components/MyComponent
# 2. 创建文件
touch src/renderer/components/MyComponent/MyComponent.tsx
touch src/renderer/components/MyComponent/MyComponent.css
touch src/renderer/components/MyComponent/index.ts
```

**查看主题变量**：
```bash
# 打开浏览器开发者工具
# 在 Console 中输入：
getComputedStyle(document.documentElement)
# 查找所有以 -- 开头的 CSS 变量
```

**调试插件窗口**：
```typescript
// 在插件组件中添加
useEffect(() => {
  logger.info('Plugin mounted', { pluginId: 'my-plugin' });
}, []);
```

**查看日志文件**：
```bash
# Linux
tail -f ~/.config/desktop-tool/logs/app.log

# macOS
tail -f ~/Library/Application Support/desktop-tool/logs/app.log

# Windows
tail -f %APPDATA%/desktop-tool/logs/app.log
```

---

## AI 开发规范

本规范为 AI 辅助开发提供明确的指导原则和最佳实践，确保代码质量和开发效率。

### 测试驱动开发（TDD）规范

#### 核心原则

```
开发新功能 = 编写测试 + 实现功能 + 测试通过
```

#### 测试要求

**当前阶段（早期开发）**：
- ✅ **关键组件添加基础测试**
- ✅ **核心功能编写测试用例**
- ✅ **所有测试必须通过才能提交代码**
- 🎯 **覆盖率目标：逐步提升（不要求 80%）**

**成熟阶段（功能完整后）**：
- 🎯 **测试覆盖率逐步提升至 60-80%**
- 🎯 **关键业务逻辑 100% 覆盖**
- 🎯 **完整的单元测试和集成测试**

**注意**：当前项目处于早期开发阶段，优先核心功能开发。测试覆盖率会随着项目成熟逐步提升，不要求初期达到 80%。

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

**当前阶段（早期开发）**：
- **总体覆盖率**：逐步提升（当前 < 20%）
- **核心业务逻辑**：关键功能优先
- **组件渲染**：主要组件覆盖
- **边界情况**：重要场景覆盖

**成熟阶段目标**：
- **总体覆盖率**：60-80%
- **核心业务逻辑**：100%
- **组件渲染**：≥ 90%
- **边界情况**：≥ 70%

**说明**：覆盖率目标是渐进的，随着项目成熟逐步提升，不要求初期达到高标准。

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

### 跨平台日志架构

#### 日志系统架构

项目的日志系统基于 `UnifiedLogger`，支持三种运行环境：

```
┌─────────────┐
│ 主进程      │  logger → LogService → 文件
│ (Main)      │  ✅ console + file
└─────────────┘

┌─────────────┐
│ 渲染进程    │  logger → IPC → 主进程 LogService → 文件
│ (Renderer)  │  ✅ console + file
└─────────────┘

┌─────────────┐
│ Web 模式    │  logger → console only
│ (Web)       │  ✅ console only
└─────────────┘
```

#### 平台差异说明

| 平台 | isDesktop | 日志输出 | 文件写入 | 实现方式 |
|------|-----------|----------|----------|----------|
| **主进程** | true | console + file | ✅ | 直接调用 LogService |
| **渲染进程** | true | console + file | ✅ | IPC → 主进程 LogService |
| **Web 模式** | false | console | ❌ | 仅 console 输出 |

#### detectPlatform() 方法

日志系统使用 `detectPlatform()` 方法自动检测运行平台：

```typescript
private detectPlatform(): 'main' | 'renderer' | 'web' {
  if (typeof window !== 'undefined' && window) {
    if ((window as any).electron?.ipcRenderer) {
      return 'renderer';  // 渲染进程
    }
    return 'web';          // Web 模式
  }
  return 'main';            // 主进程
}
```

**日志条目包含平台标识**：
```typescript
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  platform: 'main' | 'renderer' | 'web';  // 平台标识
  module: string;
}
```

#### 主进程 vs 渲染进程日志行为

**主进程** (`src/main/`):
```typescript
import { createLogger } from '../shared/logger';

const logger = createLogger('PluginManager');
logger.info('Plugin loaded', { pluginId: 'json-tool' });
// → console: [PluginManager] Plugin loaded
// → file:    写入到 ~/.config/desktop-tool/logs/app.log
```

**渲染进程** (`src/renderer/`):
```typescript
import { createLogger } from '@shared/logger';

const logger = createLogger('App');
logger.info('Component mounted', { component: 'PluginList' });
// → console: [App] Component mounted
// → IPC:     发送到主进程
// → file:    主进程写入到 ~/.config/desktop-tool/logs/app.log
```

#### 何时使用 logger vs console.log

```typescript
// ✅ 使用 createLogger (所有生产代码)
import { createLogger } from '@shared/logger';
const logger = createLogger('ModuleName');
logger.info('Important event');

// ❌ 避免使用 console.log (生产代码)
console.log('Debug info');  // 不写入日志文件，不利于调试

// ✅ 仅在以下情况使用 console:
// 1. 临时调试（开发阶段，调试后删除）
// 2. 测试代码中的断点辅助
// 3. 快速原型（后续替换为 logger）
```

#### 查看日志文件

日志文件位置：
- **Linux**: `~/.config/desktop-tool/logs/app.log`
- **macOS**: `~/Library/Application Support/desktop-tool/logs/app.log`
- **Windows**: `%APPDATA%/desktop-tool/logs/app.log`

```bash
# 查看最近的日志
tail -f ~/.config/desktop-tool/logs/app.log

# 搜索特定平台的日志
grep "\[main\]" ~/.config/desktop-tool/logs/app.log
grep "\[renderer\]" ~/.config/desktop-tool/logs/app.log
```

---

### 事件广播最佳实践

#### 主进程到渲染进程的事件广播

在 Electron 应用中，主进程需要向渲染进程广播事件以更新 UI：

**实现模式**：
```typescript
// src/main/plugins/manager.ts

export class PluginManager {
  private mainWindow: Electron.BrowserWindow | null = null;

  constructor(store: PluginStore, mainWindow: Electron.BrowserWindow | null = null) {
    this.store = store;
    this.mainWindow = mainWindow;
  }

  setMainWindow(window: Electron.BrowserWindow | null): void {
    this.mainWindow = window;
  }

  private broadcastEvent(channel: string, ...args: any[]): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, ...args);
    }
  }

  async install(pluginPath: string): Promise<void> {
    // ... 安装逻辑 ...

    // 广播事件
    this.emit(PluginEventType.LOADED, manifest.id);
    this.broadcastEvent('plugin:loaded', manifest.id);
    this.broadcastEvent('plugin:installed', manifest.id);
  }
}
```

**渲染进程监听事件**：
```typescript
// src/renderer/App.tsx

useEffect(() => {
  const handlePluginLoaded = (event: any, pluginId: string) => {
    logger.info(`Plugin loaded: ${pluginId}`);
    loadPluginsInit();  // 刷新插件列表
  };

  if (window.electron?.ipcRenderer) {
    window.electron.ipcRenderer.on('plugin:loaded', handlePluginLoaded);
    window.electron.ipcRenderer.on('plugin:unloaded', handlePluginLoaded);
    window.electron.ipcRenderer.on('plugin:installed', handlePluginLoaded);
    window.electron.ipcRenderer.on('plugin:uninstalled', handlePluginLoaded);
  }

  return () => {
    // 清理监听器
    if (window.electron?.ipcRenderer) {
      window.electron.ipcRenderer.off('plugin:loaded', handlePluginLoaded);
      window.electron.ipcRenderer.off('plugin:unloaded', handlePluginLoaded);
    }
  };
}, []);
```

#### 事件命名规范

遵循一致的命名约定：

| 事件名称 | 用途 | 示例 |
|----------|------|------|
| `plugin:loaded` | 插件已加载（内部状态） | 启动时加载、重新加载 |
| `plugin:unloaded` | 插件已卸载（内部状态） | 禁用插件 |
| `plugin:installed` | 插件已安装（用户操作） | 导入 ZIP 文件 |
| `plugin:uninstalled` | 插件已卸载（用户操作） | 删除插件 |
| `plugin:activated` | 插件已激活 | 打开插件窗口 |
| `plugin:deactivated` | 插件已停用 | 关闭插件窗口 |

**命名模式**: `<domain>:<action>`

#### 调试事件流

使用日志追踪事件流：

```typescript
// 主进程：广播事件
private broadcastEvent(channel: string, ...args: any[]): void {
  logger.debug(`Broadcasting event: ${channel}`, { args });
  if (this.mainWindow && !this.mainWindow.isDestroyed()) {
    this.mainWindow.webContents.send(channel, ...args);
    logger.debug(`Event sent: ${channel}`);
  } else {
    logger.error(`Cannot broadcast: mainWindow is ${this.mainWindow ? 'destroyed' : 'null'}`);
  }
}

// 渲染进程：监听事件
const handlePluginLoaded = (event: any, ...args: any[]) => {
  logger.info(`Received event: plugin:loaded`, { args });
  loadPluginsInit();
};
```

#### 常见事件广播问题

1. **事件未触发**：
   - 检查 `mainWindow` 是否已设置
   - 检查窗口是否已销毁 (`isDestroyed()`)
   - 检查事件名称是否匹配

2. **事件监听器未清理**：
   - 始终在 `useEffect` cleanup 中移除监听器
   - 使用 `.off()` 而不是 `.removeAllListeners()`

3. **重复监听**：
   - 避免在每次渲染时添加监听器
   - 使用 `useEffect` 空依赖数组

---

### 常见陷阱和解决方案

#### 陷阱 1: 主进程日志不写文件

**问题**: 主进程的 `logger.info()` 只输出到 console，不写入日志文件

**原因**: `detectDesktop()` 方法检查 `window.electron.ipcRenderer`，主进程返回 `false`

**错误代码**:
```typescript
// ❌ 错误的实现
private detectDesktop(): boolean {
  if (typeof window !== 'undefined' && window) {
    return !!(window as any).electron?.ipcRenderer;
  }
  return false;  // 主进程返回 false
}
```

**解决方案**:
```typescript
// ✅ 正确的实现
private detectDesktop(): boolean {
  if (typeof window !== 'undefined' && window) {
    return !!(window as any).electron?.ipcRenderer;
  }
  return true;  // 主进程也返回 true
}
```

**验证方法**:
```bash
# 主进程应该写入日志文件
grep "\[main\]" ~/.config/desktop-tool/logs/app.log
```

---

#### 陷阱 2: 事件监听器未正确清理

**问题**: 组件卸载后事件监听器仍然存在，导致内存泄漏

**错误代码**:
```typescript
// ❌ 没有清理监听器
useEffect(() => {
  window.electron.ipcRenderer.on('plugin:loaded', handlePluginLoaded);
}, []);
```

**解决方案**:
```typescript
// ✅ 添加 cleanup 函数
useEffect(() => {
  const handlePluginLoaded = (event: any, pluginId: string) => {
    logger.info(`Plugin loaded: ${pluginId}`);
    loadPluginsInit();
  };

  if (window.electron?.ipcRenderer) {
    window.electron.ipcRenderer.on('plugin:loaded', handlePluginLoaded);
  }

  return () => {
    // 清理监听器
    if (window.electron?.ipcRenderer) {
      window.electron.ipcRenderer.off('plugin:loaded', handlePluginLoaded);
    }
  };
}, []);
```

**验证方法**:
- 在组件卸载后检查是否还有日志输出
- 使用 React DevTools 检查组件是否正确卸载

---

#### 陷阱 3: IPC 通道命名不一致

**问题**: 主进程和渲染进程使用不同的 IPC 通道名称

**错误示例**:
```typescript
// 主进程
mainWindow.webContents.send('plugin-loaded', pluginId);

// 渲染进程
window.electron.ipcRenderer.on('plugin:loaded', handler);  // 不匹配！
```

**解决方案**:
```typescript
// ✅ 使用统一的常量定义
// src/shared/types/ipc.ts
export const IPCChannels = {
  PLUGIN_LOADED: 'plugin:loaded',
  PLUGIN_UNLOADED: 'plugin:unloaded',
  // ...
} as const;

// 主进程
mainWindow.webContents.send(IPCChannels.PLUGIN_LOADED, pluginId);

// 渲染进程
window.electron.ipcRenderer.on(IPCChannels.PLUGIN_LOADED, handler);
```

---

#### 陷阱 4: 平台检测逻辑错误

**问题**: 使用 `window` 对象判断平台，导致主进程检测失败

**错误代码**:
```typescript
// ❌ 错误的检测逻辑
function isDesktop(): boolean {
  return !!(window as any).electron?.ipcRenderer;  // 主进程返回 false
}

function isMainProcess(): boolean {
  return !isDesktop();  // 主进程错误地返回 false
}
```

**解决方案**:
```typescript
// ✅ 正确的检测逻辑
function detectPlatform(): 'main' | 'renderer' | 'web' {
  if (typeof window !== 'undefined' && window) {
    if ((window as any).electron?.ipcRenderer) {
      return 'renderer';
    }
    return 'web';
  }
  return 'main';
}

const platform = detectPlatform();
const isMainProcess = platform === 'main';
const isRenderer = platform === 'renderer';
const isWeb = platform === 'web';
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
- 包含基础测试（核心功能）
- 使用 createLogger 添加日志
- 使用 CSS 变量（支持主题切换）
- 使用内联确认 + Toast（不用 confirm/alert）"
```

#### 分步实现策略

```typescript
// 第 1 步：让 AI 编写测试
"请为 UserProfile 组件编写基础测试用例，包括：
- 渲染测试（props、loading、error）
- 交互测试（点击、输入）
- 边界情况测试（空数据、错误处理）
- 可访问性测试（ARIA、键盘导航）
- 测试覆盖率目标：覆盖核心功能（不要求 80%）"

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

## 使用 UI/UX 设计 Skill

项目已配置 `ui-ux-pro-max` skill 来辅助 UI/UX 设计。

### Skill 能力

`ui-ux-pro-max` skill 提供以下功能：
- **50+ UI 样式**：glassmorphism, claymorphism, minimalism, brutalism, neumorphism, bento grid 等
- **21 种配色方案**：浅色、深色、渐变、高对比度等
- **50 种字体配对**：标题和正文的最佳组合
- **20 种图表类型**：柱状图、折线图、饼图、雷达图等
- **9 种技术栈**：React, Next.js, Vue, Svelte, SwiftUI, React Native, Flutter, Tailwind, shadcn/ui

### 使用场景

#### 1. 设计新插件界面

**提示词示例**：
```
使用 ui-ux-pro-max skill 设计一个待办事项插件的界面，要求：
- 风格：glassmorphism（毛玻璃效果）
- 技术栈：React + Tailwind CSS
- 包含组件：输入框、添加按钮、列表项
- 动画：平滑过渡动画
- 配色：浅色主题，高对比度
```

#### 2. 优化现有组件

**提示词示例**：
```
使用 ui-ux-pro-max skill 优化插件管理器界面，要求：
- 改进布局：使用 bento grid 布局
- 优化交互：添加 hover 动画和过渡效果
- 配色方案：使用 sunset gradient 渐变配色
- 响应式：支持不同屏幕尺寸
```

#### 3. 创建主题

**提示词示例**：
```
使用 ui-ux-pro-max skill 创建一个新的主题，要求：
- 风格：minimalism（极简主义）
- 配色：深色主题，主色调为紫色
- 对比度：高对比度（WCAG AA 标准）
- 适用场景：长时间使用
```

### Skill 操作类型

`ui-ux-pro-max` skill 支持以下操作：

| 操作 | 说明 | 示例 |
|------|------|------|
| **plan** | 规划 UI/UX 设计方案 | "为插件界面设计规划布局结构" |
| **build** | 构建 UI 组件和页面 | "构建一个带动画的按钮组件" |
| **create** | 创建新组件或样式 | "创建一个毛玻璃效果的卡片" |
| **design** | 设计整体视觉方案 | "设计一个待办事项应用的视觉风格" |
| **implement** | 实现具体的设计细节 | "实现按钮的 hover 效果" |
| **review** | 审查现有 UI 设计 | "审查插件管理器的 UI 设计" |
| **fix** | 修复 UI 问题 | "修复深色主题下的对比度问题" |
| **improve** | 改进用户体验 | "改进插件列表的交互体验" |
| **optimize** | 优化性能和动画 | "优化页面加载动画的性能" |
| **enhance** | 增强视觉效果 | "增强卡片的阴影和边框效果" |

### 与项目规范结合

使用 `ui-ux-pro-max` skill 时，请遵循项目规范：

1. **CSS 变量规范**：
   - 所有样式必须使用 CSS 变量
   - 参考 `src/renderer/styles/global.css` 中的变量列表

2. **主题系统**：
   - 新主题需添加到 `src/renderer/themes/themes.ts`
   - 遵循主题定义结构（id, name, mode, colors, glass）

3. **组件结构**：
   - 插件组件必须使用 `PluginWindow` 包装
   - 遵循现有的组件命名和文件组织规范

4. **交互模式**：
   - 使用内联确认，不使用 confirm/alert
   - 使用 Toast 通知提供反馈
   - 参考 `PluginManager.tsx` 的实现

### 示例工作流

**场景：创建新的 Markdown 编辑器插件**

```
步骤 1：设计视觉风格
"使用 ui-ux-pro-max skill 设计一个 Markdown 编辑器插件的界面风格，要求：
- 风格：minimalism
- 配色：深色主题，主色调为蓝色
- 布局：左侧编辑区，右侧预览区"

步骤 2：构建组件结构
"基于上面的设计，构建 Markdown 编辑器组件，使用：
- React + TypeScript
- PluginWindow 包装
- CSS 变量（支持主题切换）"

步骤 3：实现交互细节
"使用 ui-ux-pro-max skill 实现以下交互：
- 工具栏按钮的 hover 效果
- 编辑器自动聚焦动画
- 预览区切换动画"
```

### 注意事项

- ✅ skill 提供的设计方案需要结合项目实际
- ✅ 生成的代码需要遵循项目的 TypeScript 规范
- ✅ 所有样式必须使用 CSS 变量
- ✅ 组件需要适配主题系统
- ❌ 不要直接使用硬编码的颜色值
- ❌ 不要跳过 PluginWindow 包装

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

#### 跨进程调试

Electron 应用的调试需要关注主进程和渲染进程之间的通信：

**1. 调试 IPC 通信**：
```typescript
// 主进程：记录 IPC 调用
setupIPCHandlers(mainProcess) {
  const handler = async (event: any, channel: string, ...args: any[]) => {
    logger.debug(`[IPC] Received: ${channel}`, { args });
    // ... 处理逻辑 ...
    logger.debug(`[IPC] Response: ${channel}`, { result });
  };
}
```

**2. 调试事件流**：
```typescript
// 主进程：追踪事件广播
private broadcastEvent(channel: string, ...args: any[]): void {
  logger.debug(`[Broadcast] ${channel}`, { args, windowExists: !!this.mainWindow });
  if (this.mainWindow && !this.mainWindow.isDestroyed()) {
    this.mainWindow.webContents.send(channel, ...args);
    logger.info(`[Broadcast] Sent: ${channel}`);
  } else {
    logger.error(`[Broadcast] Failed: ${channel}`, {
      reason: this.mainWindow ? 'destroyed' : 'null'
    });
  }
}

// 渲染进程：追踪事件接收
const handlePluginEvent = (event: any, ...args: any[]) => {
  logger.info(`[Renderer] Received: ${event.type}`, { args });
  // ... 处理逻辑 ...
};
```

**3. 日志文件分析**：
```bash
# 实时查看所有日志
tail -f ~/.config/desktop-tool/logs/app.log

# 过滤特定平台
grep "\[main\]" ~/.config/desktop-tool/logs/app.log | grep "ERROR"
grep "\[renderer\]" ~/.config/desktop-tool/logs/app.log | grep "plugin:"

# 查看事件流
grep "Broadcasting" ~/.config/desktop-tool/logs/app.log
grep "Received event" ~/.config/desktop-tool/logs/app.log

# 查看最近的错误
tail -100 ~/.config/desktop-tool/logs/app.log | grep "ERROR"
```

**4. 跨进程问题诊断**：

| 问题 | 检查步骤 | 解决方法 |
|------|---------|---------|
| 事件未触发 | 检查日志中是否有 "Broadcasting" | 确认 `broadcastEvent()` 被调用 |
| 事件未接收 | 检查日志中是否有 "Received event" | 确认监听器已注册 |
| 窗口为空 | 检查 "mainWindow is null" | 确认 `setMainWindow()` 已调用 |
| 窗口已销毁 | 检查 "window is destroyed" | 避免在窗口销毁后发送事件 |

**5. 使用 Chrome DevTools 调试**：
```typescript
// 主进程：启动时打开 DevTools
mainWindow.webContents.openDevTools();

// 渲染进程：在代码中添加断点
debugger;  // 浏览器会在此处暂停

// 条件断点
if (pluginId === 'json-tool') {
  debugger;  // 只在特定条件下暂停
}
```

**6. 性能监控**：
```typescript
// 监控 IPC 通信延迟
const sendTime = Date.now();
await window.electron.ipcRenderer.invoke('plugin:list');
const duration = Date.now() - sendTime;
if (duration > 100) {
  logger.warn('Slow IPC call', { duration, channel: 'plugin:list' });
}
```

---

## 核心功能

### 1. 插件系统架构
- ✅ 独立窗口支持（BrowserWindow）
- ✅ 自定义标题栏（PluginWindow 组件）
- ✅ 窗口状态持久化（位置、大小、最大化）
- ✅ 插件管理界面（启用/禁用、导入/导出）
- ✅ 插件开发框架完整

### 2. 示例插件
- ✅ **计算器插件**（演示插件开发流程）
  - 基础四则运算
  - 键盘输入支持
  - 独立窗口运行
  - 完整的源代码参考

### 3. 主题系统
- ✅ **18+ 预设主题**（6 浅色 + 11 深色 + 1 渐变）
- ✅ 动态主题切换
- ✅ CSS 变量支持
- ✅ 高对比度主题（4 个）
- ✅ 透明度可调

### 4. 数据管理
- ✅ SQLite 数据库（主进程）
- ✅ localStorage（渲染进程）
- ✅ 数据备份和恢复
- ✅ 存储服务缓存机制

### 5. 开发工具
- ✅ 性能监控面板
- ✅ 设置管理
- ✅ 日志系统（跨进程）
- ✅ 事件总线（组件通信）

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
   - **当前阶段**：基础测试覆盖核心功能
   - **成熟阶段**：覆盖率逐步提升至 60-80%
   - 核心业务逻辑优先测试
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
   - **当前阶段**：要求基础测试覆盖核心功能（不要求 80%）
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

## 最新架构模式（2026-01-18 更新）

### 事件总线（EventBus）

**用途**: 渲染进程组件间通信，无需经过 IPC。

**实现位置**: `src/renderer/utils/eventBus.ts`

**使用示例**:

```typescript
// 导入事件总线
import { eventBus, AppEvents } from '../utils/eventBus';

// 发送事件
eventBus.emit(AppEvents.PLUGINS_CHANGED);

// 监听事件
const cleanup = eventBus.on(AppEvents.PLUGINS_CHANGED, () => {
  // 处理事件
  console.log('Plugins changed!');
});

// 清理监听（重要！）
cleanup();

// 在 React 组件中使用
useEffect(() => {
  const handlePluginsChanged = () => {
    loadPlugins();
  };

  const cleanup = eventBus.on(AppEvents.PLUGINS_CHANGED, handlePluginsChanged);

  return () => {
    cleanup(); // 组件卸载时清理
  };
}, []);
```

**适用场景**:
- ✅ 组件间状态同步（如插件列表更新）
- ✅ 跨层级通信（避免 props drilling）
- ❌ 不需要持久化的临时通信
- ❌ 主进程和渲染进程通信（应使用 IPC）

**已定义的事件**:
```typescript
export const AppEvents = {
  PLUGINS_CHANGED: 'app:plugins-changed',
  // 可以根据需要添加更多事件
};
```

---

### 依赖注入模式（Logger 系统）

**问题**: 主进程的 Logger 在打包后路径失效，无法在渲染进程中 `require`

**解决方案**: 依赖注入 + IPC 桥接

**实现位置**: `src/shared/logger/index.ts`

**主进程设置**:
```typescript
import { setMainProcessLogService } from './shared/logger';

class MainProcess {
  constructor() {
    // 注入 LogService 实例
    setMainProcessLogService(this.logService);
  }
}
```

**渲染进程使用**:
```typescript
import { createLogger } from '../../shared/logger';

const logger = createLogger('ComponentName');

logger.info('This will be sent to main process via IPC');
logger.error('Error occurred', { error: err });
```

**IPC 通道**: `LOG_WRITE`

**工作流程**:
```
渲染进程调用 logger.info()
    ↓
检查是否有 mainProcessLogService
    ↓
如果没有 → 通过 IPC 发送到主进程
    ↓
主进程 LogService 写入日志文件
```

---

### UI/UX 最佳实践

#### 1. 内联确认模式

**❌ 错误做法**: 使用原生弹窗
```typescript
// 不要这样做！
if (confirm('确定要删除吗？')) {
  deleteItem();
}

// 也不要这样做！
alert('删除成功！');
```

**✅ 正确做法**: 内联确认 + Toast 通知
```typescript
const [confirmingId, setConfirmingId] = useState<string | null>(null);
const [showToast, setShowToast] = useState(false);
const [toastMessage, setToastMessage] = useState('');

// 点击删除按钮
const handleDeleteClick = (id: string) => {
  setConfirmingId(id); // 显示确认按钮
};

// 确认删除
const confirmDelete = async (id: string) => {
  try {
    await deleteItem(id);
    setToastMessage('删除成功');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  } catch (error) {
    logger.error('Delete failed', { error });
  } finally {
    setConfirmingId(null);
  }
};

// 取消删除
const cancelDelete = () => {
  setConfirmingId(null);
};

// JSX
{confirmingId === item.id ? (
  <div className="confirm-buttons">
    <button onClick={() => confirmDelete(item.id)}>✓ 确认</button>
    <button onClick={cancelDelete}>✕ 取消</button>
  </div>
) : (
  <button onClick={() => handleDeleteClick(item.id)}>🗑️</button>
)}

{showToast && (
  <div className="toast success">
    {toastMessage}
  </div>
)}
```

#### 2. Toast 通知模式

**组件结构**:
```tsx
{showToast && (
  <div className={`toast ${toastType}`}>
    {toastMessage}
  </div>
)}
```

**CSS 样式** (必须使用 CSS 变量):
```css
.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 8px;
  background: var(--panel-background);
  color: var(--text-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.3s ease-out;
  z-index: 2000;
}

.toast.success {
  background: var(--success-color);
  color: white;
}

.toast.error {
  background: var(--error-color);
  color: white;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
```

---

### CSS 变量规范

**核心原则**: 所有样式必须使用 CSS 变量以支持主题切换。

**✅ 正确**:
```css
.plugin-modal {
  background: var(--panel-background);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.plugin-button {
  background: var(--button-bg);
  color: var(--text-secondary);
}

.plugin-button:hover {
  background: var(--button-hover-bg);
  color: var(--text-primary);
}
```

**❌ 错误**:
```css
.plugin-modal {
  background: rgba(255, 255, 255, 0.95);  /* 硬编码！ */
  color: #1a1a2e;                          /* 硬编码！ */
  border: 1px solid #ccc;                  /* 硬编码！ */
}
```

**可用的 CSS 变量**:
```css
/* 文字颜色 */
--text-primary          /* 主文字 */
--text-secondary        /* 次要文字 */
--text-tertiary         /* 第三级文字 */

/* 背景色 */
--panel-background      /* 面板背景 */
--toolbar-bg           /* 工具栏背景 */
--overlay-bg           /* 遮罩层背景 */

/* 按钮状态 */
--button-bg            /* 按钮默认背景 */
--button-hover-bg      /* 按钮悬停背景 */

/* 主题色 */
--primary-color        /* 主色调 */
--primary-text         /* 主色调文字 */
--primary-color-light  /* 主色调浅色变体 */
--primary-color-dark   /* 主色调深色变体 */

/* 功能色 */
--success-color        /* 成功 */
--warning-color        /* 警告 */
--error-color          /* 错误 */
--error-color-light    /* 错误浅色变体 */

/* 边框和分割线 */
--border-color         /* 边框颜色 */

/* 列表项 */
--list-item-hover-bg   /* 列表项悬停背景 */
```

**如何添加新主题**:
```typescript
// src/renderer/themes/themes.ts
{
  id: 'my-theme',
  name: '我的主题',
  mode: 'light',
  colors: {
    background: 'rgba(255, 255, 255, 0.8)',
    foreground: '#0a0a0a',
    primary: '#0066CC',
    // ... 其他颜色

    // 可选：自定义文字颜色层级
    textPrimary: '#000000',
    textSecondary: '#333333',
    textTertiary: '#666666',
    border: '#cccccc',
    overlay: 'rgba(0, 0, 0, 0.5)'
  }
}
```

---

### 插件管理器最佳实践

**文件**: `src/renderer/components/PluginManager.tsx`

**关键功能**:
1. **插件列表刷新**: 使用 `eventBus.emit(AppEvents.PLUGINS_CHANGED)` 通知主面板
2. **卸载流程**: 使用内联确认 + Toast 通知，不使用 confirm/alert
3. **状态同步**: 同时刷新插件列表和插件状态

**示例**:
```typescript
const confirmUninstall = async () => {
  try {
    await window.electron?.ipcRenderer?.invoke(
      IPCChannels.PLUGIN_UNINSTALL,
      uninstallingPluginId
    );

    // Toast 通知
    setToastMessage(`插件 "${uninstallingPluginId}" 已成功卸载`);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 2000);

    // 刷新列表
    loadPlugins();
    loadPluginStates();

    // 通知主面板
    eventBus.emit(AppEvents.PLUGINS_CHANGED);
  } catch (error) {
    logger.error('Failed to uninstall plugin', { error });
  }
};
```

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
- [ ] **当前阶段**：基础测试覆盖核心功能
- [ ] **成熟阶段**：覆盖率达标（60-80%）（`npm run test:coverage`）
- [ ] 核心业务逻辑有测试覆盖
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
