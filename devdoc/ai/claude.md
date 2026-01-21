# AI 开发核心规范

> 本文档是 AI (Claude Code) 辅助开发的核心规范，包含必要的开发标准和流程。

**阅读入口**: 根目录 `/claude.md` 提供快速导航和参考。

---

## 1. 项目定位

### 核心理念

Desktop Tool 是一个**可扩展的桌面工具框架**，重点在于：

- 🏗️ **完整的插件架构** - 支持独立窗口、状态管理
- 🎨 **强大的主题系统** - 18+ 主题，CSS 变量驱动
- 🔧 **开发者友好的 API** - 插件开发简单快捷
- 📝 **完善的基础设施** - EventBus、Logger、IPC

### 当前状态

- ✅ **架构完成**：插件系统、主题系统、事件总线、日志系统
- ⚙️ **示例插件**：计算器、TodoList、Notepad、Base64、Crypto、OCR 等
- 🚧 **功能开发中**：更多插件待开发

### 设计目标

- 不是"开箱即用"的工具集
- 而是"快速开发工具"的框架
- 类似于：Electron 版的 VS Code 插件系统

### 核心架构

- **插件系统**: `src/renderer/components/PluginWindow/`, `src/main/plugins/manager.ts`
- **主题系统**: `src/renderer/themes/themes.ts`, `src/renderer/styles/global.css`
- **事件总线**: `src/renderer/utils/eventBus.ts`
- **日志系统**: `src/shared/logger/index.ts`

---

## 2. 开发规范

### 2.1 TDD 测试规范

#### 核心原则

```
开发新功能 = 编写测试 + 实现功能 + 测试通过
```

#### 测试要求

**当前阶段（早期开发）**：

- ✅ **关键组件添加基础测试**
- ✅ **核心功能编写测试用例**
- ✅ **所有测试必须通过才能提交代码**
- 🎯 **覆盖率目标：逐步提升（不要求 80%）**

**成熟阶段（功能完整后）**：

- 🎯 **测试覆盖率逐步提升至 60-80%**
- 🎯 **关键业务逻辑 100% 覆盖**
- 🎯 **完整的单元测试和集成测试**

#### 核心代码必须满足更高标准

**核心代码路径**（必须满足更高测试覆盖率）：

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

#### 测试类型

1. **单元测试**：测试单个组件、函数、类
2. **集成测试**：测试多个组件协作
3. **E2E 测试**：测试完整的用户流程

#### 测试命令

```bash
npm test                 # 运行所有测试
npm test -- --watch      # 监听模式
npm run test:coverage    # 生成覆盖率报告
npm run test:ui          # 可视化测试界面
```

### 2.2 日志规范

#### 日志级别使用原则

| 级别      | 用途         | 示例场景                       |
| --------- | ------------ | ------------------------------ |
| **DEBUG** | 开发调试信息 | 函数调用、变量值、中间状态     |
| **INFO**  | 重要业务流程 | 用户操作、状态变更、数据持久化 |
| **WARN**  | 警告信息     | 非预期数据、降级操作、性能问题 |
| **ERROR** | 错误信息     | 异常、失败操作、系统错误       |

#### 日志使用规范

```typescript
import { createLogger } from "../../shared/logger";

const logger = createLogger("ModuleName");

// 1. 函数入口（DEBUG 级别）
function processData(data: any) {
  logger.debug("processData called", {
    dataType: typeof data,
    size: data?.length,
  });
  // ...
}

// 2. 重要操作（INFO 级别）
async function saveUserData(userId: string, data: any) {
  try {
    await database.save(userId, data);
    logger.info("User data saved successfully", {
      userId,
      dataSize: JSON.stringify(data).length,
    });
  } catch (error) {
    logger.error("Failed to save user data", { userId, error: error.message });
    throw error;
  }
}

// 3. 警告信息（WARN 级别）
function validateEmail(email: string) {
  if (!email.includes("@")) {
    logger.warn("Invalid email format", {
      email,
      expectedFormat: "user@domain.com",
    });
    return false;
  }
  return true;
}
```

#### 日志最佳实践

```typescript
// ✅ 好的做法
logger.debug("Processing request", { userId, action, params });
logger.info("User logged in", { userId, timestamp });
logger.warn("Rate limit approaching", { currentRequests, limit });
logger.error("Database connection failed", { error, retryCount });

// ❌ 避免的做法
console.log("Debug info"); // 不要使用 console.log
console.error("Error"); // 使用 logger 替代
logger.info("Data:", data); // 数据应该作为第二个参数
```

