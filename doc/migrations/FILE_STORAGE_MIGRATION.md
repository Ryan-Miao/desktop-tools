# 文件存储系统改进总结

## 📋 改进概述

将 TodoList 和记事本的数据存储从 **localStorage** 迁移到 **文件系统**，使数据更易访问、备份和迁移。

---

## ✨ 主要改进

### 1. 数据存储位置变化

#### **之前（localStorage）**
```
浏览器localStorage
├── todo-storage (5-10MB限制)
└── notepad-notes (5-10MB限制)
```

#### **之后（文件系统）**
```
~/.config/desktop-tool/plugins-data/
├── todolist.json (无限制)
└── notepad.json (无限制)
```

---

## 📁 数据文件格式

### todolist.json 示例

```json
{
  "__meta": {
    "version": "1.0.0",
    "pluginId": "todolist",
    "savedAt": "2026-01-19T16:30:00.000Z",
    "appVersion": "1.0.0"
  },
  "todos": [
    {
      "id": "1737302400000abc",
      "title": "完成项目报告",
      "description": "包括Q4总结和Q1计划",
      "completed": false,
      "priority": "high",
      "dueDate": "2026-01-25",
      "listId": "list-work",
      "order": 0,
      "createdAt": "2026-01-19T08:00:00.000Z",
      "subtasks": []
    }
  ],
  "lists": [
    {
      "id": "list-work",
      "name": "工作",
      "icon": "💼",
      "color": "#10B981",
      "isInbox": false,
      "order": 1
    }
  ],
  "sortBy": "priority",
  "sortOrder": "desc",
  "showCompletedAtBottom": true
}
```

### notepad.json 示例

```json
{
  "__meta": {
    "version": "1.0.0",
    "pluginId": "notepad",
    "savedAt": "2026-01-19T16:30:00.000Z",
    "appVersion": "1.0.0"
  },
  [
    {
      "id": "1737302400000xyz",
      "title": "会议记录",
      "content": "今天讨论了...",
      "createdAt": "2026-01-19T10:00:00.000Z",
      "updatedAt": "2026-01-19T11:30:00.000Z"
    }
  ]
}
```

---

## 🔄 数据迁移流程

### 自动迁移逻辑

```
1. 应用启动
   ↓
2. 尝试从文件加载数据 (~/.config/desktop-tool/plugins-data/)
   ↓
3a. 文件存在 → 加载文件数据 ✅
   ↓
3b. 文件不存在 → 从localStorage迁移
   ↓
4. 读取localStorage数据
   ↓
5. 保存到文件系统
   ↓
6. 创建localStorage备份 (xxx-migrated-backup)
   ↓
7. 删除原localStorage数据
   ↓
8. 完成迁移 ✅
```

---

## 🆕 新增功能

### 1. 文件存储服务

#### 主进程服务 (`src/main/services/FileStorageService.ts`)

```typescript
// 主要功能
- savePluginData(pluginId, data)    // 保存插件数据
- loadPluginData(pluginId)           // 加载插件数据
- deletePluginData(pluginId)         // 删除插件数据
- hasPluginData(pluginId)            // 检查数据是否存在
- getAllPluginDataFiles()            // 获取所有插件数据文件列表
- exportPluginData(pluginId, path)   // 导出数据
- importPluginData(pluginId, path)   // 导入数据
- getDataDirectory()                 // 获取数据目录路径
- openDataDirectory()                // 在文件管理器中打开数据目录
```

#### 渲染进程服务 (`src/renderer/services/FileStorageService.ts`)

```typescript
// 通过IPC与主进程通信
- savePluginData(pluginId, data)
- loadPluginData(pluginId)
- migrateFromLocalStorage(pluginId, key)
- getDataDirectory()
- openDataDirectory()
```

### 2. IPC Handlers

新增文件存储相关的IPC handlers（`src/main/ipc/handlers.ts:556-601`）：

```typescript
// 文件存储操作
'file-storage:save'        → 保存插件数据
'file-storage:load'        → 加载插件数据
'file-storage:delete'      → 删除插件数据
'file-storage:exists'      → 检查数据是否存在
'file-storage:list'        → 列出所有插件数据文件
'file-storage:export'      → 导出插件数据
'file-storage:import'      → 导入插件数据
'file-storage:get-directory' → 获取数据目录路径
'file-storage:open-directory' → 打开数据目录
```

---

## 📊 改进对比

| 特性 | localStorage | 文件存储 |
|-----|-------------|---------|
| **容量限制** | 5-10MB | 无限制 |
| **数据访问** | 仅浏览器 | 任何文本编辑器 |
| **备份方式** | 导出JSON | 直接复制文件 |
| **跨设备同步** | 困难 | 简单（复制文件夹） |
| **数据迁移** | 需要应用支持 | 直接复制文件 |
| **版本控制** | 不友好 | 友好（Git等） |
| **数据分析** | 困难 | 简单（脚本处理） |
| **手动编辑** | DevTools | 任何编辑器 |

---

## 🎯 用户收益

### 1. 数据可见性

**之前**：数据隐藏在浏览器localStorage中，需要DevTools才能访问

**之后**：
```bash
# 查看数据目录
ls ~/.config/desktop-tool/plugins-data/

# 编辑TodoList数据
vim ~/.config/desktop-tool/plugins-data/todolist.json

# 查看记事本数据
cat ~/.config/desktop-tool/plugins-data/notepad.json
```

### 2. 数据备份

**之前**：
- 需要打开应用
- 导出功能
- 选择保存位置

