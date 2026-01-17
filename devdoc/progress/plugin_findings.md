# Findings & Decisions - 持久化插件实现
<!--
  WHAT: 插件实现的知识库
  WHEN: 创建于 2026-01-15
-->

## Requirements
<!-- 插件功能需求 -->

### 计算稿纸插件
- 支持键盘输入数学表达式
- 实时显示计算结果
- 按 Enter 键固定结果并复制到下一行
- 显示历史计算记录和时间
- 支持删除记录
- 数据持久化

### Todo List 插件
- 类似滴答清单的 UI
- 创建、编辑、删除 todo
- 完成/未完成状态切换
- 显示创建时间
- 数据持久化

### 随手记插件
- 创建文本记录
- 编辑和删除记录
- 显示创建时间
- 数据持久化
- 支持搜索

## Technical Decisions
<!-- 技术决策 -->
| Decision | Rationale |
|----------|-----------|
| 使用 plugin_data 表存储数据 | 已有基础设施，便于备份/恢复 |
| 计算稿纸使用数组存储历史 | 简单的线性数据结构 |
| Todo List 使用数组存储任务 | 便于排序和筛选 |
| 随手记使用数组存储记录 | 简单直接 |
| 数据格式为 JSON | 灵活支持不同结构 |

## Plugin Data Structure
<!-- 插件数据结构 -->

### 计算稿纸 (calculator-pad)
```typescript
{
  plugin_id: 'calculator-pad',
  plugin_name: '计算稿纸',
  data: {
    history: Array<{
      id: string;
      expression: string;
      result: number;
      timestamp: string;
    }>
  }
}
```

### Todo List (todo-list)
```typescript
{
  plugin_id: 'todo-list',
  plugin_name: '待办清单',
  data: {
    todos: Array<{
      id: string;
      title: string;
      completed: boolean;
      createdAt: string;
    }>
  }
}
```

### 随手记 (quick-notes)
```typescript
{
  plugin_id: 'quick-notes',
  plugin_name: '随手记',
  data: {
    notes: Array<{
      id: string;
      content: string;
      createdAt: string;
      updatedAt: string;
    }>
  }
}
```

## Database Operations
<!-- 数据库操作 -->

### 保存插件数据
```typescript
await window.electron.ipcRenderer.invoke('db:save-plugin-data',
  'calculator-pad',      // plugin_id
  '计算稿纸',             // plugin_name
  '1.0.0',               // plugin_version
  JSON.stringify(data)   // data_json
);
```

### 读取插件数据
```typescript
const result = await window.electron.ipcRenderer.invoke('db:get-plugin-data', 'calculator-pad');
if (result) {
  const data = JSON.parse(result.data_json);
}
```

## UI Components
<!-- UI 组件规划 -->

### 计算稿纸 UI
- 表达式输入框（顶部）
- 实时结果显示区
- 历史记录列表（可滚动）
- 删除按钮（每条记录）

### Todo List UI
- 输入框 + 添加按钮（顶部）
- Todo 列表（可滚动）
- 复选框（完成状态）
- 删除按钮
- 创建时间显示

### 随手记 UI
- 搜索框（顶部）
- 新建按钮
- 笔记列表（卡片式）
- 编辑功能（点击展开）
- 删除按钮
- 创建时间显示

## Resources
<!-- 资源 -->
- 插件目录: src/renderer/components/plugins/
- 插件注册: src/main/plugins/
- 数据库操作: src/main/database/index.ts

## Issues Encountered
<!-- 问题记录 -->
| Issue | Resolution |
|-------|------------|
|       |            |

---
*Update this file after making discoveries*