### 2.3 代码规范

#### TypeScript 严格模式

- 无 `any` 类型（使用 `unknown`）
- 所有类型定义已导出和文档化
- 无来自缺失类型的隐式 `any`

#### CSS 变量强制使用

**核心原则**: 所有样式必须使用 CSS 变量以支持主题切换。

```css
/* ✅ 正确 */
.plugin-modal {
  background: var(--panel-background);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

/* ❌ 错误 */
.plugin-modal {
  background: rgba(255, 255, 255, 0.95); /* 硬编码！ */
  color: #1a1a2e; /* 硬编码！ */
}
```

**可用的 CSS 变量**:

```css
/* 文字颜色 */
--text-primary, --text-secondary, --text-tertiary

/* 背景色 */
--panel-background, --toolbar-bg, --overlay-bg

/* 按钮状态 */
--button-bg, --button-hover-bg

/* 主题色 */
--primary-color, --primary-text, --primary-color-light, --primary-color-dark

/* 功能色 */
--success-color, --warning-color, --error-color
```

#### 内联确认模式

**❌ 错误做法**: 使用原生弹窗

```typescript
// 不要这样做！
if (confirm("确定要删除吗？")) {
  deleteItem();
}
alert("删除成功！");
```

**✅ 正确做法**: 内联确认 + Toast 通知

```typescript
const [confirmingId, setConfirmingId] = useState<string | null>(null);
const [showToast, setShowToast] = useState(false);
const [toastMessage, setToastMessage] = useState('');

// 点击删除按钮
const handleDeleteClick = (id: string) => {
  setConfirmingId(id); // 显示确认按钮
};

// 确认删除
const confirmDelete = async (id: string) => {
  try {
    await deleteItem(id);
    setToastMessage('删除成功');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  } finally {
    setConfirmingId(null);
  }
};

// JSX
{confirmingId === item.id ? (
  <div className="confirm-buttons">
    <button onClick={() => confirmDelete(item.id)}>✓ 确认</button>
    <button onClick={cancelDelete}>✕ 取消</button>
  </div>
) : (
  <button onClick={() => handleDeleteClick(item.id)}>🗑️</button>
)}
```

#### 事件总线使用

**用途**: 渲染进程组件间通信，无需经过 IPC。

```typescript
import { eventBus, AppEvents } from "../utils/eventBus";

// 发送事件
eventBus.emit(AppEvents.PLUGINS_CHANGED);

// 监听事件
const cleanup = eventBus.on(AppEvents.PLUGINS_CHANGED, () => {
  // 处理事件
});

// 清理监听（重要！）
cleanup();

// 在 React 组件中使用
useEffect(() => {
  const handlePluginsChanged = () => {
    loadPlugins(); // 刷新插件列表
  };

  const cleanup = eventBus.on(AppEvents.PLUGINS_CHANGED, handlePluginsChanged);

  return () => {
    cleanup(); // 组件卸载时清理监听器
  };
}, []);
```

**适用场景**:

- ✅ 组件间状态同步
- ✅ 跨层级通信（避免 props drilling）
- ❌ 主进程和渲染进程通信（应使用 IPC）

### 2.4 变更分类

#### 变更类型

| 分类         | 标准                           | 测试要求          | 设计审批  | 文档要求       |
| ------------ | ------------------------------ | ----------------- | --------- | -------------- |
| **Critical** | 核心代码、破坏性变更、安全相关 | 80%覆盖+E2E+性能  | ✅ 必需   | 完整文档       |
| **Major**    | 新功能、架构变更               | 70%覆盖+集成测试  | ✅ 必需   | 完整文档       |
| **Minor**    | Bug修复、小增强                | 复现测试+边界测试 | ❌ 不需要 | 更新受影响部分 |
| **Trivial**  | UI调整、配置、文档             | 现有测试通过      | ❌ 不需要 | 如需则更新     |

#### 变更分类决策树

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

#### 破坏性变更示例

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

## 3. 开发流程

### 3.1 开发前检查清单

- [ ] 完全理解用户需求
- [ ] 识别受影响的模块
- [ ] 分类变更类型（Critical/Major/Minor/Trivial）
- [ ] 确定是否需要设计审批

**Critical/Major变更 - 必须创建设计文档**

参考模板: `doc/templates/DESIGN_DOC_TEMPLATE.md`

### 3.2 开发中检查清单

