# Desktop Tool 开发任务清单

> 最后更新: 2025-01-15 01:45
> 下次执行时间: 灵活安排

---

## ✅ 今日完成任务（2025-01-15）

### 1. ✅ 修复工具面板窗口控制按钮 🔴 高优先级
- [x] 修复关闭按钮（当前不可用）
- [x] 添加最大化按钮（绿色）
- [x] 添加最小化按钮（黄色）
- [x] 实现窗口拖动功能（Mac风格）

**完成内容**:
- 在 WindowManager 中添加了 `maximize()` 和 `isMaximized()` 方法
- 添加了窗口事件监听器，同步最大化/取消最大化状态到渲染进程
- 在 preload 和 IPC handlers 中添加了 `window:maximize` 频道
- 在 WindowControls 组件中添加了绿色最大化按钮
- 实现了窗口状态同步和图标切换

**文件**: `src/main/windows/manager.ts`, `src/renderer/App.tsx`, `src/renderer/components/WindowControls.tsx`, `src/main/ipc/handlers.ts`, `src/preload/index.ts`

---

### 2. ✅ 修复悬浮时钟独立窗口 🔴 高优先级
- [x] 点击"打开悬浮窗口"后，独立窗口没有出现
- [x] 检查IPC通信是否正常
- [x] 检查窗口创建逻辑
- [x] 验证窗口URL加载（hash: #floating-clock）
- [x] 添加悬浮关闭按钮（鼠标悬停显示）
- [x] 实现独立窗口模式（隐藏主窗口UI）

**完成内容**:
- 在 App.tsx 中添加了 hash 路由支持，监听 `#floating-clock`
- 添加了 `isFloatingClockMode` 状态来区分独立窗口模式和正常模式
- 在独立窗口模式下只渲染 FloatingClock 组件，不显示主窗口 UI
- 在 FloatingClock 组件中添加了悬浮关闭按钮
- 保持了实时统计数据显示（键盘、鼠标、移动距离）

**待后续实现**: ~~久坐提醒、全屏动态效果、数据评论描述、多配色主题~~ (已在后续任务中完成)

**文件**: `src/renderer/App.tsx`, `src/renderer/components/FloatingClock.tsx`

---

### 3. ✅ 添加统计报表查看功能 🟠 中优先级
- [x] 创建统计报表页面
- [x] 显示近7天/30天数据趋势图
- [x] 按小时/天/周聚合数据
- [x] 导出统计报表为CSV
- [x] 图表可视化（使用Chart.js）
- [x] 工作评价系统

**完成内容**:
- 创建了 StatsReport 组件，包含完整的统计报表功能
- 集成了 Chart.js，支持折线图和柱状图
- 支持按小时/天/周聚合数据
- 实现了 CSV 导出功能（带中文编码）
- 添加了工作评价系统（根据工作强度给出评价）
- 在主界面添加了"查看统计报表"按钮

**文件**: `src/renderer/components/StatsReport.tsx`, `src/main/database/index.ts`, `src/main/ipc/handlers.ts`, `src/renderer/App.tsx`

---

### 4. ✅ 完善悬浮时钟功能 🟡 中优先级
- [x] 久坐提醒功能（可配置连续工作x分钟）
- [x] 提醒时全屏展示并播放动态效果
- [x] 点击任意位置返回正常大小
- [x] 增加数据评论描述（如：这摸鱼了、枕式劳模等）
- [x] 多种配色主题（10种预设主题）
- [x] 字体样式自定义
- [x] 数据导出功能（已在统计报表中实现）

**完成内容**:
- 实现了久坐提醒功能，可配置工作时长（15-180分钟）
- 添加了全屏提醒动画（渐变背景 + 脉冲效果）
- 实现了工作评价系统，根据输入强度给出不同评价
- 添加了10种预设配色主题（经典蓝、活力橙、清新绿等）
- 支持自定义字体大小和透明度
- 数据导出功能通过统计报表实现

**文件**: `src/renderer/components/FloatingClock.tsx`

---

### 5. ✅ 开发更多热门插件 🟡 中优先级
- [x] 时间戳转换器 - Unix时间戳与日期时间互转
- [x] UUID生成器 - 批量生成UUID v4
- [x] 二维码生成器 - 支持WiFi、网址、邮件、电话等
- [x] 单位转换器 - 长度、重量、温度、面积、体积、时间

**完成内容**:
- **时间戳转换器**: 支持时间戳与日期时间互转，显示当前时间，常用时间快速选择
- **UUID生成器**: 批量生成UUID，支持大写/移除连字符，一键复制
- **二维码生成器**: 支持多种格式（WiFi、网址、邮件、电话、短信、名片），可自定义颜色和尺寸
- **单位转换器**: 支持6种单位类型（长度、重量、温度、面积、体积、时间），快速转换常用值

**文件**: `src/renderer/components/TimestampConverter.tsx`, `src/renderer/components/UUIDGenerator.tsx`, `src/renderer/components/QRCodeGenerator.tsx`, `src/renderer/components/UnitConverter.tsx`, `src/renderer/App.tsx`

---

## 🎯 待办任务


### 6. 数据备份与恢复 🟠 中优先级
- [ ] 实现全量数据导出（SQLite数据库 + localStorage）
- [ ] 实现数据导入功能
- [ ] 自动备份功能（每日/每周）
- [ ] 备份文件加密（可选密码）
- [ ] 云端备份（可选，支持WebDAV/GitHub Gist）

**文件**: `src/main/services/BackupService.ts`, `src/renderer/components/BackupPanel.tsx`

---

### 7. 继续开发更多插件 🟡 中优先级

