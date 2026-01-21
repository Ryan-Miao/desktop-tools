# AI开发规范 (AI Development Standards)

## 概述

本文档定义了使用AI辅助开发Desktop Tool项目时的标准、流程和最佳实践。

**目标**:
- 确保代码质量和稳定性
- 规范AI辅助开发流程
- 提高开发效率和可维护性
- 减少bug和技术债务

**适用范围**: 所有参与Desktop Tool开发的开发者和AI助手

**版本**: 1.0
**最后更新**: 2026-01-21

---

## 核心定义

### 什么是"Core代码"

**核心代码**是指应用的关键基础设施，修改这些代码可能导致严重问题或影响整个系统。

**必须满足80%测试覆盖率的核心代码路径**:

```
src/main/                    # 整个主进程
├── index.ts                 # 应用入口
├── database/index.ts        # 数据库服务
├── plugins/manager.ts       # 插件管理器
├── windows/manager.ts       # 窗口管理
├── ipc/handlers.ts          # IPC通信
└── services/                # 所有服务

src/shared/
├── types/                   # 类型定义
└── logger/                  # 日志框架

src/renderer/services/
└── StorageService.ts        # 存储服务
```

**为什么核心代码需要更高标准？**
- 影响整个应用的稳定性
- 难以回滚和修复
- 安全风险较高
- 性能影响大

---

## 变更分类标准

### 变更类型

| 分类 | 标准 | 测试要求 | 设计审批 | 文档要求 |
|------|------|----------|----------|----------|
| **Critical** | 核心代码、破坏性变更、安全相关 | 80%覆盖+E2E+性能 | ✅ 必需 | 完整文档 |
| **Major** | 新功能、架构变更 | 70%覆盖+集成测试 | ✅ 必需 | 完整文档 |
| **Minor** | Bug修复、小增强 | 复现测试+边界测试 | ❌ 不需要 | 更新受影响部分 |
| **Trivial** | UI调整、配置、文档 | 现有测试通过 | ❌ 不需要 | 如需则更新 |

### 变更分类决策树

```
开始
  │
  ├─ 是否修改 src/main/ 或 src/shared/？
  │   ├─ 是 → Critical（需要设计审批 + 80%测试）
  │   └─ 否 ↓
  ├─ 是否有破坏性变更？
  │   ├─ 是 → Critical（需要设计审批 + 80%测试）
  │   └─ 否 ↓
  ├─ 是否是新功能？
  │   ├─ 是 → Major（需要设计审批 + 70%测试）
  │   └─ 否 ↓
  ├─ 是否是bug修复？
  │   ├─ 是 → Minor（需要复现测试）
  │   └─ 否 ↓
  └─ Trivial（现有测试通过即可）
```

### 破坏性变更示例

**属于破坏性变更**:
- 修改公共API接口
- 更改插件manifest格式
- 修改IPC handler签名
- 更改TypeScript类型定义
- 数据库schema变更
- 移除已有功能

**不属于破坏性变更**:
- 内部实现重构
- 添加新的可选参数
- 性能优化（外部行为不变）
- Bug修复

---

## TDD测试要求

### 测试优先原则（TDD）

**必须先写测试的场景**:
- ✅ 所有核心代码修改
- ✅ Bug修复（先写失败测试重现bug）
- ✅ 新功能开发
- ✅ API变更
- ✅ 重构

**可后写测试的场景**:
- 纯UI/视觉调整（颜色、布局）
- 文档更新
- 配置文件变更

### TDD循环：Red-Green-Refactor

```
1. RED   → 编写失败的测试
2. GREEN → 编写最少代码使测试通过
3. REFACTOR → 重构代码保持测试通过
```

### 测试覆盖率要求

| 代码类型 | 行覆盖率 | 函数覆盖率 | 分支覆盖率 | 语句覆盖率 |
|---------|----------|-----------|-----------|-----------|
| **核心代码** | **80%** | **80%** | **70%** | **80%** |
| UI组件 | 60% | 60% | 50% | 60% |
| 工具函数 | 80% | 80% | 70% | 80% |
| 插件代码 | 60% | 60% | 50% | 60% |

### 验证覆盖率

```bash
# 运行测试并生成覆盖率报告
npm run test:coverage

# 验证核心代码覆盖率 >= 80%
npm run test:verify-coverage

# 查看详细报告
open coverage/index.html
```

---

## 开发流程检查点

### 检查点1: 需求分析（开发前）

- [ ] 完全理解用户需求
- [ ] 识别受影响的模块（使用grep/glob查找依赖）
- [ ] 分类变更类型（Critical/Major/Minor/Trivial）
- [ ] 确定是否需要设计审批

**Critical/Major变更 - 必须创建设计文档**

参考模板: `doc/templates/DESIGN_DOC_TEMPLATE.md`

### 检查点2: 设计评审

- [ ] 提交设计文档评审
- [ ] 整合反馈
- [ ] 获得重大变更批准
- [ ] 更新设计文档

