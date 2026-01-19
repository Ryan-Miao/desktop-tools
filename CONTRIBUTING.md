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

### 运行测试

```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行测试UI
npm run test:ui
```

### 手动测试

- 测试新增功能是否正常工作
- 检查是否有控制台错误
- 验证在不同平台上的表现

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
