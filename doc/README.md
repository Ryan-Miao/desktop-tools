# Desktop Tool

> 一个类似 uTools 的跨平台桌面工具平台，基于 Electron + React + TypeScript 构建。

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/yourusername/desktop-tool)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![Node](https://img.shields.io/badge/node-%3E=18.0.0-brightgreen.svg)](https://nodejs.org)
[![Electron](https://img.shields.io/badge/electron-28.3.3-9FE349.svg)](https://electronjs.org)

## 目录

- [特性](#-特性)
- [内置工具](#-内置工具)
- [快速开始](#-快速开始)
- [项目结构](#-项目结构)
- [主题系统](#-主题系统)
- [插件开发](#-插件开发)
- [统计功能](#-统计功能)
- [数据备份](#-数据备份)
- [性能优化](#-性能优化)
- [常见问题](#-常见问题)
- [贡献指南](#-贡献指南)
- [许可证](#-许可证)

## 特性

### 核心功能

- 🎨 **精美界面** - Mac 风格毛玻璃效果，流畅动画，8 种预设主题
- 🔌 **插件系统** - 可扩展的插件架构，独立窗口，完整窗口控制
- ⏰ **悬浮时钟** - 桌面悬浮时钟，久坐提醒， productivity tracking
- 📊 **统计报表** - 键盘鼠标使用统计，Chart.js 数据可视化
- 💾 **数据备份** - 支持全量备份和恢复，ZIP 格式
- 🌐 **双模式** - 支持 Electron 桌面应用和 Web 应用

### 插件窗口特性

- 🖥️ **独立窗口** - 每个插件在独立的 Electron BrowserWindow 中运行
- 🎯 **完整控制** - 支持最小化、最大化、关闭，ESC 键快速关闭
- 🎨 **自定义标题栏** - 无原生菜单栏，完全自定义的窗口控制
- 🖱️ **自由拖拽** - 窗口可独立拖拽移动，不受主面板限制
- 💾 **状态持久化** - 自动保存窗口位置、大小、最大化状态
- 🔄 **多窗口支持** - 同时打开多个插件窗口，独立操作

### 技术亮点

- ⚡ **高性能** - 优化的事件监听，智能缓存机制
- 🔒 **类型安全** - 完整的 TypeScript 类型定义
- 📦 **模块化** - 清晰的代码结构，易于维护
- 🛡️ **数据持久化** - SQLite 数据库 + localStorage
- 🎯 **响应式** - 支持 DPI 缩放，适配高分屏

## 内置工具

### 文本处理

| 工具 | 功能 |
|------|------|
| **JSON 工具** | JSON 序列化、压缩、转义、与 Excel 互转 |
| **Markdown 编辑器** | 实时预览、支持 GFM、导出 HTML |
| **正则表达式测试器** | 常用正则库、实时测试匹配 |
| **代码格式化工具** | JSON/XML/SQL/HTML 格式化 |

### 编码转换

| 工具 | 功能 |
|------|------|
| **Base64 编码** | Base64 编码和解码工具 |
| **加密解密工具** | AES/DES/Rabbit 加密、Hash 计算（MD5/SHA1/SHA256/SHA512） |

### 生成工具

| 工具 | 功能 |
|------|------|
| **UUID 生成器** | 批量生成 UUID v4 |
| **二维码生成器** | 生成各种类型的二维码（WiFi、网址、邮件、电话、短信、名片） |

### 转换工具

| 工具 | 功能 |
|------|------|
| **时间戳转换器** | Unix 时间戳与日期时间互转 |
| **单位转换器** | 长度、重量、温度、面积、体积、时间单位转换 |
| **汇率转换器** | 支持 20+ 种货币实时转换 |

### 实用工具

| 工具 | 功能 |
|------|------|
| **IP 地址查询** | 查询 IP 地址位置、运营商等信息 |
| **图片压缩工具** | 批量压缩图片，支持拖拽 |
| **颜色选择器** | 颜色选择和格式转换工具 |

## 快速开始

### 环境要求

- **Node.js**: >= 18.0.0 < 21.0.0
- **包管理器**: npm / yarn / pnpm
- **操作系统**: Windows 10+ / macOS 10.15+ / Linux (Ubuntu 20.04+)

### 安装

```bash
# 克隆仓库
git clone https://github.com/yourusername/desktop-tool.git
cd desktop-tool

# 安装依赖
npm install
```

### 开发

```bash
# Electron 桌面应用开发模式
npm run dev

# Web 应用开发模式
npm run dev:web
```

访问 http://localhost:5173 查看 Web 应用。

### 构建

```bash
# 构建 Electron 应用
npm run build:electron

# 构建 Web 应用
npm run build:web
npm run dist:web  # 构建并复制到 dist-web 目录
```

### 打包

```bash
# 打包当前平台
npm run dist

# Windows 平台
npm run dist:win

# macOS 平台
npm run dist:mac

# Linux 平台
npm run dist:linux
```

打包后的文件位于 `release/` 目录。

## 项目结构

```
desktop-tool/
├── src/
│   ├── main/                    # Electron 主进程
│   │   ├── index.ts             # 主进程入口
│   │   ├── ipc/                 # IPC 通信处理
│   │   │   └── handlers.ts      # IPC 处理器
│   │   ├── windows/             # 窗口管理
│   │   │   └── manager.ts       # 窗口管理器
│   │   ├── database/            # SQLite 数据库
│   │   │   └── index.ts         # 数据库服务
│   │   ├── plugins/             # 插件管理
│   │   │   └── manager.ts       # 插件管理器
│   │   └── services/            # 后台服务
│   │       └── InputMonitor.ts  # 输入监控服务
│   ├── preload/                 # 预加载脚本
│   │   └── index.ts             # 预加载入口
│   ├── renderer/                # React 渲染进程
│   │   ├── main.tsx             # React 入口
│   │   ├── App.tsx              # 主应用组件
│   │   ├── components/          # React 组件
│   │   │   ├── SearchBox.tsx    # 搜索框
│   │   │   ├── PluginList.tsx   # 插件列表
│   │   │   ├── WindowControls.tsx # 窗口控制
│   │   │   └── ...              # 其他组件
│   │   ├── services/            # 前端服务
│   │   │   ├── StorageService.ts    # 存储服务
│   │   │   └── InputEventTracker.ts # 事件跟踪
│   │   └── themes/              # 主题配置
│   │       └── themes.ts        # 主题定义
│   └── shared/                  # 共享代码
│       ├── types/               # TypeScript 类型定义
│       └── constants/           # 常量定义
├── plugins/                     # 插件目录
│   ├── json-tool/               # JSON 工具插件
│   ├── base64-tool/             # Base64 工具插件
│   └── ...                      # 其他插件
├── build/                       # 打包资源
│   ├── icon.ico                 # Windows 图标
│   ├── icon.icns                # macOS 图标
│   └── icon.png                 # Linux 图标
├── dist/                        # 构建输出
├── dist-web/                    # Web 应用输出
├── release/                     # Electron 打包输出
├── package.json                 # 项目配置
├── tsconfig.json                # TypeScript 配置
├── vite.config.ts               # Vite 构建配置
├── electron-builder.yml         # Electron 打包配置
└── README.md                    # 项目说明
```

## 主题系统

支持 8 种预设主题：

### 浅色主题

| 主题 | 预览 |
|------|------|
| **Light Blue** | 🎨 默认蓝色主题 |
| **Light Purple** | 🎨 优雅紫色主题 |
| **Light Green** | 🎨 清新绿色主题 |
| **Light Orange** | 🎨 温暖橙色主题 |

### 深色主题

| 主题 | 预览 |
|------|------|
| **Dark Blue** | 🎨 深邃蓝色主题 |
| **Dark Purple** | 🎨 神秘紫色主题 |
| **Dark Green** | 🎨 护眼绿色主题 |
| **Dark Orange** | 🎨 沉稳橙色主题 |

### 自定义主题

可以通过修改 `src/renderer/themes/themes.ts` 添加自定义主题：

```typescript
{
  id: 'custom-theme',
  name: '自定义主题',
  mode: 'light', // or 'dark'
  colors: {
    primary: '#YOUR_COLOR',
    background: 'rgba(255, 255, 255, 0.8)',
    // ... 其他颜色
  }
}
```

## 插件开发

### 插件特性

插件在独立的 Electron BrowserWindow 中运行，具备以下特性：

- ✅ **独立窗口** - 完整的窗口控制（最小化、最大化、关闭）
- ✅ **自定义标题栏** - 无原生菜单栏，使用 PluginWindow 组件
- ✅ **拖拽支持** - 标题栏可拖拽移动窗口
- ✅ **ESC 关闭** - 按 ESC 键快速关闭窗口
- ✅ **状态持久化** - 自动保存和恢复窗口状态
- ✅ **主题适配** - 自动适配应用主题（浅色/深色）

### 插件结构

```
src/renderer/components/
└── YourPlugin/
    ├── YourPlugin.tsx        # 插件主组件
    ├── YourPlugin.css        # 插件样式（可选）
    └── index.ts              # 导出文件
```

### 插件组件示例

```tsx
import React, { useState } from 'react';
import PluginWindow from '../PluginWindow/PluginWindow';
import './YourPlugin.css';

interface YourPluginProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

const YourPlugin: React.FC<YourPluginProps> = ({
  onClose,
  onMinimize,
  onMaximize
}) => {
  const [value, setValue] = useState('');

  return (
    <PluginWindow
      title="你的插件"
      icon="🔧"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      className="your-plugin-standalone"
      pluginId="your-plugin"
      showStandaloneButton={false}
    >
      <div className="your-plugin-content">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="输入内容..."
        />
      </div>
    </PluginWindow>
  );
};

export default YourPlugin;
```

### 注册插件

在 `src/renderer/App.tsx` 和 `src/renderer/StandaloneApp.tsx` 中注册：

**App.tsx (添加到插件列表):**
```tsx
const plugins: Plugin[] = [
  // ... 其他插件
  {
    id: 'your-plugin',
    name: '你的插件',
    description: '插件描述',
    icon: '🔧'
  }
];
```

**StandaloneApp.tsx (添加渲染逻辑):**
```tsx
import YourPlugin from './components/YourPlugin';

// 在组件中添加
if (pluginId === 'your-plugin') {
  return (
    <div className="standalone-container">
      <Suspense fallback={<div className="plugin-loading"><p>加载中...</p></div>}>
        <YourPlugin
          onClose={handleClose}
          onMinimize={handleMinimize}
          onMaximize={handleMaximize}
        />
      </Suspense>
    </div>
  );
}
```

详细插件开发指南请查看 [PLUGIN_DEVELOPMENT.md](./PLUGIN_DEVELOPMENT.md)

## 统计功能

### 功能特性

- ⌨️ **键盘统计** - 记录键盘按键次数
- 🖱️ **鼠标统计** - 记录鼠标点击次数和移动距离
- ⏱️ **工作时长** - 统计有效工作时间
- 💪 **工作评价** - 基于活动量的健康评价系统

### 数据可视化

使用 Chart.js 绘制统计图表：
- 折线图 - 趋势分析
- 柱状图 - 对比分析
- 饼图 - 分布分析

### 数据导出

支持导出为 CSV 格式，便于进一步分析。

## 数据备份

### 备份内容

- SQLite 数据库（统计数据、设置等）
- localStorage 数据（插件状态、用户偏好等）

### 备份方式

1. **手动备份** - 设置 → 数据备份 → 立即备份
2. **自动备份** - 可设置每日自动备份（计划功能）

### 恢复流程

1. 点击"选择备份文件"
2. 选择 ZIP 备份文件
3. 确认恢复
4. 重启应用

## 性能优化

### 已实现的优化

1. **事件监听优化**
   - 鼠标移动事件节流（每 10 帧更新一次）
   - IPC 通信节流（1 秒间隔）

2. **存储优化**
   - localStorage 数据缓存（1 秒缓存期）
   - SQLite 预编译语句

3. **渲染优化**
   - React useMemo 优化计算
   - useCallback 稳定函数引用
   - 组件懒加载（按需）

4. **内存管理**
   - 及时清理事件监听器
   - 正确使用 useEffect cleanup
   - 避免内存泄漏

### 性能指标

- 启动时间: < 2 秒
- 内存占用: < 200 MB
- CPU 占用: 空闲时 < 1%

## 常见问题

### 安装问题

**Q: npm install 失败？**

A: 尝试以下方案：
```bash
# 清除缓存
npm cache clean --force

# 使用国内镜像
npm install --registry=https://registry.npmmirror.com

# 或使用 pnpm
pnpm install
```

**Q: better-sqlite3 编译失败？**

A: 确保安装了构建工具：
- Windows: 安装 Visual Studio Build Tools
- macOS: `xcode-select --install`
- Linux: `sudo apt-get install build-essential`

### 运行问题

**Q: 应用白屏？**

A: 检查：
1. 开发者工具是否有错误
2. 端口 5173 是否被占用
3. 尝试清除缓存：`rm -rf node_modules dist && npm install`

**Q: 插件不显示？**

A: 确保：
1. manifest.json 格式正确
2. 插件已在 App.tsx 中注册
3. 检查是否被禁用（设置 → 插件管理）

### 打包问题

**Q: 打包失败？**

A: 检查：
1. `npm run build` 是否成功
2. electron-builder.yml 配置是否正确
3. 系统是否安装了对应平台的打包工具

**Q: 打包后应用无法启动？**

A: 检查：
1. package.json 的 main 路径是否正确
2. 是否有相对路径问题（使用 __dirname）
3. 查看日志文件了解详细错误

## 贡献指南

欢迎贡献代码、报告问题或提出建议！

### 贡献流程

1. Fork 本仓库
2. 创建特性分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add some amazing feature'`
4. 推送分支: `git push origin feature/amazing-feature`
5. 提交 Pull Request

### 代码规范

- 使用 TypeScript 编写
- 遵循 ESLint 规则
- 添加必要的注释
- 编写单元测试（计划中）

### Commit 规范

遵循 Conventional Commits：

```
feat: 添加新功能
fix: 修复 Bug
docs: 更新文档
style: 代码格式调整
refactor: 代码重构
perf: 性能优化
test: 添加测试
chore: 构建/工具链更新
```

## 路线图

- [x] 基础插件系统
- [x] 统计功能
- [x] 数据备份
- [ ] 在线插件市场
- [ ] 离线插件加载
- [ ] 自动更新功能
- [ ] 云同步功能
- [ ] 账户系统
- [ ] 插件开发工具
- [ ] 更多内置插件

## 许可证

本项目采用 [MIT](./LICENSE) 许可证。

## 致谢

- [Electron](https://electronjs.org) - 跨平台桌面应用框架
- [React](https://reactjs.org) - UI 框架
- [Vite](https://vitejs.dev) - 构建工具
- [Ant Design](https://ant.design) - UI 组件库
- [uTools](https://u.tools) - 设计灵感来源

## 联系方式

- GitHub Issues: [提交问题](https://github.com/yourusername/desktop-tool/issues)
- Email: your@email.com

---

⭐ 如果这个项目对你有帮助，请给个 Star！

Made with ❤️ by [Your Name]
