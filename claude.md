# Desktop Tool - AI 开发入口

> Claude Code 进入项目时首先阅读此文档

## 快速导航

### 开发规范 (必须阅读)

- **核心规范**: `devdoc/ai/claude.md` - TDD、代码规范、提交规范
- **测试指南**: `devdoc/standards/testing.md`
- **变更分类**: `devdoc/standards/change_classification.md`
- **快速参考**: `devdoc/standards/quick_reference.md`

### 项目文档

- **项目说明**: `README.md`
- **插件开发**: `doc/PLUGIN_DEVELOPMENT.md`
- **构建指南**: `doc/BUILD.md`
- **贡献指南**: `doc/CONTRIBUTING.md`

### 开发进度

- **当前状态**: `devdoc/progress/PROJECT_STATUS.md`
- **开发计划**: `devdoc/plans/task_plan.md`

---

## 开发前必读

### 1. 变更分类决策树

```
修改 src/main/ 或 src/shared/？
├─ 是 → Critical (设计审批 + 80%测试)
└─ 否
    ├─ 破坏性变更？ → Critical
    ├─ 新功能？ → Major (设计审批 + 70%测试)
    ├─ Bug修复？ → Minor (复现测试)
    └─ 其他 → Trivial (现有测试)
```

### 2. 核心开发规范

- **TDD**: 测试优先开发（核心代码必须）
- **日志**: 使用 `createLogger`，禁用 `console.log`
- **CSS变量**: 所有样式必须使用 CSS 变量支持主题
- **内联确认**: 禁用 confirm/alert，使用内联确认 + Toast

### 3. 提交规范

```
<type>(<scope>): <subject>

类型: feat, fix, docs, style, refactor, perf, test, chore
示例: feat(plugin): add hot reload feature
```

### 4. 常用命令

```bash
# 开发
npm run dev              # 启动开发服务器
npm start                # 启动 Electron

# 测试
npm test                 # 运行所有测试
npm run test:coverage    # 生成覆盖率报告

# 代码检查
npm run type-check       # TypeScript 类型检查
npm run lint             # ESLint 检查
```

---

## 文档组织规范

| 目录      | 用途       | 示例                              |
| --------- | ---------- | --------------------------------- |
| `doc/`    | 用户文档   | README, PLUGIN_DEVELOPMENT, BUILD |
| `devdoc/` | 开发者文档 | 规范、计划、进度、总结            |

### 用户文档 (`doc/`)

- README.md - 项目介绍和使用指南
- PLUGIN_DEVELOPMENT.md - 插件开发指南（面向插件作者）
- BUILD.md - 构建和打包说明
- CONTRIBUTING.md - 贡献指南

### 开发者文档 (`devdoc/`)

- `ai/` - AI 开发规范
- `standards/` - 开发标准（测试、代码审查等）
- `plans/` - 开发计划
- `progress/` - 项目进度
- `summaries/` - 开发总结和报告

---

## 核心代码路径

**必须满足更高测试覆盖率的核心代码**:

```
src/main/              # 主进程
  ├── index.ts
  ├── database/
  ├── plugins/
  ├── windows/
  ├── ipc/
  └── services/

src/shared/
  ├── types/          # 类型定义
  └── logger/         # 日志框架

src/renderer/services/
  └── StorageService.ts
```

---

## 下一步

1. **阅读完整规范**: `devdoc/ai/claude.md` - 了解 TDD、日志、代码规范等详细内容
2. **查看当前状态**: `devdoc/progress/PROJECT_STATUS.md` - 了解项目当前进度
3. **查找具体标准**: 根据任务类型查找 `devdoc/standards/` 中的对应文档

---

## 快速参考

### 变更类型快速判断

| 类型         | 标准             | 测试要求 | 设计审批  |
| ------------ | ---------------- | -------- | --------- |
| **Critical** | 核心、破坏、安全 | 80%+E2E  | ✅ 必需   |
| **Major**    | 新功能、架构     | 70%+集成 | ✅ 必需   |
| **Minor**    | Bug修复、小增强  | 复现测试 | ❌ 不需要 |
| **Trivial**  | UI、配置         | 现有测试 | ❌ 不需要 |

### 开发检查清单

**开发前**:

- [ ] 分类变更类型
- [ ] Critical/Major? → 创建设计文档
- [ ] 设计文档已批准?

**提交前**:

- [ ] `npm test` - 所有测试通过
- [ ] `npm run test:coverage` - 覆盖率达标
- [ ] `npm run lint` - Lint通过
- [ ] `npm run type-check` - 类型检查通过
- [ ] 无 console.log，使用 logger
- [ ] 无 console.confirm/alert

---

**版本**: 1.0
**最后更新**: 2026-01-21
