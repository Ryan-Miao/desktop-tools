# 下次继续 - 快速入口

**项目：** 工作台 (Desktop Tool)
**最后更新：** 2025-01-15

---

## 🎯 当前状态

✅ **应用正常运行** - http://localhost:5173/
✅ **所有核心功能已完成**
✅ **无已知 Bug**

---

## 📂 快速导航

### 核心文档
- **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** - 完整项目进度和功能清单
- **[UX_GUIDE.md](./UX_GUIDE.md)** - UX 设计规范和原则
- **[README.md](./README.md)** - 项目说明文档

### 关键文件位置

#### 前端核心组件
```
src/renderer/components/
├── PluginList.tsx          # 插件列表（4种布局+拖拽）
├── SettingsPanel.tsx       # 设置面板
├── BackupPanel.tsx         # 备份面板
├── StatsReport.tsx         # 统计报表
├── App.tsx                 # 主应用入口
└── styles/
    └── themes.css          # 主题系统
```

#### 数据层
```
src/main/
├── database/index.ts       # SQLite 数据库
├── ipc/handlers.ts         # IPC 通道
└── services/BackupService.ts  # 备份服务

src/renderer/services/
└── StorageService.ts       # localStorage 服务
```

#### 插件目录
```
plugins/
├── calculator-pad/         # 计算稿纸
├── todo-list/              # 待办清单
└── quick-notes/            # 随手记
```

---

## 🔧 常用命令

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 打包应用
npm run dist

# 检查代码
npm run lint
```

---

## 📊 当前技术栈

- **Electron** 28.3.3
- **React** 18.2.0
- **TypeScript** 5.3.0
- **Vite** 5.0.0
- **Better SQLite3** 9.2.0

---

## 🎨 最近完成的功能（2025-01-15）

### 1. 常用插件系统 ⭐
- 星标收藏功能
- 拖拽排序
- 自动保存

### 2. 四种布局模式 ⭐
- 图标模式（默认）
- 网格模式
- 列表模式
- 紧凑模式

### 3. 搜索优先 UX ⭐
- 搜索时自动显示详细信息
- 强制列表布局
- 清空搜索恢复原布局

### 4. 视觉优化 ⭐
- 修复图标模式发白灰问题
- 提高对比度和清晰度
- 添加边框和阴影

---

## 🐛 最近修复的问题

1. ✅ 图标模式下卡片发白灰 - 提高背景不透明度到 0.6
2. ✅ 拖拽排序不生效 - 修复事件绑定和排序逻辑
3. ✅ 统计报表自动刷新跳回顶部 - 添加 2 秒防抖
4. ✅ 搜索结果不清晰 - 强制显示详细信息

---

## 📝 下次可能的优化方向

### 性能优化
- [ ] 虚拟滚动（插件数量 > 50 时）
- [ ] 懒加载插件列表
- [ ] 优化大量数据渲染

### 功能增强
- [ ] 添加快捷键支持
- [ ] 插件更新检查
- [ ] 主题自定义功能
- [ ] 数据导入导出扩展

### 用户体验
- [ ] 首次使用引导
- [ ] 插件使用教程
- [ ] 反馈收集机制

---

## 🔍 调试技巧

### 查看应用日志
```bash
# Electron 主进程日志
# 在终端中直接查看

# 渲染进程日志
# 打开开发者工具 (DevTools) -> Console
```

### 重置应用数据
```bash
# Linux
rm -rf ~/.config/desktop-tool/

# 然后重新启动应用
npm run dev
```

### 查看数据库
```bash
# 使用 SQLite 客户端
sqlite3 ~/.config/desktop-tool/data.db

# 查看表
.tables

# 查看插件数据
SELECT * FROM plugin_data;
```

---

## 📦 备份文件结构

```
backup-xxx.zip
├── manifest.json          # 备份元数据
├── plugins/               # 插件数据（JSON）
│   ├── calculator-pad.json
│   ├── todo-list.json
│   └── quick-notes.json
├── app-settings.json      # 应用设置
└── data.db                # SQLite 数据库
```

---

## 🎯 快速开始开发

1. **查看进度文档**
   ```bash
   cat PROJECT_STATUS.md
   ```

2. **启动开发服务器**
   ```bash
   npm run dev
   ```

3. **修改代码后**
   - 保存文件自动热更新
   - 检查浏览器控制台是否有错误
   - 测试修改的功能

4. **调试问题**
   - 打开 DevTools (F12)
   - 查看 Console 面板的日志和错误
   - 使用 React DevTools 查看组件状态

---

## 💡 重要提醒

### 代码规范
- 使用 TypeScript 严格模式
- 组件使用函数式 + Hooks
- 遵循 ESLint 配置
- 添加适当的注释

### Git 提交规范
```
feat: 新功能
fix: 修复 Bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
perf: 性能优化
test: 测试相关
chore: 构建/工具相关
```

### 发布前检查
- [ ] 运行 `npm run build` 无错误
- [ ] 测试所有核心功能
- [ ] 检查控制台无警告
- [ ] 更新版本号
- [ ] 更新 CHANGELOG

---

**准备就绪！下次继续时直接查看本文档即可快速上手。** 🚀
