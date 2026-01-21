# 贡献指南

感谢您对 Desktop Tool 项目的关注！我们欢迎各种形式的贡献。

## 开发环境设置

### 环境要求

- **Node.js**: >= 18.0.0 < 21.0.0
- **包管理器**: npm / yarn / pnpm
- **操作系统**: Windows 10+ / macOS 10.15+ / Linux (Ubuntu 20.04+)

### 安装步骤

```bash
# 1. 克隆仓库
git clone https://github.com/yourusername/desktop-tool.git
cd desktop-tool

# 2. 安装依赖
npm install

# 3. 启动开发模式
npm run dev

# 4. 在另一个终端启动Electron
npm start
```

## AI辅助开发规范

本项目使用AI辅助开发时，需要遵循特定的开发规范和流程。

### 核心原则

1. **代码质量优先**: AI生成的代码必须满足项目质量标准
2. **测试驱动**: 核心代码变更必须先编写测试
3. **文档完整**: 所有变更需要适当的文档
4. **安全第一**: 不引入安全漏洞

### 变更分类

在开始开发前，请先分类你的变更：

| 类型 | 描述 | 测试要求 | 设计审批 |
|------|------|----------|----------|
| **Critical** | 核心代码、破坏性变更、安全 | 80%覆盖+E2E+性能 | ✅ 必需 |
| **Major** | 新功能、架构变更 | 70%覆盖+集成测试 | ✅ 必需 |
| **Minor** | Bug修复、小增强 | 复现测试+边界测试 | ❌ 不需要 |
| **Trivial** | UI调整、配置、文档 | 现有测试通过 | ❌ 不需要 |

**变更分类决策树**:
```
是否修改 src/main/ 或 src/shared/？
├─ 是 → Critical（需要设计审批 + 80%测试）
└─ 否 → 是否有破坏性变更？
    ├─ 是 → Critical（需要设计审批 + 80%测试）
    └─ 否 → 是否是新功能？
        ├─ 是 → Major（需要设计审批 + 70%测试）
        └─ 否 → 是否是bug修复？
            ├─ 是 → Minor（需要复现测试）
            └─ 否 → Trivial（现有测试通过即可）
```

### Critical/Major变更流程

**对于Critical或Major变更，必须**:

1. **创建设计文档** (使用模板: `doc/templates/DESIGN_DOC_TEMPLATE.md`)
   ```bash
   cp doc/templates/DESIGN_DOC_TEMPLATE.md doc/designs/my-feature.md
   ```

2. **设计评审**
   - 提交设计文档供评审
   - 获得批准后开始开发

3. **TDD开发**
   - 先编写失败的测试
   - 实现功能使测试通过
   - 重构保持测试通过

4. **完整测试**
   - 单元测试 (>= 70-80% 覆盖率)
   - 集成测试
   - E2E测试
   - 性能测试

5. **文档更新**
   - API文档
   - 用户文档
   - 迁移指南（如破坏性变更）

### 开发检查点

**开发前**:
- [ ] 分类变更类型
- [ ] 如Critical/Major，创建设计文档
- [ ] 设计文档已批准

**开发中**:
- [ ] 测试优先编写（TDD）
- [ ] 频繁提交（Conventional Commits）
- [ ] 每次提交后运行测试
- [ ] 检查类型错误

**提交前**:
- [ ] 所有测试通过
- [ ] 覆盖率达标
- [ ] Lint通过
- [ ] 类型检查通过
- [ ] 无控制台错误
- [ ] 文档已更新

### 详细规范

完整的AI开发规范请参考:
- [AI开发规范](./doc/AI_DEVELOPMENT_STANDARDS.md) - 完整的开发标准和流程
- [变更分类指南](./doc/CHANGE_CLASSIFICATION.md) - 详细的变更分类标准和示例
- [代码评审检查清单](./doc/CODE_REVIEW_CHECKLIST.md) - PR评审检查清单
- [测试指南](./doc/TESTING.md) - TDD流程和最佳实践

