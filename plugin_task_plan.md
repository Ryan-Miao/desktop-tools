# Task Plan: 三个持久化插件的实现与备份测试
<!--
  WHAT: 实现三个持久化插件并测试备份恢复功能
  WHY: 验证插件独立备份和恢复功能是否正常工作
  WHEN: 创建于 2026-01-15
-->

## Goal
实现三个支持数据持久化的插件（计算稿纸、Todo List、随手记），并验证插件数据备份和恢复功能。

## Current Phase
Phase 1: 插件规划与设计

## Phases

### Phase 1: 插件规划与设计
- [x] 分析三个插件的功能需求
- [x] 设计插件数据结构
- [x] 规划插件 UI 布局
- [ ] 创建插件基础文件结构
- **Status:** in_progress

### Phase 2: 计算稿纸插件实现
- [ ] 创建插件组件和样式
- [ ] 实现表达式实时计算功能
- [ ] 实现历史记录管理
- [ ] 实现数据持久化到数据库
- [ ] 添加删除功能
- **Status:** pending

### Phase 3: Todo List 插件实现
- [ ] 创建插件组件和样式
- [ ] 实现 todo CRUD 功能
- [ ] 实现完成状态切换
- [ ] 实现数据持久化到数据库
- [ ] 添加日期和时间戳
- **Status:** pending

### Phase 4: 随手记插件实现
- [ ] 创建插件组件和样式
- [ ] 实现文本记录 CRUD
- [ ] 实现数据持久化到数据库
- [ ] 添加搜索和筛选功能
- **Status:** pending

### Phase 5: 插件注册与集成
- [ ] 在插件列表中注册新插件
- [ ] 测试插件基本功能
- [ ] 验证数据持久化
- **Status:** pending

### Phase 6: 备份恢复测试
- [ ] 测试单个插件备份
- [ ] 测试多插件备份
- [ ] 测试选择性恢复
- [ ] 验证数据完整性
- **Status:** pending

## Key Questions
1. 计算稿纸如何处理表达式解析？
   - 使用 eval() 或安全的表达式解析库
2. Todo List 需要哪些字段？
   - 标题、描述、完成状态、优先级、截止日期、创建时间
3. 随手记是否需要富文本编辑？
   - 第一版使用纯文本，后续可扩展
4. 如何确保数据在插件间独立？
   - 每个插件使用独立的 plugin_id 存储数据

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| 使用 SQLite 存储插件数据 | 已有 plugin_data 表，便于管理 |
| 计算稿纸使用 eval() | 简单实现，后续可替换为安全方案 |
| Todo List 类似滴答清单 | 简洁的 UI，核心功能优先 |
| 所有插件支持 CRUD | 完整的数据操作能力 |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
|       | 1       |            |

## Notes
- 三个插件都需要使用 `window.electron.ipcRenderer.invoke('db:save-plugin-data')` 保存数据
- 插件数据结构：`{ plugin_id, plugin_name, data: {...} }`
- 每次修改数据后立即保存到数据库
