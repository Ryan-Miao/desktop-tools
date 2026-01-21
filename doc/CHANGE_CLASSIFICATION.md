# 变更分类指南 (Change Classification Guide)

## 概述

本指南提供详细的变更分类标准和示例，帮助开发者和AI助手正确分类代码变更。

**为什么需要变更分类？**
- 确保适当的测试覆盖
- 决定是否需要设计审批
- 确定文档要求
- 评估风险和影响

---

## 变更类型概览

| 类型 | 描述 | 测试要求 | 设计审批 | 文档 | 示例 |
|------|------|----------|----------|------|------|
| **Critical** | 核心代码、破坏性、安全 | 80%+E2E+性能 | ✅ | 完整 | 修改插件系统 |
| **Major** | 新功能、架构变更 | 70%+集成 | ✅ | 完整 | 添加新UI组件 |
| **Minor** | Bug修复、小增强 | 复现+边界 | ❌ | 部分 | 修复按钮样式 |
| **Trivial** | UI调整、配置 | 现有测试 | ❌ | 如需 | 更新颜色 |

---

## Critical变更

### 定义

满足以下任一条件即为Critical变更：

1. **核心代码修改**
   - `src/main/` 目录下的任何文件
   - `src/shared/types/` 类型定义
   - `src/shared/logger/` 日志框架
   - `src/renderer/services/` 存储服务

2. **破坏性变更**
   - 修改公共API接口
   - 更改插件manifest格式
   - 修改IPC handler签名
   - 更改TypeScript类型定义
   - 数据库schema变更
   - 移除已有功能

3. **安全相关**
   - 权限系统变更
   - 加密/解密逻辑
   - 文件系统访问
   - IPC安全
   - 数据验证

### 示例

#### ✅ Critical变更示例

**1. 修改插件管理器**
```typescript
// src/main/plugins/manager.ts
// 修改前
async loadPlugin(id: string): Promise<IPlugin>

// 修改后 (破坏性变更)
async loadPlugin(id: string, options?: LoadOptions): Promise<IPlugin>
```
**原因**: 修改核心代码，影响所有插件加载

**2. 更改类型定义**
```typescript
// src/shared/types/plugin.ts
// 修改前
interface IPlugin {
  id: string;
  name: string;
}

// 修改后 (破坏性变更)
interface IPlugin {
  id: string;
  name: string;
  version: string;  // 新增必需字段
}
```
**原因**: 类型定义变更，影响所有使用此接口的代码

**3. 数据库schema变更**
```typescript
// 修改前
CREATE TABLE todos (
  id TEXT PRIMARY KEY,
  title TEXT
);

// 修改后 (破坏性变更)
CREATE TABLE todos (
  id TEXT PRIMARY KEY,
  title TEXT,
  status TEXT NOT NULL DEFAULT 'pending'  -- 新增列
);
```
**原因**: 数据库结构变更，需要迁移

**4. IPC handler签名变更**
```typescript
// 修改前
ipcMain.handle('plugin:load', (event, id) => {...});

// 修改后 (破坏性变更)
ipcMain.handle('plugin:load', (event, id, force = false) => {...});
```
**原因**: IPC通信接口变更

#### ❌ 不是Critical的示例

**1. 内部实现重构**
```typescript
// 修改前
function processData(data: any[]) {
  return data.map(x => x * 2);
}

// 修改后 (重构，非破坏性)
function processData(data: any[]) {
  return data.reduce((acc, x) => [...acc, x * 2], []);
}
```
**原因**: 内部实现，外部行为不变

**2. 添加新的可选参数**
```typescript
// 修改前
function formatTime(date: Date): string

// 修改后 (向后兼容)
function formatTime(date: Date, format?: 'short' | 'long'): string
```
**原因**: 向后兼容的扩展

### Critical变更要求

**测试要求**:
- ✅ 80% 行/函数/语句覆盖率
- ✅ 70% 分支覆盖率
- ✅ E2E测试覆盖关键流程
- ✅ 性能基准测试

**审批要求**:
- ✅ 必须创建设计文档
- ✅ 技术lead批准
- ✅ 影响评估
- ✅ 迁移计划（如破坏性）

**文档要求**:
- ✅ 完整的设计文档
- ✅ API更新文档
- ✅ 迁移指南（如破坏性）
- ✅ 更新CHANGELOG

---

## Major变更

### 定义

满足以下条件为Major变更：

1. **新功能开发**
   - 添加新的用户功能
   - 新的UI组件
   - 新的服务或工具
   - 集成第三方服务

2. **架构变更**
   - 模块重组
   - 状态管理变更
   - 路由结构变更
   - 构建流程变更

### 示例

#### ✅ Major变更示例

**1. 添加新功能 - 任务拖拽**
```typescript
// 新增功能
export function useDragAndDrop() {
  // 实现拖拽逻辑
}
```
**原因**: 新的用户功能

