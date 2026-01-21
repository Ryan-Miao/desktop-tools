# Desktop Tool - AI 开发入口

> ⚠️ **强制执行规则**
>
> 以下规则是**强制性**的，不是"建议"或"最佳实践"：
>
> 1. **修改任何代码前**，必须先进行变更分类
> 2. **单次修改**不得超过 3 个文件
> 3. **核心文件**修改前必须通知用户
> 4. **提交前**必须验证修复有效
>
> 违反以上规则将导致代码被回滚。

---

## ⚠️ 修改前强制检查

**在修改任何代码之前，必须按顺序完成以下检查**：

### 检查 1：变更分类（必须执行）

```
修改 src/main/ 或 src/shared/？
├─ 是 → Critical 变更
│   ├─ 必须通知用户
│   ├─ 必须获得用户批准
│   └─ 需要 80% 测试 + E2E + 性能
└─ 否
    ├─ 破坏性变更？ → Critical
    ├─ 新功能？ → Major
    ├─ Bug修复？ → Minor
    └─ 其他 → Trivial
```

**如何判断**：

- 检查要修改的文件路径
- 检查是否修改 API 接口
- 检查是否影响现有功能

**示例**：

- 修改 `tsconfig.json` → Critical
- 修改 `src/main/plugins/manager.ts` → Critical
- 修改组件样式 → Trivial

### 检查 2：规模限制（必须执行）

**禁止**：

- ❌ 一次修改超过 3 个文件
- ❌ 一次修改超过 100 行代码
- ❌ 使用 agents 并行修改多个文件

**如果需要修改更多文件**：

- 分批修改，每批 2-3 个文件
- 每批之间运行测试验证
- 每批单独提交

### 检查 3：核心文件保护（必须执行）

**受保护的文件**：

- `tsconfig.json`
- `vite.config.ts`
- `package.json`
- `src/main/**/*.ts`
- `src/shared/**/*.ts`

**修改规则**：

1. 必须先进行变更分类
2. 必须通知用户变更级别
3. 必须获得用户明确同意
4. 必须先写测试（TDD）

**示例通知**：

```
变更级别：Critical

修改内容：
- tsconfig.json（关闭严格模式）
- 34 个组件文件

风险：
- 降低类型检查标准
- 可能引入运行时错误

建议：
- 选项 A：遵循 Critical 变更流程（设计审批 + 80% 测试）
- 选项 B：分批次渐进式修复（每次 2-3 个文件）
- 选项 C：降低为 Minor 变更（只修复阻塞 CI 的错误）

请选择方案：A / B / C
```

**只有获得用户明确同意后才能开始修改。**

---

## ⚠️ 提交前强制验证

**在执行 `git commit` 之前，必须完成以下验证**：

### 验证 1：编译通过

```bash
npm run type-check  # 必须通过，0 错误
```

### 验证 2：Lint 通过

```bash
npm run lint  # 必须通过，0 错误（警告可接受）
```

### 验证 3：测试通过

```bash
npm test  # 必须通过，所有测试用例
```

### 验证 4：应用能启动（关键）

```bash
# 如果开发服务器未运行，启动它
npm run dev

# 等待启动完成
# 在浏览器中访问应用
# 检查是否有运行时错误
```

**如果修复了 bug，必须验证**：

1. 应用能正常启动
2. bug 已解决（在浏览器中验证）
3. 没有引入新的 bug
4. 控制台没有错误

### 验证 5：检查修改范围

```bash
git diff --stat  # 查看修改统计
```

**检查**：

- 文件数 ≤ 3（或之前获得批准）
- 行数 ≤ 100（或之前获得批准）
- 不包含意外修改的文件

**如果超出范围**：

- 取消提交
- 拆分为多个小提交
- 每个提交单独验证

**只有以上所有验证都通过后，才能执行 git commit。**

---

## 🚫 明确禁止的操作

以下操作被**严格禁止**，任何情况都不得执行：

### 禁止 1：批量修改

**禁止**：

- ❌ 一次修改超过 5 个文件
- ❌ 一次修改超过 200 行代码
- ❌ 使用 Task 工具并行修改多个文件
- ❌ 使用多个 agents 同时修改代码

**后果**：

- 立即回滚
- 需要重新制定计划
- 严重违反规范

### 禁止 2：跳过验证

**禁止**：

- ❌ 修改代码后不测试就提交
- ❌ 修复 bug 后不验证修复有效就提交
- ❌ 运行 `git commit` 前不运行应用
- ❌ 运行 `git push` 前不在本地测试

**后果**：

- 立即回滚
- 可能破坏主分支
- 影响所有开发者

### 禁止 3：未经批准修改核心文件

**禁止**：

- ❌ 修改 `tsconfig.json` 前不通知用户
- ❌ 修改 `vite.config.ts` 前不通知用户
- ❌ 修改 `src/main/**/*.ts` 前不通知用户
- ❌ 修改 `src/shared/**/*.ts` 前不通知用户

**正确流程**：

1. 进行变更分类
2. 通知用户变更级别
3. 说明风险和影响
4. 获得用户明确同意
5. 然后才能开始修改

### 禁止 4：降低质量标准

**禁止**：

- ❌ 为了"快速修复"而关闭 TypeScript 严格选项
- ❌ 为了"通过 CI"而降低测试覆盖率要求
- ❌ 为了"节省时间"而跳过代码审查

**后果**：

- 技术债累积
- 长期维护成本增加
- 违反项目价值观

---

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

## 核心开发规范

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

### 2. TDD 测试规范

- **测试优先开发**（核心代码必须）
- **日志规范**: 使用 `createLogger`，禁用 `console.log`
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

**必须满足更高测试覆盖率的核心代码**：

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

## 快速参考

### 变更类型快速判断

| 类型         | 标准             | 测试要求 | 设计审批  |
| ------------ | ---------------- | -------- | --------- |
| **Critical** | 核心、破坏、安全 | 80%+E2E  | ✅ 必需   |
| **Major**    | 新功能、架构     | 70%+集成 | ✅ 必需   |
| **Minor**    | Bug修复、小增强  | 复现测试 | ❌ 不需要 |
| **Trivial**  | UI、配置         | 现有测试 | ❌ 不需要 |

---

## 下一步

1. **阅读完整规范**: `devdoc/ai/claude.md` - 了解 TDD、日志、代码规范等详细内容
2. **查看当前状态**: `devdoc/progress/PROJECT_STATUS.md` - 了解项目当前进度
3. **查找具体标准**: 根据任务类型查找 `devdoc/standards/` 中的对应文档

---

**版本**: 2.0 - 强制执行版本
**最后更新**: 2026-01-22
**重大变更**：从"建议"改为"强制"，添加明确的禁止规则
