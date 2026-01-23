# Desktop Tool - 项目详细文档

> 类似 uTools 的跨平台桌面工具平台，基于 Electron + React + TypeScript 构建。

## 目录

- [系统架构](#系统架构)
- [核心功能](#核心功能)
- [插件系统](#插件系统)
- [主题系统](#主题系统)
- [数据持久化](#数据持久化)
- [开发指南](#开发指南)

---

## 系统架构

### 整体架构

```
┌─────────────────────────────────────────────────────┐
│                   Electron 主进程                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Window   │  │   IPC    │  │   Database       │  │
│  │ Manager  │  │ Handlers │  │   Service        │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Plugin   │  │ Backup   │  │   Event          │  │
│  │ Manager  │  │ Service  │  │   Bus            │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────┘
                         │
                    IPC 通信
                         │
┌─────────────────────────────────────────────────────┐
│                   React 渲染进程                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │   App    │  │ Plugin   │  │  Plugin Window   │  │
│  │ Component│  │  List    │  │  (独立窗口)       │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Settings │  │  Backup  │  │  Theme Manager   │  │
│  │  Panel   │  │  Panel   │  │                  │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### 目录结构

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
│   │       ├── BackupService.ts # 备份服务
│   │       └── LogService.ts    # 日志服务
│   ├── preload/                 # 预加载脚本
│   │   └── index.ts             # 预加载入口
│   ├── renderer/                # React 渲染进程
│   │   ├── main.tsx             # React 入口
│   │   ├── App.tsx              # 主应用组件
│   │   ├── components/          # React 组件
│   │   ├── services/            # 前端服务
│   │   ├── utils/               # 工具函数
│   │   └── themes/              # 主题配置
│   └── shared/                  # 共享代码
│       ├── types/               # TypeScript 类型定义
│       ├── constants/           # 常量定义
│       └── logger/              # 日志系统
├── plugins/                     # 外部插件目录
├── build/                       # 打包资源
├── dist/                        # 构建输出
└── release/                     # Electron 打包输出
```

---

## 核心功能

### 1. 插件系统

- **独立窗口架构** - 每个插件在独立的 Electron BrowserWindow 中运行
- **完整窗口控制** - 支持最小化、最大化、关闭，ESC 键快速关闭
- **自定义标题栏** - 无原生菜单栏，完全自定义的窗口控制
- **状态持久化** - 自动保存和恢复窗口状态

### 2. 数据备份

- **全量备份** - 备份所有插件数据和设置
- **选择性备份** - 选择特定插件进行备份
- **数据预览** - 备份前预览内容
- **ZIP 格式** - 标准压缩格式，易于管理

### 3. 性能监控

- **实时监控** - CPU、内存、FPS 实时显示
- **历史记录** - 性能数据历史趋势
- **优化建议** - 根据监控数据提供优化建议

### 4. 主题系统

- **18+ 预设主题** - 浅色、深色、高对比度主题
- **CSS 变量驱动** - 易于自定义和扩展
- **自动适配** - 支持系统主题切换

---

## 插件系统

### 插件架构

```
用户点击插件
    ↓
App.tsx: handlePluginClick()
    ↓
IPC: plugin:open-standalone
    ↓
WindowManager: createPluginWindow()
    ↓
创建独立 Electron BrowserWindow
    ↓
加载独立窗口路由 (#plugin-standalone/{pluginId})
    ↓
StandaloneApp.tsx: 渲染插件
    ↓
插件使用 PluginWindow 包装
    ↓
显示独立窗口
```

### 插件生命周期

1. **注册** - 在 `App.tsx` 中注册插件元数据
2. **启动** - 用户点击图标，创建独立窗口
3. **运行** - 插件在独立窗口中运行
4. **关闭** - 用户关闭窗口或按 ESC
5. **状态保存** - 自动保存窗口状态和插件数据

### 已实现的插件

| 插件               | 功能          | 状态 |
| ------------------ | ------------- | ---- |
| 计算器             | 基础计算功能  | ✅   |
| TodoList           | 任务管理      | ✅   |
| Notepad            | 笔记工具      | ✅   |
| Base64 Tool        | 编码/解码     | ✅   |
| Crypto Tool        | 加密/解密     | ✅   |
| OCR Tool           | 图片文字识别  | ✅   |
| Password Generator | 密码生成      | ✅   |
| URL Codec          | URL 编码/解码 | ✅   |

详细插件开发指南：[PLUGIN_DEVELOPMENT.md](PLUGIN_DEVELOPMENT.md)

---

## 主题系统

### 主题分类

#### 浅色主题

- Light Blue, Light Purple, Light Pink, Light Green, Light Orange, Light Teal

#### 深色主题

- Dark Ocean, Dark Purple, Dark Forest, Dark Sunset, Dark Midnight, Dark Slate
- Cyberpunk, Sunset Gradient, Northern Lights, Rose Gold, Ocean Depth

#### 高对比度主题

- 深邃黑, 纯粹白, 赛博紫, 日落橙

### 主题定制

通过 CSS 变量实现主题切换：

```css
:root {
  --primary-color: #4a90e2;
  --panel-background: rgba(255, 255, 255, 0.8);
  --text-primary: #0a0a0a;
  /* 更多变量... */
}
```

---

## 数据持久化

### SQLite 数据库

**表结构**：

- `clock_settings` - 时钟设置
- `keyboard_stats` - 键盘统计
- `mouse_click_stats` - 鼠标点击统计
- `mouse_move_stats` - 鼠标移动统计
- `plugin_data` - 插件数据

### localStorage

**用途**：

- 用户偏好设置
- 主题选择
- 面板透明度
- 其他 UI 状态

### 数据备份流程

1. **收集数据** - 从数据库和 localStorage 收集数据
2. **创建临时目录** - 在系统临时目录创建工作区
3. **组织文件** - 按类型组织数据文件
4. **创建 manifest** - 生成备份元数据
5. **压缩 ZIP** - 使用 archiver 压缩
6. **保存文件** - 通过对话框保存到用户指定位置

---

## 开发指南

### 环境要求

- Node.js >= 18.0.0
- npm / yarn / pnpm

### 安装运行

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# Web 应用开发模式
npm run dev:web

# 构建
npm run build

# 打包
npm run dist
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

# Lint
npm run lint
```

---

## 相关文档

- **AI 开发规范**: [../CLAUDE.md](../CLAUDE.md)
- **插件开发**: [PLUGIN_DEVELOPMENT.md](PLUGIN_DEVELOPMENT.md)
- **详细规范**: [../aidoc/ai-guide.md](../aidoc/ai-guide.md)

---

## 许可证

MIT
