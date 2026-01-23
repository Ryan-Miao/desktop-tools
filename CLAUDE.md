# Desktop Tool - AI 开发指南

> 本项目使用 Claude Code 进行 AI 辅助开发，必须遵守以下规范。

## 快速开始

**开始任何开发前，请阅读完整规范**：[aidoc/ai-guide.md](aidoc/ai-guide.md)

## 开发流程（强制）

### 1. 需求评估

- **简单**：单文件修改、小 bug 修复、样式调整
  - 流程：直接开发
- **中等**：2-3 个文件、新功能、小型重构
  - 流程：Plan with file → 开发 → 测试 → 复盘
- **复杂**：>3 个文件、架构变更、核心功能
  - 流程：Plan + UI/UX 设计 → 开发 → 测试 → 复盘

### 2. 开发检查点

- ✅ 开发前：设计方案（中等/复杂需求）
- ✅ 开发后：测试全部通过（覆盖率 core ≥90%, 其他 ≥85%）
- ✅ 完成后：复盘报告 → `aidoc/report/`

### 3. 禁止操作

- ❌ 修改 >3 个文件
- ❌ 跳过测试
- ❌ 不写复盘

## 文档位置

- **完整规范**: [aidoc/ai-guide.md](aidoc/ai-guide.md)
- **开发计划**: [aidoc/plan/](aidoc/plan/)
- **复盘报告**: [aidoc/report/](aidoc/report/)

## 常用命令

```bash
npm run dev              # 开发
npm test                 # 测试
npm run type-check       # 类型检查
npm run lint             # Lint
npm run test:coverage    # 覆盖率
```

---

**版本**: 4.0 - 文档重构版
**强制执行**: 是
