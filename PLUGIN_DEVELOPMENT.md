# 插件开发指南

本指南将帮助你为 Desktop Tool 开发插件。

## 目录

- [插件概述](#插件概述)
- [快速开始](#快速开始)
- [插件结构](#插件结构)
- [Manifest 配置](#manifest-配置)
- [插件组件](#插件组件)
- [API 参考](#api-参考)
- [最佳实践](#最佳实践)
- [发布插件](#发布插件)
- [示例插件](#示例插件)

## 插件概述

Desktop Tool 采用基于 React 组件的插件系统。每个插件都是一个独立的 React 组件，可以访问应用的主题、存储服务等功能。

### 插件类型

1. **内置插件** - 随应用一起发布的插件
2. **外部插件** - 用户安装的第三方插件（计划中）

## 快速开始

### 创建一个简单的插件

```bash
# 1. 在 plugins 目录创建插件文件夹
mkdir plugins/my-plugin
cd plugins/my-plugin

# 2. 创建 manifest.json
cat > manifest.json << EOF
{
  "id": "com.desktop-tool.my-plugin",
  "name": "我的插件",
  "version": "1.0.0",
  "description": "我的第一个插件",
  "icon": "🚀",
  "author": "Your Name",
  "license": "MIT",
  "category": "utilities"
}
EOF
```

## 插件结构

### 标准结构

```
plugins/
└── my-plugin/
    ├── manifest.json           # 插件清单（必需）
    ├── index.tsx              # 插件组件（可选，内置插件）
    ├── styles.css             # 样式文件（可选）
    └── assets/                # 资源文件（可选）
        ├── icon.png
        └── screenshot.png
```

### 内置 vs 外部插件

| 特性 | 内置插件 | 外部插件 |
|------|---------|---------|
| 位置 | `src/renderer/components/` | `plugins/` |
| 组件 | React 组件 | manifest.json + 代码 |
| 热更新 | 支持 | 计划中 |
| 权限 | 完整 | 受限（计划） |

## Manifest 配置

### 完整配置示例

```json
{
  "id": "com.desktop-tool.example",
  "name": "示例插件",
  "version": "1.0.0",
  "description": "这是一个示例插件",
  "icon": "🔧",
  "author": "Your Name",
  "license": "MIT",
  "homepage": "https://github.com/yourusername/example-plugin",
  "repository": "https://github.com/yourusername/example-plugin",
  "keywords": ["工具", "实用", "示例"],
  "category": "utilities",
  "enabled": true,
  "minAppVersion": "1.0.0",
  "permissions": [
    "storage",
    "clipboard",
    "network"
  ]
}
```

### 配置字段说明

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `id` | string | ✅ | 唯一标识符，建议使用反向域名格式 |
| `name` | string | ✅ | 插件名称 |
| `version` | string | ✅ | 版本号，遵循 semver 规范 |
| `description` | string | ✅ | 插件描述 |
| `icon` | string | ✅ | 插件图标（emoji 或文件名） |
| `author` | string | ✅ | 作者名称 |
| `license` | string | ❌ | 许可证 |
| `homepage` | string | ❌ | 主页 URL |
| `repository` | string | ❌ | 仓库 URL |
| `keywords` | string[] | ❌ | 关键词列表 |
| `category` | string | ❌ | 分类 |
| `enabled` | boolean | ❌ | 是否启用（默认 true） |
| `minAppVersion` | string | ❌ | 最低应用版本要求 |
| `permissions` | string[] | ❌ | 权限列表 |

### 分类列表

- `utilities` - 实用工具
- `development` - 开发工具
- `text` - 文本处理
- `converter` - 转换工具
- `generator` - 生成工具
- `media` - 多媒体
- `system` - 系统工具

## 插件组件

### 基础组件

```tsx
import React, { useState } from 'react';
import { storageService } from '../../services/StorageService';

interface MyPluginProps {
  onClose: () => void;
}

const MyPlugin: React.FC<MyPluginProps> = ({ onClose }) => {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    // 处理逻辑
    console.log('提交:', value);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>我的插件</h2>
          <button onClick={onClose} className="close-button">✕</button>
        </div>
        <div className="modal-body">
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
      </div>
    </div>
  );
};

export default MyPlugin;
```

### 样式指南

使用全局 CSS 变量以适配主题：

```css
/* styles.css */
.my-plugin-container {
  background: var(--modal-background);
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
| `--modal-background` | 模态框背景 |
| `--text-primary` | 主文本颜色 |
| `--text-secondary` | 次要文本颜色 |
| `--border-color` | 边框颜色 |
| `--background-hover` | 悬停背景 |

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

### JSON 工具插件

完整的 JSON 工具实现：

```tsx
import React, { useState } from 'react';
import { storageService } from '../../services/StorageService';

const JSONTool: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'format' | 'minify' | 'escape'>('format');

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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content json-tool" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>JSON 工具</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
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

          <button onClick={processJSON} className="process-button">
            处理
          </button>

          <textarea
            value={output}
            readOnly
            className="output-area"
          />
        </div>
      </div>
    </div>
  );
};

export default JSONTool;
```

```css
/* styles.css */
.json-tool {
  max-width: 800px;
  width: 90vw;
}

.mode-selector {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.mode-selector button {
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  background: rgba(255, 255, 255, 0.5);
  border-radius: 6px;
  cursor: pointer;
}

.mode-selector button.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.input-area,
.output-area {
  width: 100%;
  min-height: 200px;
  margin: 8px 0;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  resize: vertical;
}

.process-button {
  width: 100%;
  padding: 12px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
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
