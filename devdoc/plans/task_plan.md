# Task Plan: 插件数据独立备份与选择性恢复系统
<!--
  WHAT: 实现插件级别的数据独立备份和选择性恢复功能
  WHY: 当前系统只能全量备份，用户无法单独备份/恢复特定插件数据
  WHEN: 创建于 2026-01-15
-->

## Goal
实现插件级别的独立备份和选择性恢复系统，允许用户：
1. 备份时可以选择需要备份的插件（支持多选）
2. 恢复时可以选择需要恢复的插件或设置类型
3. 每个插件的数据独立存储，便于管理和迁移

## Current Phase
Phase 5: UI Implementation

## Phases

### Phase 1: Requirements & Discovery
- [x] 理解当前备份系统架构
- [x] 分析数据存储结构（SQLite + LocalStorage）
- [x] 设计插件独立存储方案
- [x] 设计备份/恢复选择界面
- **Status:** complete

### Phase 2: Database & Storage Refactoring
- [x] 创建 plugin_data 表存储插件数据
- [x] 添加插件数据操作方法（CRUD）
- [x] 创建插件数据 IPC 接口
- [ ] 迁移现有 localStorage 插件数据到数据库（可选，稍后处理）
- [ ] 创建备份元数据表（backup_manifest）
- **Status:** complete

### Phase 3: Backup Service Enhancement
- [x] 修改 BackupService 支持选择性备份
- [x] 实现插件数据导出接口
- [x] 创建备份清单文件（manifest.json）
- [x] 添加备份预览功能
- **Status:** complete

### Phase 4: Restore Service Enhancement
- [x] 修改 BackupService 支持选择性恢复
- [x] 实现插件数据导入接口
- [x] 添加恢复前预览和确认功能
- [ ] 处理数据冲突和合并逻辑（待实现）
- **Status:** complete

### Phase 5: UI Implementation
- [x] 设计并实现插件选择界面（备份时）
- [x] 设计并实现恢复选项界面
- [x] 添加备份预览界面
- [x] 添加恢复预览界面
- **Status:** complete

### Phase 6: Testing & Verification
- [ ] 测试单个插件备份/恢复
- [ ] 测试多插件备份/恢复
- [ ] 测试设置偏好备份/恢复
- [ ] 测试数据冲突处理
- [ ] 测试边界情况和错误处理
- **Status:** pending

## Key Questions
1. 插件数据应该存储在数据库还是独立文件？
   - 决策：数据库（便于事务管理和查询）
2. 如何处理插件数据的版本兼容性？
   - 需要在 manifest 中记录插件版本
3. 恢复时如何处理已存在的插件数据？
   - 需要提供选项：覆盖、合并、跳过
4. 是否需要支持增量备份？
   - 当前阶段不支持，仅全量备份
5. 如何处理插件间的依赖关系？
   - 暂不考虑，假设插件独立

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| 使用 SQLite 存储插件数据 | 便于事务管理、查询和数据完整性 |
| 插件数据以 JSON 格式存储 | 灵活支持不同插件的数据结构 |
| 创建 plugin_data 表 | 独立表便于管理和扩展 |
| 创建 backup_manifest 表 | 记录备份元信息，支持选择性恢复 |
| 备份文件结构改为多文件 | 每个插件一个 JSON 文件 + manifest |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
|       | 1       |            |

## Notes
- 当前系统使用 localStorage 存储插件状态（PluginState[]）
- 需要将 customData 迁移到数据库
- 备份文件使用 ZIP 格式，内部包含：
  - manifest.json（备份元信息）
  - plugins/{pluginId}.json（每个插件的数据）
  - app-settings.json（应用设置）
  - data.db（数据库统计等）
