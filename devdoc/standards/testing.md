# 测试指南 (Testing Guide)

## 目录

- [概述](#概述)
- [测试策略](#测试策略)
- [测试覆盖率要求](#测试覆盖率要求)
- [TDD开发流程](#tdd开发流程)
- [测试工具](#测试工具)
- [测试命令](#测试命令)
- [测试最佳实践](#测试最佳实践)
- [常见场景](#常见场景)

---

## 概述

本指南定义了Desktop Tool项目的测试标准、流程和最佳实践。

### 测试目标

1. **保证代码质量**: 通过测试捕获bug和回归问题
2. **支持重构**: 有测试的代码可以安全重构
3. **文档作用**: 测试即文档，展示代码的使用方式
4. **设计驱动**: TDD驱使开发者写出更好的代码

### 测试类型

| 测试类型     | 目的             | 工具                     | 覆盖率要求      |
| ------------ | ---------------- | ------------------------ | --------------- |
| **单元测试** | 测试独立函数/类  | Vitest                   | 核心代码 >= 80% |
| **集成测试** | 测试模块间协作   | Vitest + Testing Library | 核心代码 >= 70% |
| **E2E测试**  | 测试完整用户流程 | Playwright               | 关键流程 100%   |

---

## 测试策略

### 核心代码（强制测试）

以下代码必须达到80%测试覆盖率：

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

### 非核心代码（建议测试）

- UI组件: 60%覆盖率
- 插件代码: 60%覆盖率
- 工具函数: 80%覆盖率

---

## 测试覆盖率要求

### 覆盖率阈值

| 代码类型     | 行覆盖率 | 分支覆盖率 | 函数覆盖率 | 语句覆盖率 |
| ------------ | -------- | ---------- | ---------- | ---------- |
| **核心代码** | **80%**  | **70%**    | **80%**    | **80%**    |
| UI组件       | 60%      | 50%        | 60%        | 60%        |
| 插件代码     | 60%      | 50%        | 60%        | 60%        |
| 工具函数     | 80%      | 70%        | 80%        | 80%        |

### 验证覆盖率

```bash
# 运行测试并生成覆盖率报告
npm run test:coverage

# 验证核心代码覆盖率（CI中强制检查）
npm run test:verify-coverage
```

### 查看覆盖率报告

```bash
# 生成HTML报告
npm run test:coverage

# 在浏览器中打开
open coverage/index.html  # macOS
xdg-open coverage/index.html  # Linux
start coverage/index.html  # Windows
```

---

## TDD开发流程

### Red-Green-Refactor循环

```
1. RED:   编写失败的测试
2. GREEN: 编写最少代码使测试通过
3. REFACTOR: 重构代码保持测试通过
```

### TDD步骤

#### 1. 编写测试（失败）

```typescript
// tests/sum.test.ts
import { describe, it, expect } from "vitest";
import { sum } from "./sum";

describe("sum", () => {
  it("should add two numbers", () => {
    expect(sum(1, 2)).toBe(3);
  });
});
```

运行测试，确认失败：

```bash
npm test
# ❌ sum is not defined
```

#### 2. 实现功能（通过）

```typescript
// sum.ts
export function sum(a: number, b: number): number {
  return a + b;
}
```

运行测试，确认通过：

```bash
npm test
# ✅ sum tests pass
```

#### 3. 重构（保持通过）

```typescript
// sum.ts (重构后)
export const sum = (a: number, b: number): number => a + b;
```

运行测试，确认仍然通过：

```bash
npm test
# ✅ sum tests still pass after refactoring
```

### 何时使用TDD

**必须使用TDD**:

- ✅ 核心代码开发
- ✅ Bug修复（先写失败测试重现bug）
- ✅ 新功能开发
- ✅ API变更
- ✅ 重构

**可以后写测试**:

- 纯UI调整
- 文档更新
- 配置文件变更

---

## 测试工具

### Vitest

单元测试和集成测试框架。

**配置文件**: `vitest.config.ts`

```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 50,
        statements: 60,
      },
    },
  },
});
```

### Testing Library

React组件测试工具。

```typescript
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
```

### Playwright

E2E测试框架。

```typescript
import { test, expect } from "@playwright/test";
```

---

## 测试命令

### 单元测试

```bash
# 运行所有测试
npm test

# 监听模式（开发时使用）
npm run test:ui

# 生成覆盖率报告
npm run test:coverage

# 仅测试核心代码
npm run test:core

# 核心代码监听模式
npm run test:core:watch

# 验证核心代码覆盖率 >= 80%
npm run test:verify-coverage
```

### E2E测试

```bash
# 运行E2E测试
npm run test:e2e

# UI模式
npm run test:e2e:ui

# 调试模式
npm run test:e2e:debug
```

### CI命令

```bash
# 完整测试流程（CI中使用）
npm run lint && \
npm run type-check && \
npm run test:coverage && \
npm run test:verify-coverage && \
npm run test:e2e
```

---

## 测试最佳实践

### 1. AAA模式

每个测试遵循 Arrange-Act-Assert 模式：

```typescript
it("should calculate total price", () => {
  // Arrange (准备)
  const price = 100;
  const quantity = 2;
  const expectedTotal = 200;

  // Act (执行)
  const total = calculateTotal(price, quantity);

  // Assert (断言)
  expect(total).toBe(expectedTotal);
});
```

### 2. 测试命名

使用 "should" 陈述期望行为：

```typescript
// ✅ 好的命名
it("should return empty array when no items exist");
it("should throw error when input is invalid");
it("should update cache after fetching data");

// ❌ 不好的命名
it("test1");
it("works");
```

### 3. 一个测试一个断言

```typescript
// ✅ 好的实践
it("should return correct result", () => {
  expect(result.value).toBe(42);
});

it("should update timestamp", () => {
  expect(result.timestamp).toBeGreaterThan(0);
});

// ❌ 不好的实践
it("should do everything", () => {
  expect(result.value).toBe(42);
  expect(result.timestamp).toBeGreaterThan(0);
  expect(result.status).toBe("active");
});
```

### 4. 使用描述性变量名

```typescript
// ✅ 好的实践
const actualTotal = calculateTotal(100, 2);
const expectedTotal = 200;
expect(actualTotal).toBe(expectedTotal);

// ❌ 不好的实践
const a = calculateTotal(100, 2);
expect(a).toBe(200);
```

### 5. Mock外部依赖

```typescript
// ✅ Mock外部API
vi.mock("./api", () => ({
  fetchUser: vi.fn().mockResolvedValue({ id: 1, name: "John" }),
}));

// ❌ 不要mock被测试的模块
vi.mock("./sum", () => ({ sum: vi.fn() }));
const { sum } = require("./sum"); // 错误！
```

### 6. 测试边界条件

```typescript
describe("validateInput", () => {
  it("should handle empty string", () => {
    expect(validateInput("")).toBe(false);
  });

  it("should handle null", () => {
    expect(validateInput(null)).toBe(false);
  });

  it("should handle undefined", () => {
    expect(validateInput(undefined)).toBe(false);
  });

  it("should handle zero", () => {
    expect(validateInput(0)).toBe(false);
  });
});
```

### 7. 异步测试

```typescript
// ✅ 使用async/await
it('should fetch user', async () => {
  const user = await fetchUser(1);
  expect(user).toBeDefined();
});

// ✅ 使用waitFor
it('should display loading then data', async () => {
  render(<UserProfile />);
  expect(screen.getByTestId('loading')).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByTestId('data')).toBeInTheDocument();
  });
});

// ❌ 不要使用setTimeout
it('bad test', (done) => {
  setTimeout(() => {
    expect(data).toBe('ready');
    done();
  }, 1000);
});
```

### 8. 清理副作用

```typescript
describe("tests with side effects", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    cleanup();
  });
});
```

---

## 常见场景

### 场景1: 测试React组件

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import Counter from './Counter';

describe('Counter', () => {
  it('should increment count when button clicked', () => {
    render(<Counter />);

    const button = screen.getByRole('button', { name: /increment/i });
    const count = screen.getByTestId('count');

    expect(count).toHaveTextContent('0');

    fireEvent.click(button);
    expect(count).toHaveTextContent('1');

    fireEvent.click(button);
    expect(count).toHaveTextContent('2');
  });
});
```

### 场景2: 测试异步操作

```typescript
describe("UserService", () => {
  it("should fetch user data", async () => {
    const user = await UserService.fetch(1);
    expect(user.id).toBe(1);
    expect(user.name).toBeDefined();
  });

  it("should handle network error", async () => {
    vi.spyOn(api, "fetch").mockRejectedValue(new Error("Network error"));

    await expect(UserService.fetch(1)).rejects.toThrow("Network error");
  });
});
```

### 场景3: 测试Store/状态管理

```typescript
describe("useTodoStore", () => {
  beforeEach(() => {
    const store = useTodoStore.getState();
    store.todos = [];
  });

  it("should add todo", () => {
    const store = useTodoStore.getState();

    store.addTodo({
      title: "Test",
      completed: false,
    });

    expect(store.todos).toHaveLength(1);
    expect(store.todos[0].title).toBe("Test");
  });
});
```

### 场景4: 测试表单验证

```typescript
describe('LoginForm', () => {
  it('should show validation errors for empty fields', async () => {
    render(<LoginForm />);

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });
});
```

### 场景5: 测试错误处理

```typescript
describe("DatabaseService", () => {
  it("should handle connection error gracefully", async () => {
    vi.spyOn(db, "connect").mockRejectedValue(new Error("Connection failed"));

    const result = await DatabaseService.query("SELECT * FROM users");

    expect(result).toEqual([]);
    expect(logger.error).toHaveBeenCalledWith("Connection failed");
  });
});
```

### 场景6: 测试性能

```typescript
describe("Performance", () => {
  it("should process 10000 items within 1 second", () => {
    const items = Array.from({ length: 10000 }, (_, i) => i);
    const start = performance.now();

    processItems(items);

    const duration = performance.now() - start;
    expect(duration).toBeLessThan(1000);
  });
});
```

---

## 测试模板

项目提供了测试模板以加快测试编写：

- **单元测试模板**: `tests/templates/unit-test.template.ts`
- **集成测试模板**: `tests/templates/integration-test.template.ts`

使用模板：

```bash
# 复制模板
cp tests/templates/unit-test.template.ts src/main/services/__tests__/MyService.test.ts

# 编辑测试
vim src/main/services/__tests__/MyService.test.ts
```

---

## 持续集成

### CI检查流程

1. **Lint检查**: `npm run lint`
2. **类型检查**: `npm run type-check`
3. **单元测试**: `npm run test:coverage`
4. **覆盖率验证**: `npm run test:verify-coverage`
5. **E2E测试**: `npm run test:e2e`

### Pre-commit检查

每次commit前自动运行：

```bash
# Lint和Prettier
npx lint-staged

# Commit消息验证
npx commitlint --edit "$1"
```

---

## 故障排查

### 测试失败

1. **查看详细错误**:

   ```bash
   npm test -- --reporter=verbose
   ```

2. **运行特定测试文件**:

   ```bash
   npm test path/to/test.test.ts
   ```

3. **运行特定测试用例**:

   ```bash
   npm test -- -t "should do something"
   ```

4. **调试模式**:
   ```bash
   node --inspect-brk node_modules/.bin/vitest run
   ```

### 覆盖率不达标

1. **查看未覆盖的代码**:

   ```bash
   npm run test:coverage
   open coverage/index.html
   ```

2. **找出哪些文件需要更多测试**:

   ```bash
   npm run test:verify-coverage
   ```

3. **添加针对性测试**:
   - 查看HTML报告中的红色行
   - 为未覆盖的分支添加测试
   - 测试边界条件和错误处理

---

## 参考资料

- [Vitest文档](https://vitest.dev/)
- [Testing Library文档](https://testing-library.com/)
- [Playwright文档](https://playwright.dev/)
- [Testing Best Practices](https://testingjavascript.com/)

---

**文档版本**: 1.0
**最后更新**: 2026-01-21
**维护者**: Development Team