### Pre-commit自动化

项目配置了pre-commit hooks，每次commit前自动运行：

```bash
# Lint和格式化
npx lint-staged

# Commit消息格式验证
npx commitlint --edit "$1"
```

### CI/CD自动化

Pull Request会自动运行：

```bash
npm run lint
npm run type-check
npm run test:coverage
npm run test:verify-coverage
npm run test:e2e
```

---

## 代码规范

### TypeScript

- 使用 TypeScript 进行类型检查
- 遵循项目的 ESLint 配置
- 运行 `npm run type-check` 检查类型

### 代码风格

- 遵循现有的代码风格
- 使用有意义的变量和函数名
- 添加必要的注释
- 保持函数简短和专注

### 提交信息规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/zh-CN/) 规范：

```
<类型>(<范围>): <简短描述>

<详细描述>

<页脚>
```

**类型**:
- `feat`: 新功能
- `fix`: 问题修复
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具链相关

**示例**:
```
feat(plugin): add markdown preview for Notepad

- Add preview/edit mode toggle
- Support GitHub Flavored Markdown
- Add syntax highlighting for code blocks

Closes #123
```

## Pull Request 流程

### 1. Fork 仓库

点击 GitHub 页面右上角的 Fork 按钮

### 2. 创建分支

```bash
git checkout -b feature/your-feature-name
```

### 3. 提交变更

```bash
git add .
git commit -m "feat: add your feature"
```

### 4. 推送到 Fork

```bash
git push origin feature/your-feature-name
```

### 5. 创建 Pull Request

- 在 GitHub 上打开 Pull Request
- 填写 PR 模板
- 等待代码审查

## 测试要求

### 测试策略

我们采用**测试驱动开发（TDD）**方法，遵循以下原则：

1. **测试优先**: 在编写功能代码之前先编写测试
2. **覆盖率要求**:
   - 核心代码: 80% 行/函数/语句覆盖率，70% 分支覆盖率
   - UI组件: 60% 行/函数/语句覆盖率，50% 分支覆盖率
   - 工具函数: 80% 行/函数/语句覆盖率，70% 分支覆盖率

### 什么代码需要测试？

**必须测试（核心代码）**:
- `src/main/` - 整个主进程
- `src/shared/types/` - 类型定义
- `src/shared/logger/` - 日志框架
- `src/renderer/services/` - 渲染服务

**建议测试**:
- UI组件
- 插件代码
- 工具函数

### 运行测试

```bash
# 运行所有测试
npm test

# 仅测试核心代码
npm run test:core

# 生成覆盖率报告
npm run test:coverage

# 验证核心代码覆盖率 >= 80%
npm run test:verify-coverage

# 测试UI模式
npm run test:ui

# E2E测试
npm run test:e2e
```

### 测试模板

项目提供了测试模板以加快测试编写：

- **单元测试**: `tests/templates/unit-test.template.ts`
- **集成测试**: `tests/templates/integration-test.template.ts`

### 测试文档

详细的测试指南请参考: [测试指南](./doc/TESTING.md)

## 插件开发

### 插件文档

详细的插件开发指南请参考：
- [插件开发指南](./doc/PLUGIN_DEVELOPMENT.md)
- [快速开始](./doc/QUICK_START.md)

### 插件示例

参考现有插件实现：
- [Calculator Plugin](./plugins/calculator/)
- [TodoList Plugin](./plugins/todo-list/)

## 报告问题

在提交 Issue 前，请：

1. 搜索现有的 Issue
2. 使用清晰的标题描述问题
3. 提供复现步骤
4. 附上截图或错误日志
5. 说明您的环境信息（操作系统、Node 版本等）

## 行为准则

- 尊重所有贡献者
- 欢迎新手并帮助他们学习
- 关注建设性的反馈
- 以身作则，展现成熟的行为

## 许可证

通过贡献代码，您同意您的贡献将根据项目的 [MIT 许可证](./LICENSE) 进行许可。

---

再次感谢您的贡献！