- [ ] 先编写测试用例（TDD）
- [ ] 实现功能代码
- [ ] 添加适当的日志（关键点）
- [ ] 运行测试确保通过
- [ ] 检查 TypeScript 类型

### 3.3 提交前检查清单

**测试验证**：

- [ ] 所有测试通过（`npm test`）
- [ ] **当前阶段**：基础测试覆盖核心功能
- [ ] **成熟阶段**：覆盖率达标（60-80%）（`npm run test:coverage`）
- [ ] 核心业务逻辑有测试覆盖
- [ ] 边界情况有对应测试

**代码检查**：

- [ ] TypeScript 类型检查通过（`npm run type-check`）
- [ ] ESLint 代码规范检查通过（`npm run lint`）
- [ ] 无 console.log，全部使用 logger
- [ ] 无 debugger 语句
- [ ] 无 TODO 或 FIXME 注释

**功能验证**：

- [ ] 手动测试主要功能
- [ ] 检查错误处理
- [ ] 验证边界情况
- [ ] 测试不同主题（浅色/深色）

**文档更新**：

- [ ] 更新相关文档
- [ ] 更新 CHANGELOG（如有重大变更）
- [ ] 添加或更新 API 文档

---

## 4. 提交规范

### Conventional Commits

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### 类型（type）

| 类型       | 说明      | 示例                                      |
| ---------- | --------- | ----------------------------------------- |
| `feat`     | 新功能    | feat(plugin): add hot reload feature      |
| `fix`      | Bug修复   | fix(database): handle migration error     |
| `docs`     | 文档更新  | docs(api): update plugin interface        |
| `style`    | 代码格式  | style: fix indentation                    |
| `refactor` | 重构      | refactor(logger): simplify error handling |
| `perf`     | 性能优化  | perf(window): reduce re-renders           |
| `test`     | 测试相关  | test(plugin): add window state tests      |
| `chore`    | 构建/工具 | chore: update dependencies                |

#### 示例

```bash
feat(plugin): add hot reload feature

- 实现文件监听
- 自动重新加载插件
- 保留插件状态

Closes #123
```

---

## 5. 常用命令

### 开发

```bash
npm run dev              # 启动开发服务器
npm start                # 启动 Electron
npm run build            # 构建项目
npm run dist             # 打包应用
```

### 测试

```bash
npm test                 # 运行所有测试
npm test -- --watch      # 监听模式
npm run test:coverage    # 生成覆盖率报告
npm run test:ui          # 测试 UI 界面
npm run test:e2e         # E2E 测试
```

### 代码质量

```bash
npm run type-check       # TypeScript 类型检查
npm run lint             # ESLint 检查
```

---

## 6. 参考文档

### 开发标准

- **测试指南**: `standards/testing.md` - 详细的测试策略和 TDD 流程
- **变更分类**: `standards/change_classification.md` - 详细的变更分类标准
- **代码审查清单**: `standards/code_review.md` - PR 审查检查点
- **快速参考**: `standards/quick_reference.md` - 常用命令和决策树

### 项目文档

- **项目说明**: `README.md`
- **插件开发**: `doc/PLUGIN_DEVELOPMENT.md`
- **构建指南**: `doc/BUILD.md`
- **贡献指南**: `doc/CONTRIBUTING.md`

### 开发进度

- **项目状态**: `progress/PROJECT_STATUS.md`
- **开发计划**: `plans/task_plan.md`

---

## 7. 常见问题

### Q: 当前测试覆盖率要求是多少？

A: 当前阶段（早期开发）：基础测试覆盖核心功能，不要求 80%。成熟阶段：覆盖率逐步提升至 60-80%。

### Q: 什么时候需要创建设计文档？

A: Critical 和 Major 变更必须创建设计文档并获得批准。

### Q: 如何判断变更类型？

A: 使用决策树：

1. 修改 src/main/ 或 src/shared/？ → Critical
2. 破坏性变更？ → Critical
3. 新功能？ → Major
4. Bug修复？ → Minor
5. 其他 → Trivial

### Q: 日志级别如何选择？

A: DEBUG（开发调试）、INFO（重要业务流程）、WARN（警告）、ERROR（错误）

### Q: 所有样式必须使用 CSS 变量吗？

A: 是的，所有样式必须使用 CSS 变量以支持主题切换。

### Q: 可以使用 confirm/alert 吗？

A: 不可以，必须使用内联确认 + Toast 通知。

---

**版本**: 2.0 (精简版)
**最后更新**: 2026-01-21
**维护者**: Development Team