**之后**：
```bash
# 直接复制整个数据文件夹
cp -r ~/.config/desktop-tool/plugins-data ~/backup/

# 或者备份单个插件
cp ~/.config/desktop-tool/plugins-data/todolist.json ~/backup/
```

### 3. 数据迁移

**场景：更换电脑或重装系统**

**之前**：
1. 打开应用
2. 导出所有数据
3. 传输到新设备
4. 在新设备上导入

**之后**：
```bash
# 直接复制配置文件夹
scp -r ~/.config/desktop-tool/ user@new-device:~/.config/desktop-tool/
```

### 4. 数据分析

**示例：统计任务完成情况**

```javascript
# 可以用任何脚本语言处理数据文件
cat ~/.config/desktop-tool/plugins-data/todolist.json | jq '.todos | length'

# 或者Python
import json
with json.load(open('todolist.json'))['todos'] as todos:
    completed = sum(1 for t in todos if t['completed'])
    print(f"完成率: {completed/len(todos)*100:.1f}%")
```

---

## 🔧 技术实现

### 1. 自动保存机制

**TodoList**:
```typescript
// 每次数据变更后自动保存
addTodo: (todoData) => {
  // ... 创建任务
  get().saveToFile(); // 自动保存
}
```

**Notepad**:
```typescript
// 防抖保存（500ms）
useEffect(() => {
  const timeoutId = setTimeout(() => {
    fileStorageService.savePluginData(PLUGIN_ID, notes);
  }, 500);
  return () => clearTimeout(timeoutId);
}, [notes]);
```

### 2. 数据一致性保证

- ✅ 每次修改立即保存
- ✅ 保存失败时记录错误日志
- ✅ localStorage备份保留
- ✅ 元数据记录保存时间和版本

### 3. 错误处理

```typescript
// 文件存储失败时的fallback
async savePluginData(pluginId: string, data: any): Promise<boolean> {
  try {
    if (!window.electron?.ipcRenderer) {
      // Web模式：fallback到localStorage
      localStorage.setItem(`${pluginId}-file-backup`, JSON.stringify(data));
      return false;
    }
    // 正常保存逻辑...
  } catch (error) {
    logger.error('Save failed', { error });
    return false;
  }
}
```

---

## 📝 数据文件结构

### 目录结构

```
~/.config/desktop-tool/
├── data.db                    # SQLite数据库（统计数据）
├── logs/                      # 日志文件
└── plugins-data/              # 插件数据（新增）
    ├── todolist.json          # TodoList数据
    ├── notepad.json           # 记事本数据
    ├── calculator.json        # 计算器数据（如果有）
    └── [其他插件].json        # 其他插件数据
```

### 文件元数据

每个数据文件都包含 `__meta` 字段：

```typescript
{
  "__meta": {
    "version": "1.0.0",                    // 数据格式版本
    "pluginId": "todolist",                 // 插件ID
    "savedAt": "2026-01-19T16:30:00.000Z", // 保存时间
    "appVersion": "1.0.0"                   // 应用版本
  },
  // 实际数据...
}
```

---

## 🚀 未来扩展

### 可能的改进

1. **数据压缩**：对大型插件数据启用压缩
2. **增量备份**：只保存变更部分
3. **云同步**：直接同步插件数据文件夹到云盘
4. **版本历史**：保留数据文件的历史版本
5. **冲突解决**：合并不同设备的数据冲突
6. **加密**：敏感数据的加密存储

### 扩展示例

```typescript
// 加密存储示例
const encryptedData = encrypt(data, userKey);
fileStorageService.savePluginData('secure-notes', encryptedData);

// 云同步示例
const syncFolder = path.join DropboxPath, 'desktop-tool-plugins');
fs.copyFileSync(pluginDataPath, syncFolder);
```

---

## ✅ 验证清单

### 数据迁移验证

- [x] 首次启动自动从localStorage迁移
- [x] 迁移后创建localStorage备份
- [x] 文件存储成功后删除原localStorage数据
- [x] 迁移失败时保留原数据

### 文件存储验证

- [x] TodoList数据正确保存到文件
- [x] 记事本数据正确保存到文件
- [x] 数据变更自动保存
- [x] 应用重启后数据正确加载

### 兼容性验证

- [x] Web模式下fallback到localStorage
- [x] 文件损坏时不影响应用启动
- [x] 错误日志正确记录

---

## 📖 使用示例

### 查看数据

```bash
# Linux/Mac
cat ~/.config/desktop-tool/plugins-data/todolist.json

# Windows
type %APPDATA%\desktop-tool\plugins-data\todolist.json
```

### 备份数据

```bash
# 备份所有插件数据
cp -r ~/.config/desktop-tool/plugins-data ~/backup/plugins-$(date +%Y%m%d)

# 备份单个插件
cp ~/.config/desktop-tool/plugins-data/todolist.json ~/backup/todolist-$(date +%Y%m%d).json
```

### 恢复数据

```bash
# 从备份恢复
cp ~/backup/todolist-20260119.json ~/.config/desktop-tool/plugins-data/todolist.json

# 重启应用即可生效
```

### 编辑数据

```bash
# 使用vim编辑
vim ~/.config/desktop-tool/plugins-data/todolist.json

# 或使用VSCode
code ~/.config/desktop-tool/plugins-data/todolist.json
```

---

## 🎉 总结

通过这次改进，TodoList和记事本的数据存储更加：

✅ **透明** - 用户可以直接访问数据文件
✅ **可靠** - 无容量限制，不依赖浏览器
✅ **灵活** - 易于备份、迁移、同步
✅ **专业** - 符合桌面应用标准

这是一个重要的架构升级，为未来的功能扩展（如云同步、版本控制、数据加密等）奠定了基础。
