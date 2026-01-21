# 开发者文档索引

> 本目录包含所有面向开发者的文档，包括规范、计划、进度和总结。

## 目录结构

```
devdoc/
├── ai/           # AI 开发规范
├── standards/    # 开发标准（测试、代码审查等）
├── plans/        # 开发计划和设计
├── progress/     # 项目进度跟踪
└── summaries/    # 开发总结和报告
```

---

## 快速导航

### 📋 规范与标准

- [AI 开发核心规范](ai/claude.md) - **必读** - TDD、代码规范、提交规范
- [测试指南](standards/testing.md) - 测试策略、覆盖率要求、TDD 流程
- [变更分类](standards/change_classification.md) - Critical/Major/Minor/Trivial 分类标准
- [代码审查清单](standards/code_review.md) - PR 审查检查点
- [快速参考卡](standards/quick_reference.md) - 常用命令和决策树

### 📊 计划与进度

- [任务计划](plans/task_plan.md) - 总体开发计划
- [插件架构计划](plans/plugin_architect_task_plan.md) - 插件系统架构
- [项目状态](progress/PROJECT_STATUS.md) - 当前项目状态
- [待办事项](progress/todo.md) - 待办任务列表

### 📈 总结与报告

- [开发总结](summaries/) - 各阶段开发总结
- [测试报告](summaries/reports/) - 测试和性能报告
- [迁移文档](summaries/migrations/) - 系统迁移记录

---

## 文档使用指南

### 新加入的开发者

1. 先阅读 `/claude.md`（根目录的 AI 入口文档）
2. 阅读 `ai/claude.md` 了解核心开发规范
3. 查看 `progress/PROJECT_STATUS.md` 了解当前状态

### 开发新功能

1. 查看 `plans/task_plan.md` 了解开发计划
2. 阅读 `standards/change_classification.md` 确定变更类型
3. 如需要，参考 `standards/testing.md` 编写测试

### 代码审查

1. 使用 `standards/code_review.md` 作为审查清单
2. 参考 `standards/quick_reference.md` 快速参考

---

## 文档维护规范

### 创建新文档

- **计划文档**: 放入 `plans/` 目录，命名格式 `*_PLAN.md` 或 `*_DESIGN.md`
- **测试报告**: 放入 `summaries/reports/` 目录，命名格式 `*_REPORT.md`
- **开发总结**: 放入 `summaries/` 目录，命名格式 `*_SUMMARY.md`
- **进度更新**: 放入 `progress/` 目录

### 更新现有文档

- 定期更新 `progress/PROJECT_STATUS.md`
- 每个阶段结束后添加对应的总结文档
- 及时更新 `plans/task_plan.md`

---

**维护者**: Development Team
**最后更新**: 2026-01-21
