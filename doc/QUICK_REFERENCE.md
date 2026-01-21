# 快速参考卡 (Quick Reference)

> AI开发规范快速参考 - 版本 1.0

## 🚀 快速开始

```bash
# 克隆项目
git clone <repo>
cd desktop-tool

# 安装依赖
npm install

# 启动开发
npm run dev  # 终端1
npm start   # 终端2
```

---

## 📊 变更分类决策树

```
修改 src/main/ 或 src/shared/？
├─ 是 → Critical (设计审批 + 80%测试)
└─ 否
    ├─ 破坏性变更？ → Critical (设计审批 + 80%测试)
    ├─ 新功能？ → Major (设计审批 + 70%测试)
    ├─ Bug修复？ → Minor (复现测试)
    └─ 其他 → Trivial (现有测试)
```

**快速记忆**:
- **Critical**: 核心、破坏、安全 → 设计文档 + 80%测试
- **Major**: 新功能、架构 → 设计文档 + 70%测试
- **Minor**: Bug修复、小增强 → 复现测试
- **Trivial**: UI、配置 → 现有测试

---

## ✅ 开发检查清单

### 开发前 (2分钟)

- [ ] 分类变更类型
- [ ] Critical/Major? → 创建设计文档
- [ ] 设计文档已批准?

### 开发中 (持续)

- [ ] 测试优先编写 (TDD)
- [ ] 频繁提交 (Conventional Commits)
- [ ] 每次提交后: `npm test`

### 提交前 (5分钟)

- [ ] `npm test` - 所有测试通过
- [ ] `npm run test:coverage` - 覆盖率达标
- [ ] `npm run lint` - Lint通过
- [ ] `npm run type-check` - 类型检查通过
- [ ] 无控制台错误
- [ ] 文档已更新

**核心代码额外要求**:
- [ ] 80%行/函数/语句覆盖率
- [ ] 70%分支覆盖率
- [ ] JSDoc完整
- [ ] 性能评估

---

## 📝 Commit消息格式

```
<type>(<scope>): <subject>

类型 (type):
  feat     新功能
  fix      Bug修复
  docs     文档更新
  style    代码格式
  refactor 重构
  perf     性能优化
  test     测试相关
  chore    构建/工具

示例:
  feat(plugin): add hot reload feature
  fix(database): handle migration error
  docs(api): update plugin interface
```

---

## 🧪 测试命令

```bash
# 运行所有测试
npm test

# 仅测试核心代码
npm run test:core

# 生成覆盖率报告
npm run test:coverage

# 验证核心代码 >= 80%
npm run test:verify-coverage

# 测试UI模式
npm run test:ui

# E2E测试
npm run test:e2e
```

**覆盖率要求**:
- 核心代码: **80%** (行/函数/语句), **70%** (分支)
- UI组件: 60% (行/函数/语句), 50% (分支)

---

## 🔧 常用命令

### 开发

```bash
npm run dev          # Vite开发服务器
npm start            # 启动Electron
npm run build        # 构建项目
npm run dist         # 打包应用
```

### 代码质量

```bash
npm run lint         # ESLint检查
npm run type-check   # TypeScript类型检查
npm test             # 运行测试
```

### Git Hooks (自动)

```bash
# Pre-commit: 自动运行
npx lint-staged      # eslint + prettier

# Commit-msg: 自动验证
npx commitlint       # conventional commits
```

---

## 📁 核心代码路径

**必须满足80%覆盖率**:
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

## 🎯 Critical变更流程

```
1. 创建设计文档
   cp doc/templates/DESIGN_DOC_TEMPLATE.md doc/designs/my-feature.md

2. 填写设计文档
   - 动机
   - 提议方案
   - 影响分析
   - 测试策略

3. 设计评审
   - 提交PR
   - 获得批准

4. TDD开发
   - 先写失败测试
   - 实现功能
   - 重构

5. 完整测试
   - 单元测试 (80%+)
   - 集成测试
   - E2E测试
   - 性能测试

6. 文档
   - API文档
   - 用户文档
   - 迁移指南 (如破坏性)
```

---

## ⚠️ 常见陷阱

### ❌ 错误做法

1. **低估核心代码变更**
   - 修改了 `src/main/` 但当作Minor处理

2. **跳过TDD**
   - 直接写代码，测试后补

3. **忽略破坏性变更**
   - 修改API但未创建迁移指南

4. **文档不完整**
   - 代码改了但文档没更新

### ✅ 正确做法

1. **先分类再开发**
   - 花1分钟确定变更类型

2. **测试优先**
   - 核心代码必须先写测试

3. **破坏性变更早沟通**
   - 提前创建迁移文档

4. **文档同步更新**
   - 代码和文档一起提交

---

## 📚 关键文档链接

| 文档 | 路径 | 用途 |
|------|------|------|
| AI开发规范 | `doc/AI_DEVELOPMENT_STANDARDS.md` | 完整标准 |
| 变更分类 | `doc/CHANGE_CLASSIFICATION.md` | 分类详解 |
| 代码评审清单 | `doc/CODE_REVIEW_CHECKLIST.md` | PR评审 |
| 测试指南 | `doc/TESTING.md` | TDD和测试 |
| 设计文档模板 | `doc/templates/DESIGN_DOC_TEMPLATE.md` | 设计模板 |
| 迁移指南模板 | `doc/templates/MIGRATION_GUIDE_TEMPLATE.md` | 迁移模板 |

---

## 🆘 快速故障排查

### Pre-commit失败

```bash
# 查看错误
git commit --no-verify -m "temp"

# 手动修复
npm run lint
npm run type-check
npm test

# 重新提交
git commit -m "feat: ..."
```

### 覆盖率不达标

```bash
# 生成报告
npm run test:coverage

# 查看未覆盖代码
open coverage/index.html

# 使用模板添加测试
cp tests/templates/unit-test.template.ts your.test.ts
```

### CI失败

1. 检查GitHub Actions日志
2. 本地复现: `npm run lint && npm run type-check && npm test`
3. 修复后推送

---

## 💡 最佳实践

### TDD循环

```
RED   → 编写失败测试
GREEN → 最少代码通过
REFACTOR → 重构保持通过
```

### 提交频率

- 小步快跑：每完成一个小功能就提交
- 提交信息清晰：描述"做了什么"，不是"怎么做"
- 频繁推送：每30分钟-1小时推送一次

### 代码评审

- PR大小：< 500行变更
- 描述清晰：说明为什么、影响什么
- 自审：先自己review一遍

---

## 🎓 学习资源

### 内部文档

- [贡献指南](./CONTRIBUTING.md)
- [插件开发](./doc/PLUGIN_DEVELOPMENT.md)
- [快速开始](./doc/QUICK_START.md)

### 外部资源

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Vitest文档](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)

---

## 📞 获取帮助

- **文档问题**: 查看doc/目录
- **Bug报告**: GitHub Issues
- **功能请求**: GitHub Discussions
- **安全问题**: security@example.com

---

**提示**: 将此文件加入书签，随时参考！

**版本**: 1.0
**最后更新**: 2026-01-21
**维护者**: Development Team
