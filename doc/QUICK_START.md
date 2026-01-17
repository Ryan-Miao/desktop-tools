# 快速导航

欢迎来到 Desktop Tool 文档中心！本文档将帮助你快速找到所需信息。

## 📚 用户文档

适合想要了解、安装和使用 Desktop Tool 的用户。

### 入门指南
- **[README.md](../README.md)** - 项目概述、快速开始、核心功能介绍
  - 环境要求和安装
  - 快速开始指南
  - 常见问题解答

### 功能指南
- **[BUILD.md](./BUILD.md)** - 构建和打包指南
  - Electron 应用构建
  - Web 应用构建
  - 多平台打包

### 使用指南
- **[PLUGIN_IMPORT_EXPORT_GUIDE.md](../PLUGIN_IMPORT_EXPORT_GUIDE.md)** - 插件导入导出指南
  - 如何导入外部插件
  - 如何导出插件备份

## 🔨 开发者文档

适合想要参与开发或创建插件的开发者。

### 插件开发
- **[PLUGIN_DEVELOPMENT.md](./PLUGIN_DEVELOPMENT.md)** - 插件开发完整指南
  - 插件架构说明
  - 独立窗口实现
  - API 参考文档
  - 最佳实践
  - 发布流程

### 设计指南
- **[UX_GUIDE.md](./UX_GUIDE.md)** - UI/UX 设计指南
  - 设计原则
  - 组件规范
  - 主题系统
  - 交互动画

### 文档索引
- **[DOC_INDEX.md](./DOC_INDEX.md)** - 所有文档的完整索引

## 🤖 AI 辅助开发

适合使用 AI 工具（如 Claude Code）辅助开发的场景。

### Claude 开发规范
- **[Claude 开发规范](../devdoc/ai/claude.md)** - Claude Code 完整开发规范
  - 项目概述
  - TDD 测试驱动开发规范
  - 日志系统标准
  - 事件广播模式
  - 跨平台调试技巧
  - 最新架构模式（EventBus、依赖注入）
  - UI/UX 最佳实践
  - CSS 变量规范

### 项目状态
- **[项目状态](../devdoc/progress/PROJECT_STATUS.md)** - 当前项目状态和进度
  - 已完成功能
  - 进行中任务
  - 已知问题

## 📖 开发文档（内部）

开发团队成员使用的内部文档。

### 计划文档
- **[任务计划](../devdoc/plans/task_plan.md)** - 通用任务计划
- **[插件任务计划](../devdoc/plans/plugin_task_plan.md)** - 插件相关任务
- **[插件架构计划](../devdoc/plans/plugin_architect_task_plan.md)** - 插件架构规划

### 测试计划
- **[日志级别测试计划](../devdoc/plans/LOG_LEVEL_TEST_PLAN.md)** - 日志系统测试
- **[性能测试计划](../devdoc/plans/PERFORMANCE_TEST_PLAN.md)** - 性能基准测试

### 进度追踪
- **[进度文档](../devdoc/progress/README.md)** - 进度文档索引
- **[项目总结](../devdoc/summaries/README.md)** - 开发总结文档

## 🚀 快速开始

### 新用户
1. 阅读 [README.md](../README.md) 了解项目概况
2. 按照 [快速开始](../README.md#-快速开始) 安装和运行
3. 查看 [插件开发指南](./PLUGIN_DEVELOPMENT.md) 创建你的第一个插件

### 插件开发者
1. 阅读 [插件开发指南](./PLUGIN_DEVELOPMENT.md)
2. 查看 [计算器插件示例](../src/renderer/components/CalculatorPad.tsx)
3. 参考 [Claude 开发规范](../devdoc/ai/claude.md) 了解最佳实践

### 贡献者
1. 阅读 [贡献指南](../README.md#-贡献指南)
2. 查看 [项目状态](../devdoc/progress/PROJECT_STATUS.md) 了解当前进度
3. 查看 [Claude 开发规范](../devdoc/ai/claude.md) 了解代码规范

## 📞 获取帮助

- **GitHub Issues**: [提交问题](https://github.com/yourusername/desktop-tool/issues)
- **开发文档**: [devdoc/](../devdoc/)
- **用户文档**: [doc/](./)

## 🔍 搜索技巧

### 按主题查找

**想了解如何...**
- 安装和运行 → [README.md - 快速开始](../README.md#-快速开始)
- 开发插件 → [PLUGIN_DEVELOPMENT.md](./PLUGIN_DEVELOPMENT.md)
- 构建打包 → [BUILD.md](./BUILD.md)
- 使用 AI 辅助开发 → [Claude 开发规范](../devdoc/ai/claude.md)
- 了解主题系统 → [README.md - 主题系统](../README.md#-主题系统)

**遇到问题...**
- 安装失败 → [README.md - 常见问题](../README.md#-常见问题)
- 构建错误 → [BUILD.md](./BUILD.md)
- 插件不显示 → [README.md - 常见问题](../README.md#-常见问题)

## 📝 文档贡献

发现文档有误或想要改进？欢迎贡献！

1. Fork 仓库
2. 修改文档
3. 提交 Pull Request

---

**最后更新**: 2026-01-18
**文档版本**: 1.0.0