**2. 新的UI组件**
```typescript
// src/renderer/components/Calendar/
// 新增日历组件（以前不存在）
export function Calendar() {...}
```
**原因**: 新的UI组件

**3. 状态管理重构**
```typescript
// 修改前：使用Context
const TodoContext = createContext(...);

// 修改后：使用Zustand
export const useTodoStore = create(...);
```
**原因**: 架构变更

**4. 添加第三方集成**
```typescript
// 新增云同步功能
export class CloudSyncService {
  async sync(): Promise<void> {...}
}
```
**原因**: 新功能，集成外部服务

#### ❌ 不是Major的示例

**1. Bug修复**
```typescript
// 修复按钮点击无效的bug
const handleClick = () => {
  // 修复前：缺少onClick
  onClick() // 添加缺失的处理
}
```
**原因**: 这是Minor（Bug修复）

**2. 样式调整**
```typescript
// 修改前
const style = { color: 'blue' };

// 修改后
const style = { color: 'red' };
```
**原因**: 这是Trivial（UI调整）

### Major变更要求

**测试要求**:
- ✅ 70% 行/函数/语句覆盖率
- ✅ 集成测试覆盖模块交互
- ✅ E2E测试覆盖主要流程

**审批要求**:
- ✅ 必须创建设计文档
- ✅ 技术lead批准
- ✅ 功能评审

**文档要求**:
- ✅ 完整的设计文档
- ✅ 用户使用文档
- ✅ API文档（如适用）
- ✅ 更新CHANGELOG

---

## Minor变更

### 定义

满足以下条件为Minor变更：

1. **Bug修复**
   - 修复现有功能的问题
   - 边界情况处理
   - 错误处理改进

2. **小增强**
   - 性能优化（不改变行为）
   - UX小改进
   - 添加日志或调试信息
   - 改善错误消息

### 示例

#### ✅ Minor变更示例

**1. Bug修复 - 边界条件**
```typescript
// 修复前：空数组导致错误
function getFirst(items: any[]) {
  return items[0].name;  // 可能报错
}

// 修复后：正确处理空数组
function getFirst(items: any[]) {
  return items[0]?.name ?? null;
}
```
**原因**: Bug修复

**2. 性能优化**
```typescript
// 修改前：每次都重新计算
function processLargeArray(data: any[]) {
  return data.map(expensiveCalculation);
}

// 修改后：添加缓存
const cache = new Map();
function processLargeArray(data: any[]) {
  return data.map(item => {
    if (cache.has(item.id)) return cache.get(item.id);
    const result = expensiveCalculation(item);
    cache.set(item.id, result);
    return result;
  });
}
```
**原因**: 性能优化，外部行为不变

**3. 改善错误消息**
```typescript
// 修改前
throw new Error('Error');

// 修改后
throw new Error(`Failed to load plugin ${id}: ${error.message}`);
```
**原因**: 改善用户体验，不改变功能

**4. 添加输入验证**
```typescript
// 修改前
function saveTodo(todo: Todo) {
  db.save(todo);
}

// 修改后：添加验证
function saveTodo(todo: Todo) {
  if (!todo.title) {
    throw new Error('Title is required');
  }
  db.save(todo);
}
```
**原因**: 增强健壮性

### Minor变更要求

**测试要求**:
- ✅ 复现bug的测试（如修复bug）
- ✅ 边界条件测试
- ✅ 确保现有测试通过

**审批要求**:
- ❌ 不需要设计文档
- ❌ 不需要特殊审批

**文档要求**:
- ✅ 更新相关文档
- ✅ 如适用，更新CHANGELOG

---

## Trivial变更

### 定义

满足以下条件为Trivial变更：

1. **纯UI调整**
   - 颜色、字体、间距调整
   - 不改变功能的样式变更

2. **配置更新**
   - 构建配置
   - 工具配置
   - 依赖版本更新（不改变API）

3. **文档更新**
   - 修正文档错误
   - 添加示例
   - 改善说明

4. **代码清理**
   - 重命名变量（改善可读性）
   - 提取常量
   - 添加注释
   - 移除无用代码

### 示例

#### ✅ Trivial变更示例

**1. 颜色调整**
```css
/* 修改前 */
.button { background: blue; }

/* 修改后 */
.button { background: red; }
```
**原因**: 纯视觉变更

**2. 字体大小调整**
```css
/* 修改前 */
.title { font-size: 16px; }

/* 修改后 */
.title { font-size: 18px; }
```
**原因**: 不改变功能的样式调整

**3. 更新依赖版本**
```json
// 修改前
"react": "^18.2.0"

// 修改后
"react": "^18.2.1"
```
**原因**: 补丁版本更新，无API变更

**4. 添加注释**
```typescript
// 修改前
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// 修改后：添加注释
/**
 * 计算购物车总价
 * @param items - 购物车商品列表
 * @returns 总价
 */
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```
**原因**: 仅添加文档