### 检查点3: 测试规划

- [ ] 列出所有需要的测试用例
- [ ] 识别边界情况
- [ ] 规划性能基准测试
- [ ] 定义成功标准

### 检查点4: 测试优先开发（核心代码）

- [ ] 为新功能编写失败测试
- [ ] 验证测试失败（RED）
- [ ] 实现最小代码通过测试（GREEN）
- [ ] 重构同时保持测试通过（REFACTOR）

### 检查点5: 增量开发

- [ ] 频繁提交（描述性消息）
- [ ] 每次提交后运行测试
- [ ] 检查类型错误（`npm run type-check`）
- [ ] 运行linting（`npm run lint`）

### 检查点6: 代码质量检查

- [ ] TypeScript严格模式通过
- [ ] 无ESLint警告
- [ ] DevTools中无控制台错误
- [ ] 检查内存泄漏
- [ ] 实现错误处理

### 检查点7: 自动化测试（开发后）

- [ ] 所有单元测试通过（`npm test`）
- [ ] 覆盖率阈值达标（`npm run test:coverage`）
- [ ] 集成测试通过
- [ ] E2E测试通过（`npm run test:e2e`）

### 检查点8: 手动测试

- [ ] 主开发平台测试
- [ ] 至少一个其他平台测试（Windows/macOS/Linux）
- [ ] 现有数据测试（无数据丢失）
- [ ] 错误场景测试

### 检查点9: 文档更新

- [ ] 更新代码注释（公共API的JSDoc）
- [ ] 更新相关文档文件
- [ ] 为新功能添加示例
- [ ] 更新CHANGELOG.md（如适用）

### 检查点10: 性能验证

- [ ] 测量启动时间影响
- [ ] 检查内存使用
- [ ] 分析CPU密集操作
- [ ] 与基准对比（重大变更）

---

## 强制要求

### 核心代码变更

**所有核心代码变更必须满足**:

#### 1. 测试覆盖率

- 行、函数、语句最少 **80%**
- 分支最少 **70%**
- 所有关键路径覆盖
- 边界情况测试

#### 2. 类型安全

- 无`any`类型（使用`unknown`）
- 严格TypeScript模式（已配置）
- 所有类型定义已导出和文档化
- 无来自缺失类型的隐式`any`

#### 3. 错误处理

- 所有async函数处理错误
- 适当的错误类型（继承`Error`）
- 带上下文的错误日志
- UI错误的用户友好消息

#### 4. 文档

- 公共API的JSDoc注释
- 注释中解释复杂算法
- 记录非显而易见的业务逻辑
- 模块头中的使用示例

**示例**:
```typescript
/**
 * 加载指定路径的插件
 *
 * @param pluginPath - 插件目录的绝对路径
 * @throws {PluginLoadError} 当插件manifest无效时
 * @throws {PluginDependencyError} 当插件依赖缺失时
 * @returns {Promise<IPlugin>} 已加载的插件实例
 *
 * @example
 * ```typescript
 * const plugin = await pluginManager.load('/path/to/plugin');
 * await plugin.activate();
 * ```
 */
async load(pluginPath: string): Promise<IPlugin> {
  // 实现...
}
```

### 破坏性变更

**破坏性变更必须包含**:

#### 1. 迁移路径

- 数据迁移脚本（如schema变更）
- 插件开发者的代码迁移指南
- 尽可能自动迁移
- 旧数据的回退行为

#### 2. 弃用政策

- 在JSDoc中标记旧API为`@deprecated`
- 提供迁移示例
- 至少在一个次要版本中保持向后兼容
- 记录移除时间表

#### 3. 沟通

- 更新BREAKING_CHANGES.md
- 添加迁移指南到文档
- 更新插件开发指南
- 通知插件开发者

**破坏性变更文档模板**:
```markdown
# 破坏性变更 v2.0.0

## 插件Manifest格式变更

### 变更内容
- `permissions` 字段现在是必需的
- 新增 `minAppVersion` 字段

### 迁移指南
1. 在 manifest.json 中添加 `permissions` 数组
2. 指定最小应用版本: `"minAppVersion": "2.0.0"`

### 示例
```json
{
  "id": "my-plugin",
  "permissions": ["storage", "network"],
  "minAppVersion": "2.0.0"
}
```

### 自动迁移
内置插件将在首次加载时自动迁移。
外部插件需要手动更新。
```

### 性能影响评估

**对于所有重大变更，评估**:

#### 1. 启动时间

- 使用`performance.now()`测量前后
- 目标: < 2秒启动时间
- 记录任何回退 > 100ms

#### 2. 内存使用

- 使用Chrome DevTools内存面板分析
- 检查内存泄漏（操作前后的堆快照）
- 目标: < 200 MB基线

#### 3. CPU使用

- 空闲时测量（目标: < 1%）
- 典型操作期间测量
- 识别任何阻塞主线程操作

#### 4. I/O操作