#### 7.1 已有插件（8个）
- [x] Base64 编码/解码
- [x] 颜色选择器
- [x] 悬浮时钟（独立窗口已修复）
- [x] JSON 工具
- [x] 时间戳转换器
- [x] UUID 生成器
- [x] 二维码生成器
- [x] 单位转换器

#### 7.2 待开发插件
- [ ] **Markdown 编辑器** - 实时预览、导出HTML/PDF
- [ ] **正则表达式测试器** - 常用正则库、实时测试
- [ ] **加密解密工具** - AES/DES/RSA/MD5/SHA
- [ ] **IP地址查询** - 显示本机IP、地理位置
- [ ] **汇率转换器** - 实时汇率、多币种转换
- [ ] **Hash计算器** - 文件/文本Hash校验
- [ ] **图片压缩工具** - 压缩、格式转换
- [ ] **代码格式化工具** - JSON/XML/SQL/HTML

**目录**: `plugins/`

---

### 8. 插件加载功能 🟢 低优先级

#### 8.1 离线插件加载
- [ ] 支持从本地目录加载插件
- [ ] 插件文件格式：.zip 或 .json
- [ ] 插件签名验证

#### 8.2 在线插件市场
- [ ] 插件市场页面
- [ ] 插件搜索和分类
- [ ] 插件评分和评论
- [ ] 一键安装插件
- [ ] 插件更新检测

**文件**: `src/main/services/PluginMarket.ts`, `src/renderer/components/PluginMarket.tsx`

---

### 9. 双模式打包 🟡 中优先级

#### 9.1 桌面模式（Electron）
- [ ] Windows 打包配置（electron-builder）
- [ ] macOS 打包配置
- [ ] Linux 打包配置
- [ ] 自动更新功能

#### 9.2 Web静态模式
- [ ] Vite 静态构建配置
- [ ] 路由适配（Hash模式）
- [ ] localStorage持久化（替代数据库）
- [ ] 部署到 GitHub Pages
- [ ] CI/CD 自动化部署

**文件**: `vite.config.ts`, `electron-builder.yml`, `.github/workflows/deploy.yml`

---

### 10. 捐赠和广告位 🟢 低优先级
- [ ] 设置页面添加捐赠入口
- [ ] 支付宝/微信捐赠二维码
- [ ] GitHub Sponsors 链接
- [ ] 广告位组件设计
- [ ] 广告位管理（开关/位置）

**文件**: `src/renderer/components/SettingsPanel.tsx`, `src/renderer/components/AdBanner.tsx`

---

### 11. 统计分析集成 🟢 低优先级
- [ ] 百度统计集成
- [ ] Google Analytics 集成
- [ ] 统计代码管理（设置页面开关）
- [ ] 用户行为统计（插件使用频率）
- [ ] 错误日志收集（Sentry）

**文件**: `src/renderer/components/Analytics.tsx`, `index.html`

---

### 12. 广告平台接入 🟢 低优先级
- [ ] 调研适合的广告平台
  - [ ] Google AdSense
  - [ ] 百度联盟
  - [ ] 程序化广告（需备案）
- [ ] 广告位设计（顶部/侧边/底部）
- [ ] 广告展示逻辑（频率控制）
- [ ] 收益统计

**注意**: 桌面应用接入广告需要考虑网络请求和用户体验

---

## ✅ 基础功能已完成

### 核心功能
- [x] 项目初始化（Electron + React + TypeScript）
- [x] 主窗口UI（Mac风格毛玻璃效果）
- [x] 插件系统架构
- [x] 数据库服务（SQLite）
- [x] 主题系统（15种配色主题）
- [x] 插件管理器（启用/禁用/收藏/排序）
- [x] 数据持久化（localStorage）
- [x] 输入监听器（键盘、鼠标统计）

### 已有插件（8个）
- [x] Base64编码插件
- [x] 颜色选择器插件
- [x] JSON工具插件
- [x] 悬浮时钟插件（独立窗口、久坐提醒、数据评论）
- [x] 时间戳转换器插件
- [x] UUID 生成器插件
- [x] 二维码生成器插件
- [x] 单位转换器插件

### 窗口控制
- [x] 窗口控制按钮（关闭/最小化/最大化）
- [x] 窗口拖动功能（Mac风格）
- [x] 悬浮时钟独立窗口
- [x] 窗口状态同步

### 统计报表
- [x] 统计报表页面
- [x] 图表可视化（Chart.js）
- [x] 数据导出（CSV）
- [x] 工作评价系统

---

## 🐛 已知问题

1. ~~**悬浮时钟独立窗口不显示**~~ - ✅ 已修复（2025-01-15）
2. ~~**窗口控制按钮缺失**~~ - ✅ 已修复（2025-01-15）
3. **开发服务器偶尔崩溃** - esbuild服务意外退出（低优先级）
4. **PostCSS 警告** - 需要添加 "type": "module" 到 package.json

---

## 📊 进度统计

- **总任务数**: 12
- **已完成**: 5（第一阶段+第二阶段部分任务）
- **进行中**: 0
- **待开始**: 7
- **完成率**: 42%

### 详细进度
- ✅ 高优先级任务: 2/2 完成（100%）
- ✅ 中优先级任务: 3/4 完成（75%）
- 🟡 中低优先级任务: 0/4 完成（0%）
- 🟢 低优先级任务: 0/2 完成（0%）

---

## 🔗 相关文档

- [项目计划](../.claude/plans/happy-stargazing-frost.md)
- [Electron 文档](https://www.electronjs.org/docs)
- [Vite 文档](https://vitejs.dev/)
- [React 文档](https://react.dev/)