**5. 移除无用代码**
```typescript
// 修改前
const DEPRECATED = 'old value';  // 未使用
function newFunction() {...}

// 修改后：清理无用代码
function newFunction() {...}
```
**原因**: 代码清理

### Trivial变更要求

**测试要求**:
- ✅ 确保现有测试通过

**审批要求**:
- ❌ 不需要设计文档
- ❌ 不需要特殊审批

**文档要求**:
- 如需则更新

---

## 决策流程

### 快速决策树

```
是否修改 src/main/ 或 src/shared/？
├─ 是 → Critical
└─ 否
    是否有破坏性变更？
    ├─ 是 → Critical
    └─ 否
        是否是新功能？
        ├─ 是 → Major
        └─ 否
            是否是bug修复？
            ├─ 是 → Minor
            └─ 否 → Trivial
```

### 详细检查清单

#### Critical检查清单

- [ ] 修改核心代码（src/main/, src/shared/）？
- [ ] 修改公共API？
- [ ] 更改类型定义？
- [ ] 修改数据库schema？
- [ ] 修改IPC接口？
- [ ] 安全相关变更？
- [ ] 移除现有功能？

**满足任意一项 → Critical**

#### Major检查清单

- [ ] 添加新功能？
- [ ] 新建UI组件？
- [ ] 新建服务或模块？
- [ ] 架构重构？
- [ ] 集成第三方服务？
- [ ] 状态管理变更？

**满足任意一项 → Major**

#### Minor检查清单

- [ ] 修复bug？
- [ ] 性能优化（行为不变）？
- [ ] 增强错误处理？
- [ ] 添加输入验证？
- [ ] 改善错误消息？
- [ ] 添加日志？

**满足任意一项 → Minor**

#### Trivial检查清单

- [ ] 纯样式调整？
- [ ] 配置更新？
- [ ] 文档更新？
- [ ] 代码清理？
- [ ] 添加注释？
- [ ] 移除无用代码？

**满足任意一项 → Trivial**

---

## 混合变更

### 多个类型同时存在

当一次变更包含多个类型时，按**最高风险**分类：

```
Critical + Major = Critical
Major + Minor = Major
Minor + Trivial = Minor
```

### 示例

**1. Critical + Minor**
```typescript
// 添加新功能（Major）+ 修改核心代码（Critical）
// = Critical

export class PluginManager {
  // 修改核心方法（Critical）
  async loadPlugin(id: string): Promise<IPlugin> {
    // 新功能：缓存（Major）
    if (this.cache.has(id)) return this.cache.get(id);
    // ...
  }
}
```
**分类**: Critical（因为是核心代码修改）

**2. Major + Minor**
```typescript
// 新功能（Major）+ bug修复（Minor）
// = Major

export function TodoList() {
  // 新功能：拖拽排序（Major）
  const { drag } = useDragAndDrop();

  // 同时修复：边界条件（Minor）
  const filtered = todos?.filter(...) ?? [];
}
```
**分类**: Major（因为包含新功能）

---

## 特殊场景

### 重构

**重构不改变外部行为** → 根据位置分类

```typescript
// 在 src/main/ 中重构 → Critical
// 在 src/renderer/components/ 中重构 → Major/Minor
// 纯提取函数 → Minor
```

### 测试代码

**添加或修改测试** → Trivial

```typescript
// 添加新测试
it('should handle edge case', () => {...});
```
**分类**: Trivial

### 配置文件

**更新配置** → Trivial（除非是破坏性变更）

```typescript
// vitest.config.ts - 添加新reporter
// → Trivial

// tsconfig.json - 启用新的严格检查
// → Critical（影响所有代码）
```

---

## 常见错误

### ❌ 错误分类示例

**1. 低估核心代码变更**
```typescript
// 修改：src/main/database/index.ts
// 错误分类：Minor
// 正确分类：Critical（核心代码）
```

**2. 高估UI变更**
```typescript
// 修改：按钮颜色从blue改为red
// 错误分类：Minor
// 正确分类：Trivial（纯样式）
```

**3. 忽略破坏性变更**
```typescript
// 修改：添加必需的version字段
// 错误分类：Major
// 正确分类：Critical（破坏性变更）
```

---

## 工具和脚本

### 自动分类检测（未来）

```bash
# 检查变更类型
npm run check:change-type

# 输出示例
📊 变更分析报告
- Critical变更: 2个文件
  - src/main/plugins/manager.ts
  - src/shared/types/plugin.ts
- Major变更: 1个文件
  - src/renderer/components/Calendar/
建议分类: Critical
```

---

## 相关文档

- **AI开发规范**: `doc/AI_DEVELOPMENT_STANDARDS.md`
- **代码评审检查清单**: `doc/CODE_REVIEW_CHECKLIST.md`
- **设计文档模板**: `doc/templates/DESIGN_DOC_TEMPLATE.md`

---

**维护者**: Development Team
**最后更新**: 2026-01-21
**版本**: 1.0