- 最小化同步文件操作
- 尽可能批量数据库写入
- 缓存频繁访问的数据

### 用户功能的文档

**面向用户的功能需要**:

#### 1. 用户文档

- 添加到适当指南的部分
- 复杂功能的截图/视频
- 提供使用示例
- 记录限制和已知问题

#### 2. API文档

- 所有公共接口的JSDoc
- TypeScript类型已导出和文档化
- 注释中的使用示例
- 记录参数约束和返回类型

#### 3. 迁移指南

- 破坏性变更（见上文）
- 功能弃用
- 配置变更

---

## 自动化和执行

### Pre-commit检查

每次commit前自动运行：

```bash
# Lint和格式化
npx lint-staged

# Commit消息格式验证
npx commitlint --edit "$1"
```

**配置**: `.husky/pre-commit`, `.husky/commit-msg`

### CI/CD检查

GitHub Actions自动运行：

```yaml
jobs:
  lint:
    - npm run lint
    - npm run type-check

  test:
    - npm run test:coverage
    - npm run test:verify-coverage

  e2e:
    - npm run test:e2e
```

**配置**: `.github/workflows/ci.yml`

### 强制执行矩阵

| 强制等级 | 适用时间 | Pre-commit | CI | 可绕过 |
|----------|----------|------------|-----|--------|
| **无** | 第1周 | ✅ 警告 | ✅ 警告 | ✅ 是 |
| **仅警告** | 第2-3周 | ✅ 警告 | ✅ 警告 | ✅ 是 |
| **软执行** | 第4-5周 | ❌ 阻止 | ✅ 阻止 | ⚠️ --no-verify |
| **硬执行** | 第6周+ | ❌ 阻止 | ❌ 阻止 | ❌ 否 |

**说明**:
- **警告**: 显示问题但不阻止提交/合并
- **阻止**: 拒绝提交/PR，直到问题解决
- **可绕过**: 可以使用`--no-verify`跳过（仅软执行阶段）

---

## 快速参考

### Commit消息格式

遵循Conventional Commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**类型（type）**:
- `feat`: 新功能
- `fix`: Bug修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 添加测试
- `chore`: 构建/工具链更新

**示例**:
```bash
feat(plugin): 添加插件热重载功能

- 实现文件监听
- 自动重新加载插件
- 保留插件状态

Closes #123
```

### 常用命令

```bash
# 开发
npm run dev                # 启动开发服务器
npm run build              # 构建项目

# 代码质量
npm run lint               # 运行ESLint
npm run type-check         # TypeScript类型检查

# 测试
npm test                   # 运行所有测试
npm run test:core          # 仅测试核心代码
npm run test:coverage      # 生成覆盖率报告
npm run test:verify-coverage  # 验证核心代码覆盖率
npm run test:e2e           # 运行E2E测试
```

### 核心代码检查清单

**修改核心代码前，确保**:
- [ ] 变更类型已分类（Critical/Major/Minor/Trivial）
- [ ] 如需要，设计文档已批准
- [ ] 测试用例已规划
- [ ] 测试优先编写（TDD）

**提交代码前，确保**:
- [ ] 所有测试通过
- [ ] 覆盖率 >= 80%
- [ ] Lint无错误
- [ ] 类型检查通过
- [ ] 无控制台错误/警告
- [ ] JSDoc完整
- [ ] 文档已更新

---

## 相关文档

- **测试指南**: `doc/TESTING.md`
- **变更分类**: `doc/CHANGE_CLASSIFICATION.md`
- **代码评审检查清单**: `doc/CODE_REVIEW_CHECKLIST.md`
- **设计文档模板**: `doc/templates/DESIGN_DOC_TEMPLATE.md`
- **迁移指南模板**: `doc/templates/MIGRATION_GUIDE_TEMPLATE.md`
- **测试模板**:
  - `tests/templates/unit-test.template.ts`
  - `tests/templates/integration-test.template.ts`

---

## 附录

### 术语表

- **Core代码**: 核心基础设施代码，需要80%测试覆盖率
- **Critical变更**: 核心代码修改、破坏性变更或安全相关变更
- **Major变更**: 新功能或架构变更
- **Minor变更**: Bug修复或小增强
- **Trivial变更**: UI调整、配置或文档更新
- **TDD**: Test-Driven Development（测试驱动开发）
- **E2E**: End-to-End（端到端测试）

### 故障排查

**Pre-commit hook失败**:
```bash
# 查看详细错误
git commit --no-verify -m "temp commit"

# 手动运行检查
npm run lint
npm run type-check
npm test
```

**覆盖率不达标**:
```bash
# 生成覆盖率报告
npm run test:coverage

# 查看未覆盖的代码
open coverage/index.html

# 针对性添加测试
# 使用测试模板: tests/templates/
```

**CI失败**:
1. 检查GitHub Actions日志
2. 本地复现问题
3. 修复后推送新commit

---

**维护者**: Development Team
**反馈**: 请通过GitHub Issues报告问题或提出改进建议
