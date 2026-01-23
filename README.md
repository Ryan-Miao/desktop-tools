# Desktop Tool

> 类似 uTools 的跨平台桌面工具平台，让工具开发更简单

![GitHub release](https://img.shields.io/github/v/release/Ryan-Miao/desktop-tools)
![License](https://img.shields.io/github/license/Ryan-Miao/desktop-tools)
![Node version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![Electron](https://img.shields.io/badge/electron-28.3.3-9FE349)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)

## 📸 项目截图

![主界面](doc/img/1.png)
_主界面 - 展示所有可用插件_

![插件运行](doc/img/2.png)
_独立窗口运行插件_

![主题系统](doc/img/3.png)
_18+ 预设主题支持_

![性能监控](doc/img/4.png)
_实时性能监控面板_

## 📖 目录

- [✨ 核心特性](#-核心特性)
- [🎯 为什么选择 Desktop Tool](#-为什么选择-desktop-tool)
- [🛠️ 技术栈](#️-技术栈)
- [📦 安装](#-安装)
- [🚀 快速开始](#-快速开始)
- [📚 文档](#-文档)
- [🔌 内置插件](#-内置插件)
- [🤝 贡献](#-贡献)
- [🗺️ 路线图](#️-路线图)
- [❓ 常见问题](#-常见问题)
- [📄 许可证](#-许可证)

## ✨ 核心特性

### 🧩 插件系统

- **独立窗口架构** - 每个插件在独立的 Electron BrowserWindow 中运行
- **完整窗口控制** - 支持最小化、最大化、关闭，ESC 快捷关闭
- **状态持久化** - 自动保存和恢复窗口状态及插件数据
- **可扩展设计** - 轻松开发和集成新插件

### 💾 数据管理

- **全量备份** - 一键备份所有插件数据和设置
- **选择性备份** - 选择特定插件进行备份
- **数据预览** - 备份前预览内容，确保数据安全
- **ZIP 格式** - 标准压缩格式，易于管理和迁移

### ⚡ 性能监控

- **实时监控面板** - CPU、内存、FPS 实时显示
- **历史数据记录** - 性能数据历史趋势分析
- **优化建议** - 根据监控数据提供性能优化建议

### 🎨 主题系统

- **18+ 预设主题** - 涵盖浅色、深色、高对比度主题
- **CSS 变量驱动** - 易于自定义和扩展
- **系统主题同步** - 支持自动切换系统主题

### 🔄 事件总线

- **组件间通信** - 渲染进程组件间高效通信机制
- **解耦设计** - 无需 IPC 即可实现组件交互
- **类型安全** - 完整的 TypeScript 类型定义

## 🎯 为什么选择 Desktop Tool

- 🚀 **开发简单** - 基于 React + TypeScript，插件开发如虎添翼
- 🔧 **高度可定制** - 主题、窗口、数据存储全方位可定制
- 📦 **开箱即用** - 内置 8+ 实用插件，满足日常需求
- 🛡️ **数据安全** - 本地存储，支持备份，数据完全掌控
- 🌍 **跨平台** - Windows、macOS、Linux 全平台支持

## 🛠️ 技术栈

- **框架**: [Electron](https://electronjs.org/) + [React](https://reactjs.org/)
- **语言**: [TypeScript](https://www.typescriptlang.org/)
- **构建工具**: [Vite](https://vitejs.dev/)
- **数据库**: [@vscode/sqlite3](https://code.visualstudio.com/)
- **测试**: [Vitest](https://vitest.dev/)
- **样式**: CSS Variables (主题系统)

## 📦 安装

### 前置要求

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0

### 从源码运行

```bash
# 1. 克隆仓库
git clone https://github.com/Ryan-Miao/desktop-tools.git
cd desktop-tools

# 2. 安装依赖
npm install

# 3. 启动开发模式
npm run dev
```

### 构建桌面应用

```bash
# 构建当前平台
npm run dist

# Windows
npm run dist:win

# macOS
npm run dist:mac

# Linux
npm run dist:linux
```

构建产物位于 `release/` 目录。

## 🚀 快速开始

### 开发模式

```bash
# Electron 桌面应用
npm run dev

# Web 应用
npm run dev:web
```

### 测试

```bash
# 运行测试
npm test

# 覆盖率报告
npm run test:coverage

# 测试 UI
npm run test:ui
```

### 代码检查

```bash
# 类型检查
npm run type-check

# 代码规范检查
npm run lint
```

## 📚 文档

- **项目详细文档**: [doc/README.md](doc/README.md)
- **插件开发指南**: [doc/PLUGIN_DEVELOPMENT.md](doc/PLUGIN_DEVELOPMENT.md)
- **AI 开发规范**: [CLAUDE.md](CLAUDE.md)
- **完整规范**: [aidoc/ai-guide.md](aidoc/ai-guide.md)

## 🔌 内置插件

| 插件        | 功能          | 状态 |
| ----------- | ------------- | ---- |
| 🔢 计算器   | 基础计算功能  | ✅   |
| ✅ TodoList | 任务管理      | ✅   |
| 📝 Notepad  | 笔记工具      | ✅   |
| 🔤 Base64   | 编码/解码     | ✅   |
| 🔐 Crypto   | 加密/解密     | ✅   |
| 👁️ OCR      | 图片文字识别  | ✅   |
| 🔑 Password | 密码生成      | ✅   |
| 🔗 URL      | URL 编码/解码 | ✅   |

## 🤝 贡献

欢迎贡献代码、报告问题或提出建议！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

请遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范。

### 开发规范

- 使用 TypeScript 编写代码
- 遵循 ESLint 规则
- 所有样式必须使用 CSS 变量以支持主题切换
- 避免使用原生 confirm/alert，使用内联确认 + Toast 通知

## 🗺️ 路线图

- [x] 基础插件系统架构
- [x] 主题系统（18+ 主题）
- [x] 数据备份功能
- [x] 性能监控
- [x] 插件管理器
- [ ] 更多内置插件
- [ ] 在线插件市场（计划中）
- [ ] 外部插件加载（计划中）
- [ ] 云同步功能（计划中）

## ❓ 常见问题

### Q: 如何开发自己的插件？

A: 请查看 [插件开发指南](doc/PLUGIN_DEVELOPMENT.md) 了解详细步骤。

### Q: 支持哪些操作系统？

A: 支持 Windows 10+、macOS 10.15+、Linux (Ubuntu 20.04+)。

### Q: 数据存储在哪里？

A: 所有数据存储在本地，位于：

- Windows: `%APPDATA%/desktop-tool/`
- macOS: `~/Library/Application Support/desktop-tool/`
- Linux: `~/.config/desktop-tool/`

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证。

## 🙏 致谢

- [Electron](https://electronjs.org) - 跨平台桌面应用框架
- [React](https://reactjs.org) - UI 框架
- [Vite](https://vitejs.dev) - 构建工具
- [uTools](https://u.tools) - 设计灵感来源

---

⭐ 如果这个项目对你有帮助，请给个 Star！

Made with ❤️ by [Ryan Miao](https://github.com/Ryan-Miao)
