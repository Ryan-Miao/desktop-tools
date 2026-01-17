# 插件开发指南

本指南将帮助你为 Desktop Tool 开发插件。

## 目录

- [插件概述](#插件概述)
- [独立窗口架构](#独立窗口架构)
- [快速开始](#快速开始)
- [插件结构](#插件结构)
- [插件组件](#插件组件)
- [窗口控制](#窗口控制)
- [样式和主题](#样式和主题)
- [API 参考](#api-参考)
- [最佳实践](#最佳实践)
- [发布插件](#发布插件)
- [示例插件](#示例插件)

## 插件概述

Desktop Tool 采用基于 React 组件的插件系统，每个插件都在独立的 Electron BrowserWindow 中运行，提供完整的窗口控制功能。

### 插件类型

1. **内置插件** - 随应用一起发布的插件
2. **外部插件** - 用户安装的第三方插件（计划中）

### 核心特性

- 🖥️ **独立窗口** - 完整的窗口控制（最小化、最大化、关闭）
- 🎯 **自定义标题栏** - 使用 PluginWindow 组件，无原生菜单栏
- 🖱️ **拖拽支持** - 标题栏可拖拽移动窗口
- ⌨️ **快捷键** - ESC 键快速关闭窗口
- 💾 **状态持久化** - 自动保存和恢复窗口状态
- 🎨 **主题适配** - 自动适配应用主题（浅色/深色）

## 独立窗口架构

### 窗口生命周期

```
用户点击插件图标
    ↓
App.tsx: handlePluginClick()
    ↓
IPC: plugin:open-standalone
    ↓
WindowManager: createPluginWindow()
    ↓
创建 Electron BrowserWindow (frame: false)
    ↓
加载独立窗口路由 (#plugin-standalone/{pluginId})
    ↓
StandaloneApp.tsx: 根据 pluginId 渲染对应插件
    ↓
插件组件使用 PluginWindow 包装
    ↓
显示独立窗口，等待用户操作
```

### 窗口配置

独立窗口默认配置：

```typescript
{
  width: 900,
  height: 700,
  minWidth: 600,
  minHeight: 400,
  transparent: false,      // 不透明
  frame: false,            // 无边框
  skipTaskbar: false,      // 显示任务栏图标
  backgroundColor: '#ffffff',
  resizable: true,
  maximizable: true,
  minimizable: true,
  closable: true
}
```

## 快速开始

### 创建一个简单的插件

```bash
# 1. 在 src/renderer/components 创建插件目录
mkdir -p src/renderer/components/MyPlugin

# 2. 创建插件组件文件
cd src/renderer/components/MyPlugin
touch MyPlugin.tsx
```

## 插件结构

### 标准结构

```
src/renderer/components/
└── MyPlugin/
    ├── MyPlugin.tsx           # 插件主组件（必需）
    ├── MyPlugin.css           # 插件样式（可选）
    └── index.ts               # 导出文件（推荐）
```

### 推荐的组织方式

```
src/renderer/components/
├── PluginWindow/              # 共享的窗口包装组件
│   ├── PluginWindow.tsx
│   ├── PluginWindow.css
│   └── index.ts
├── MyPlugin/
│   ├── MyPlugin.tsx
│   ├── MyPlugin.css
│   └── index.ts
└── AnotherPlugin/
    ├── AnotherPlugin.tsx
    ├── AnotherPlugin.css
    └── index.ts
```

### 内置 vs 外部插件

| 特性 | 内置插件 | 外部插件 |
|------|---------|---------|
| 位置 | `src/renderer/components/` | `plugins/` |
| 组件 | React 组件 | manifest.json + 代码 |
| 热更新 | ✅ 支持 | 计划中 |
| 权限 | 完整 | 受限（计划） |
| 窗口控制 | ✅ 完整支持 | ✅ 完整支持 |

## 插件组件

### 基础组件

插件组件必须使用 `PluginWindow` 包装，以获得完整的窗口控制功能：

```tsx
import React, { useState } from 'react';
import PluginWindow from '../PluginWindow/PluginWindow';
import { storageService } from '../../services/StorageService';

interface MyPluginProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

const MyPlugin: React.FC<MyPluginProps> = ({
  onClose,
  onMinimize,
  onMaximize
}) => {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    // 处理逻辑
    console.log('提交:', value);

    // 保存到存储
    storageService.updatePluginState('my-plugin', {
      customData: { lastValue: value }
    });

    // 关闭窗口
    onClose();
  };

  return (
    <PluginWindow
      title="我的插件"
      icon="🚀"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      className="my-plugin-standalone"
      pluginId="my-plugin"
      showStandaloneButton={false}
    >
      <div className="my-plugin-content">
        <h2>欢迎使用我的插件</h2>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="输入内容..."
          className="input-field"
        />
        <button onClick={handleSubmit} className="submit-button">
          提交
        </button>
      </div>
    </PluginWindow>
  );
};

export default MyPlugin;
```

### PluginWindow 组件属性

| 属性 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `title` | string | ✅ | 窗口标题 |
| `icon` | string | ✅ | 窗口图标（emoji） |
| `onClose` | () => void | ✅ | 关闭回调 |
| `onMinimize` | () => void | ❌ | 最小化回调 |
| `onMaximize` | () => void | ❌ | 最大化回调 |
| `className` | string | ❌ | 自定义样式类 |
| `pluginId` | string | ❌ | 插件 ID |
| `showStandaloneButton` | boolean | ❌ | 是否显示独立窗口按钮（独立窗口中应为 false） |
| `children` | ReactNode | ✅ | 插件内容 |

## 窗口控制

### 注册插件到应用

插件需要在两个地方注册：

#### 1. App.tsx - 添加到插件列表

```tsx
// src/renderer/App.tsx

import MyPlugin from './components/MyPlugin';

const plugins: Plugin[] = [
  // ... 其他插件
  {
    id: 'my-plugin',
    name: '我的插件',
    description: '这是一个示例插件',
    icon: '🚀'
  }
];

// 点击插件时通过 IPC 打开独立窗口
const handlePluginClick = async (pluginId: string) => {
  try {
    if (window.electron?.ipcRenderer) {
      const plugin = plugins.find(p => p.id === pluginId);
      const result = await window.electron.ipcRenderer.invoke(
        'plugin:open-standalone',
        pluginId,
        plugin?.name || 'Plugin'
      );

      if (result.success) {
        storageService.updatePluginLastUsed(pluginId);
      }
    }
  } catch (error) {
    console.error('Failed to open plugin window:', error);
  }
};
```

#### 2. StandaloneApp.tsx - 添加渲染逻辑

```tsx
// src/renderer/StandaloneApp.tsx

import MyPlugin from './components/MyPlugin';

function StandaloneApp() {
  const [pluginId, setPluginId] = useState<string | null>(null);
  const [windowId, setWindowId] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#plugin-standalone/')) {
      const id = hash.replace('#plugin-standalone/', '');
      setPluginId(id);
      setWindowId(`standalone-${id}`);
    }
  }, []);

  const handleClose = async () => {
    if (window.electron?.ipcRenderer && windowId) {
      await window.electron.ipcRenderer.invoke('standalone-window:close', windowId);
    }
  };

  const handleMinimize = async () => {
    if (window.electron?.ipcRenderer && windowId) {
      await window.electron.ipcRenderer.invoke('standalone-window:minimize', windowId);
    }
  };

  const handleMaximize = async () => {
    if (window.electron?.ipcRenderer && windowId) {
      await window.electron.ipcRenderer.invoke('standalone-window:maximize', windowId);
    }
  };

  if (pluginId === 'my-plugin') {
    return (
      <div className="standalone-container">
        <Suspense fallback={<div className="plugin-loading"><p>加载中...</p></div>}>
          <MyPlugin
            onClose={handleClose}
            onMinimize={handleMinimize}
            onMaximize={handleMaximize}
          />
        </Suspense>
      </div>
    );
  }

  return <div>Unknown plugin</div>;
}
```

### IPC 通信

插件可以通过 IPC 与主进程通信：

```typescript
// 窗口控制
await window.electron.ipcRenderer.invoke('standalone-window:close', windowId);
await window.electron.ipcRenderer.invoke('standalone-window:minimize', windowId);
await window.electron.ipcRenderer.invoke('standalone-window:maximize', windowId);
await window.electron.ipcRenderer.invoke('standalone-window:is-maximized', windowId);

// 系统功能
await window.electron.ipcRenderer.invoke('SYSTEM_NOTIFICATION', {
  title: '通知标题',
  body: '通知内容'
});

const clipboardText = await window.electron.ipcRenderer.invoke('SYSTEM_CLIPBOARD', {
  type: 'read'
});
```

### ESC 键支持

ESC 键关闭功能由 StandaloneApp 自动处理，插件无需额外实现。

## 样式和主题

### 使用全局 CSS 变量

插件应使用全局 CSS 变量以自动适配主题：

```css
/* MyPlugin.css */
.my-plugin-content {
  background: var(--panel-background);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 24px;
}

.my-plugin-button {
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.my-plugin-button:hover {
  opacity: 0.9;
}
```

### 主题变量

| 变量 | 用途 |
|------|------|
| `--primary-color` | 主色调 |
| `--panel-background` | 面板背景 |
| `--text-primary` | 主文本颜色 |
| `--text-secondary` | 次要文本颜色 |
| `--border-color` | 边框颜色 |
| `--background-hover` | 悬停背景 |

### 独立窗口样式

独立窗口容器样式（已内置）：

```css
/* 全局样式 - src/renderer/styles/global.css */
.standalone-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
}

.my-plugin-standalone {
  width: 100%;
  height: 100%;
  border-radius: 0;
}

.plugin-loading {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: var(--text-primary);
}
```

### 窗口拖拽

标题栏拖拽功能由 `PluginWindow` 组件自动处理，通过 CSS `-webkit-app-region: drag` 实现。插件内容中的交互元素需要设置 `-webkit-app-region: no-drag`。

## API 参考

### Storage Service

存储服务用于保存插件数据：

```typescript
import { storageService } from '../../services/StorageService';

// 保存插件数据
storageService.updatePluginState('my-plugin', {
  customData: {
    lastUsed: Date.now(),
    preferences: { theme: 'dark' }
  }
});

// 读取插件数据
const state = storageService.getPluginState('my-plugin');
const preferences = state?.customData?.preferences;
```

### Electron IPC（桌面模式）

```typescript
// 发送消息到主进程
if (window.electron?.ipcRenderer) {
  window.electron.ipcRenderer.send('channel-name', { data: 'value' });

  // 接收主进程消息
  window.electron.ipcRenderer.on('channel-name', (event, data) => {
    console.log('收到:', data);
  });

  // 调用主进程方法
  const result = await window.electron.ipcRenderer.invoke('channel-name', { param: 'value' });
}
```

### Clipboard API

```typescript
// 复制到剪贴板
await navigator.clipboard.writeText('要复制的文本');

// 从剪贴板读取
const text = await navigator.clipboard.readText();
```

### File System（桌面模式）

```typescript
if (window.electron?.ipcRenderer) {
  // 选择文件
  const result = await window.electron.ipcRenderer.invoke('dialog:openFile', {
    filters: [
      { name: 'Text Files', extensions: ['txt'] }
    ]
  });

  // 保存文件
  await window.electron.ipcRenderer.invoke('dialog:saveFile', {
    defaultPath: 'output.txt'
  });
}
```

## 最佳实践

### 1. 性能优化

```tsx
import React, { useState, useMemo, useCallback } from 'react';

const OptimizedPlugin: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [items, setItems] = useState<string[]>([]);

  // 使用 useMemo 缓存计算结果
  const filteredItems = useMemo(() => {
    return items.filter(item => item.length > 0);
  }, [items]);

  // 使用 useCallback 稳定函数引用
  const handleClick = useCallback((item: string) => {
    console.log('点击:', item);
  }, []);

  return (
    <div>
      {filteredItems.map(item => (
        <button key={item} onClick={() => handleClick(item)}>
          {item}
        </button>
      ))}
    </div>
  );
};
```

### 2. 错误处理

```tsx
const SafePlugin: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [error, setError] = useState<string | null>(null);

  const handleAction = async () => {
    try {
      // 可能出错的操作
      await riskyOperation();
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
      console.error('操作失败:', err);
    }
  };

  if (error) {
    return (
      <div className="error-message">
        <p>❌ {error}</p>
        <button onClick={() => setError(null)}>重试</button>
      </div>
    );
  }

  return <button onClick={handleAction}>执行操作</button>;
};
```

### 3. 可访问性

```tsx
const AccessiblePlugin: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 id="modal-title">插件标题</h2>
        <button
          onClick={onClose}
          aria-label="关闭对话框"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
```

### 4. 国际化

```tsx
const i18n = {
  'zh-CN': {
    title: '我的插件',
    submit: '提交',
    cancel: '取消'
  },
  'en-US': {
    title: 'My Plugin',
    submit: 'Submit',
    cancel: 'Cancel'
  }
};

const I18nPlugin: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [lang, setLang] = useState<'zh-CN' | 'en-US'>('zh-CN');

  const t = i18n[lang];

  return (
    <div>
      <h2>{t.title}</h2>
      <button onClick={() => setLang('zh-CN')}>中文</button>
      <button onClick={() => setLang('en-US')}>English</button>
    </div>
  );
};
```

## 发布插件

### 准备发布

1. **完善 manifest.json**
   ```json
   {
     "id": "com.yourname.plugin",
     "name": "插件名称",
     "version": "1.0.0",
     "description": "详细的插件描述",
     "icon": "🔧",
     "author": "Your Name <your@email.com>",
     "license": "MIT",
     "homepage": "https://github.com/yourname/plugin",
     "repository": "https://github.com/yourname/plugin.git",
     "keywords": ["关键词1", "关键词2"]
   }
   ```

2. **添加 README.md**
   ```markdown
   # 插件名称

   简短描述

   ## 功能特性

   - 功能 1
   - 功能 2

   ## 使用方法

   ...
   ```

3. **添加截图**
   - 添加 `screenshot.png` 展示插件界面
   - 建议尺寸: 800x600

### 版本管理

遵循 [Semantic Versioning](https://semver.org/)：

- `MAJOR.MINOR.PATCH`
- MAJOR: 不兼容的 API 变更
- MINOR: 向下兼容的功能新增
- PATCH: 向下兼容的问题修复

示例：
```
1.0.0 → 1.0.1 (修复 bug)
1.0.1 → 1.1.0 (新增功能)
1.1.0 → 2.0.0 (破坏性变更)
```

## 示例插件

### JSON 工具插件（独立窗口版本）

完整的 JSON 工具实现，使用独立窗口：

```tsx
import React, { useState } from 'react';
import PluginWindow from '../PluginWindow/PluginWindow';
import { storageService } from '../../services/StorageService';

interface JSONToolProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

const JSONTool: React.FC<JSONToolProps> = ({
  onClose,
  onMinimize,
  onMaximize
}) => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'format' | 'minify' | 'escape'>('format');

  // 从存储恢复上次输入
  React.useEffect(() => {
    const state = storageService.getPluginState('json-tool');
    if (state?.customData?.lastInput) {
      setInput(state.customData.lastInput);
    }
  }, []);

  const processJSON = () => {
    try {
      const parsed = JSON.parse(input);

      let result = '';
      switch (mode) {
        case 'format':
          result = JSON.stringify(parsed, null, 2);
          break;
        case 'minify':
          result = JSON.stringify(parsed);
          break;
        case 'escape':
          result = JSON.stringify(parsed)
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"');
          break;
      }

      setOutput(result);

      // 保存到历史
      storageService.updatePluginState('json-tool', {
        customData: { lastInput: input }
      });
    } catch (err) {
      setOutput(`❌ JSON 解析错误: ${err instanceof Error ? err.message : err}`);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(output);
  };

  return (
    <PluginWindow
      title="JSON 工具"
      icon="📋"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      className="json-tool-standalone"
      pluginId="json-tool"
      showStandaloneButton={false}
    >
      <div className="json-tool-content">
        <div className="mode-selector">
          <button
            className={mode === 'format' ? 'active' : ''}
            onClick={() => setMode('format')}
          >
            格式化
          </button>
          <button
            className={mode === 'minify' ? 'active' : ''}
            onClick={() => setMode('minify')}
          >
            压缩
          </button>
          <button
            className={mode === 'escape' ? 'active' : ''}
            onClick={() => setMode('escape')}
          >
            转义
          </button>
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入 JSON..."
          className="input-area"
        />

        <div className="action-buttons">
          <button onClick={processJSON} className="process-button">
            处理
          </button>
          {output && (
            <button onClick={copyToClipboard} className="copy-button">
              复制结果
            </button>
          )}
        </div>

        <textarea
          value={output}
          readOnly
          className="output-area"
          placeholder="处理结果将显示在这里..."
        />
      </div>
    </PluginWindow>
  );
};

export default JSONTool;
```

```css
/* JSONTool.css */
.json-tool-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  height: 100%;
}

.mode-selector {
  display: flex;
  gap: 8px;
}

.mode-selector button {
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  background: var(--panel-background);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-selector button.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.input-area,
.output-area {
  width: 100%;
  flex: 1;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  resize: none;
  background: var(--panel-background);
  color: var(--text-primary);
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.process-button,
.copy-button {
  padding: 12px 24px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: opacity 0.2s;
}

.process-button:hover,
.copy-button:hover {
  opacity: 0.9;
}

.copy-button {
  background: var(--text-secondary);
}
```

## 常见问题

### Q: 如何调试插件？

A:
1. 在开发模式下运行应用
2. 打开开发者工具 (Ctrl+Shift+I / Cmd+Option+I)
3. 在 Console 中查看日志
4. 使用 React DevTools 查看组件状态

### Q: 插件可以使用第三方库吗？

A:
- **内置插件**: 可以在 `package.json` 中添加依赖
- **外部插件**: 计划中支持

### Q: 如何处理大文件？

A:
1. 使用 Web Worker 进行后台处理
2. 实现进度显示
3. 支持取消操作

```tsx
const [progress, setProgress] = useState(0);

const handleLargeFile = async (file: File) => {
  const worker = new Worker('./worker.js');

  worker.postMessage({ file });
  worker.onmessage = (e) => {
    if (e.data.progress !== undefined) {
      setProgress(e.data.progress);
    }
    if (e.data.done) {
      worker.terminate();
    }
  };
};
```

### Q: 如何实现撤销/重做？

A:
```tsx
const [history, setHistory] = useState<string[]>([]);
const [currentIndex, setCurrentIndex] = useState(-1);

const undo = () => {
  if (currentIndex > 0) {
    setCurrentIndex(currentIndex - 1);
    setValue(history[currentIndex - 1]);
  }
};

const redo = () => {
  if (currentIndex < history.length - 1) {
    setCurrentIndex(currentIndex + 1);
    setValue(history[currentIndex + 1]);
  }
};
```

## 更多资源

- [Electron 文档](https://www.electronjs.org/docs)
- [React 文档](https://react.dev)
- [TypeScript 文档](https://www.typescriptlang.org/docs)
- [项目 GitHub](https://github.com/yourusername/desktop-tool)

---

如有问题，请提交 [Issue](https://github.com/yourusername/desktop-tool/issues)
