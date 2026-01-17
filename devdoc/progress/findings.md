# Findings & Decisions
<!--
  WHAT: 插件备份系统的知识库，记录所有发现和决策
  WHY: 上下文窗口有限，这是外部记忆
  WHEN: 创建于 2026-01-15
-->

## Requirements
<!-- 用户需求分解 -->
- 备份功能需要支持选择特定插件进行备份
- 恢复功能需要支持选择恢复特定插件或设置类型
- 插件数据需要独立存储，便于管理和迁移
- 保持向后兼容性，现有数据能正常迁移
- 提供友好的UI界面供用户选择

## Research Findings
<!-- 当前系统架构发现 -->

### 当前数据存储结构
1. **SQLite 数据库** (`data.db`)
   - `clock_settings` - 时钟设置
   - `keyboard_stats` - 键盘统计
   - `mouse_click_stats` - 鼠标点击统计
   - `mouse_move_stats` - 鼠标移动统计

2. **LocalStorage** (`desktop-tool-data`)
   - `appSettings` - 应用设置（主题、语言、面板透明度等）
   - `plugins` - 插件状态数组（PluginState[]）
     - id, enabled, favorite, order, lastUsed
     - customData - 插件自定义数据（JSON对象）

3. **当前备份机制** (BackupService.ts)
   - 只备份数据库文件 `data.db`
   - localStorage 数据未真正备份（只有占位符）
   - 全量备份，无法选择性备份
   - ZIP 格式，包含：data.db, localStorage.json, backup-info.json

4. **当前恢复机制** (BackupService.ts)
   - 全量覆盖数据库文件
   - 无选择性恢复功能
   - 无预览功能
   - 需要重启应用生效

### 插件数据现状
- 插件状态存储在 localStorage 的 `plugins` 数组中
- 每个插件的 customData 是一个 JSON 对象
- 插件数据和状态混在一起
- 无法单独备份某个插件的数据

## Technical Decisions
<!-- 技术决策 -->
| Decision | Rationale |
|----------|-----------|
| 创建 plugin_data 数据库表 | 独立存储插件数据，便于管理和查询 |
| 插件数据以 JSON BLOB 存储 | 灵活支持不同插件的数据结构 |
| 备份改为多文件结构 | 每个插件独立文件，便于选择性恢复 |
| 创建 backup_manifest 表 | 记录备份元数据，支持预览和选择 |
| 使用事务保证数据一致性 | 备份/恢复过程中使用数据库事务 |
| 提供 API 导出插件数据 | 便于从渲染进程获取 localStorage 数据 |

## Issues Encountered
<!-- 问题记录 -->
| Issue | Resolution |
|-------|------------|
| 当前 localStorage 数据未备份 | 需要创建 IPC 接口从渲染进程获取 |
| 插件 customData 结构不统一 | 使用 JSON 格式，每个插件自解释 |
| 恢复时可能覆盖用户数据 | 提供选项：覆盖/合并/跳过 |
| 需要重启应用才能生效 | 在恢复完成后自动重启 |

## Resources
<!-- 资源链接 -->
- 项目路径: /home/ryan/project/learn-ai/desktop-tool
- 数据库服务: src/main/database/index.ts
- 备份服务: src/main/services/BackupService.ts
- 存储服务: src/renderer/services/StorageService.ts
- 备份面板: src/renderer/components/BackupPanel.tsx

## Database Schema (Proposed)
<!-- 建议的数据库结构 -->

### plugin_data 表
```sql
CREATE TABLE IF NOT EXISTS plugin_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plugin_id TEXT NOT NULL UNIQUE,
  plugin_name TEXT NOT NULL,
  plugin_version TEXT,
  data_json TEXT NOT NULL, -- JSON string
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_plugin_data_plugin_id
  ON plugin_data(plugin_id);
```

### backup_manifest 表（可选）
```sql
CREATE TABLE IF NOT EXISTS backup_manifests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  backup_path TEXT NOT NULL,
  manifest_json TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Backup File Structure (Proposed)
<!-- 建议的备份文件结构 -->
```
backup-xxx.zip
├── manifest.json          # 备份元信息
│   ├── version
│   ├── createdAt
│   ├── plugins            # 包含的插件列表
│   ├── appSettings        # 是否包含应用设置
│   └── database           # 是否包含数据库
├── plugins/
│   ├── calculator.json    # 计算器插件数据
│   ├── color-picker.json  # 取色器插件数据
│   └── ...
├── app-settings.json      # 应用设置
└── data.db                # 数据库文件（统计等）
```

## UI/UX Considerations
<!-- 界面设计考虑 -->
- 备份界面：使用复选框列表让用户选择插件
- 恢复界面：显示备份内容预览，让用户选择要恢复的内容
- 提供全选/取消全选快捷操作
- 显示每个插件的数据大小
- 显示备份时间、版本等元信息

---
*Update this file after every 2 view/browser/search operations*
*This prevents visual information from being lost*
