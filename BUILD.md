# Desktop Tool 打包指南

本项目支持两种打包模式：Electron 桌面应用和 Web 静态应用。

## 开发模式

### Electron 桌面应用开发
```bash
npm run dev
```
启动 Vite 开发服务器，自动加载 Electron 主进程和预加载脚本。

### Web 应用开发
```bash
npm run dev:web
```
以 Web 模式启动 Vite 开发服务器，禁用 Electron 相关功能。

## 构建

### 构建 Electron 桌面应用
```bash
npm run build:electron
```
编译 TypeScript 并构建 Electron 应用。

### 构建 Web 静态应用
```bash
npm run build:web
```
构建 Web 静态文件到 `dist/renderer` 目录。

```bash
npm run dist:web
```
构建 Web 应用并将输出复制到 `dist-web` 目录，可直接部署到静态托管服务。

## 打包分发

### Windows 平台
```bash
npm run dist:win
```
生成：
- NSIS 安装程序（`release/Desktop Tool Setup version.exe`）
- 便携版（`release/Desktop Tool version.exe`）

支持架构：x64, arm64

### macOS 平台
```bash
npm run dist:mac
```
生成：
- DMG 磁盘映像（`release/Desktop Tool-version.dmg`）
- ZIP 压缩包（`release/Desktop Tool-version-mac.zip`）

### Linux 平台
```bash
npm run dist:linux
```
生成：
- AppImage（`release/Desktop Tool-version.appimage`）
- Debian 包（`release/desktop-tool_version_amd64.deb`）
- RPM 包（`release/desktop-tool-version.rpm`）

### 所有平台
```bash
npm run dist
```
打包当前平台的应用。

## Web 部署

`dist-web` 目录包含完整的 Web 应用，可以部署到：

- GitHub Pages
- Vercel
- Netlify
- AWS S3 + CloudFront
- 任何静态文件托管服务

### 部署示例

#### Vercel
```bash
npm run dist:web
vercel --prod dist-web
```

#### GitHub Pages
```bash
npm run dist:web
# 将 dist-web 目录内容推送到 gh-pages 分支
```

#### Netlify
```bash
npm run dist:web
# 在 Netlify 控制台设置发布目录为 dist-web
```

## 文件结构

构建后的文件结构：

```
desktop-tool/
├── dist/                      # Electron 构建输出
│   ├── main/                  # 主进程代码
│   ├── preload/               # 预加载脚本
│   └── renderer/              # 渲染进程代码
├── dist-web/                  # Web 应用构建输出（可部署）
│   ├── index.html
│   └── assets/
├── release/                   # Electron 打包输出
│   ├── Desktop Tool Setup version.exe
│   └── ...
└── build/                     # 打包资源
    ├── icon.ico
    ├── icon.icns
    └── icon.png
```

## 环境变量

### WEB_MODE
在 Web 模式下，`process.env.WEB_MODE` 被设置为 `'true'`，可以在代码中使用：

```typescript
if (process.env.WEB_MODE === 'true') {
  // Web 模式特定逻辑
} else {
  // Electron 模式特定逻辑
}
```

## 注意事项

1. **Electron Builder 配置**：在 `package.json` 的 `build` 字段中配置打包选项
2. **图标资源**：将应用图标放置在 `build/` 目录
3. **代码签名**：生产环境需要配置代码签名证书
4. **自动更新**：可选配置 electron-updater 实现自动更新

## 故障排除

### 构建失败
- 清理缓存：`rm -rf dist node_modules`
- 重新安装依赖：`npm install`

### Windows 打包失败
- 确保已安装 Windows SDK
- 检查 electron-builder 版本兼容性

### macOS 打包失败
- 确保已安装 Xcode Command Line Tools
- 检查代码签名证书

### Web 模式功能异常
- 检查是否正确使用了 `window.electron` 的存在性检查
- 确保 Web 模式下不依赖 Node.js 特定 API
