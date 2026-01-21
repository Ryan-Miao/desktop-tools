# 迁移指南: [功能/版本名称]

## 概述

本文档指导开发者从[旧版本]迁移到[新版本]。

**版本信息**:
- 旧版本: vX.Y.Z
- 新版本: vA.B.C
- 发布日期: [YYYY-MM-DD]
- 停止支持: [YYYY-MM-DD] (如适用)

---

## 迁移影响

### 谁需要迁移？

- [ ] 插件开发者
- [ ] 内部开发者
- [ ] 最终用户
- ] 其他: ___

### 迁移复杂度

- **时间估计**: [X分钟/X小时]
- **风险等级**: [低/中/高]
- **是否可回滚**: [是/否]

---

## 破坏性变更

### 变更1: [变更名称]

**描述**:
[详细描述变更内容]

**影响范围**:
- 受影响的API: `PluginManager.load()`
- 受影响的插件: 所有使用此API的插件

**迁移前**:
```typescript
// 旧代码
const plugin = await pluginManager.load(id);
```

**迁移后**:
```typescript
// 新代码
const plugin = await pluginManager.load(id, options);
```

**自动迁移**:
[是否有自动迁移脚本？]

**示例**:
是，使用 `npm run migrate:plugins`

### 变更2: [变更名称]

[类似格式]

---

## 数据迁移

### 数据库Schema变更

#### 变更1: [表/字段名称]

**描述**:
[描述schema变更]

**迁移脚本**:
```sql
-- 修改前
CREATE TABLE todos (
  id TEXT PRIMARY KEY,
  title TEXT
);

-- 修改后
ALTER TABLE todos ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';
```

**手动迁移步骤**:
```bash
# 运行迁移脚本
npm run migrate:database

# 或手动执行SQL
sqlite3 data.db < migrations/001_add_status.sql
```

**验证迁移**:
```bash
# 检查迁移结果
npm run verify:migration
```

#### 变更2: [另一个变更]

[类似格式]

### 用户数据迁移

**是否需要迁移用户数据？** [是/否]

**如果是，描述步骤**:

1. 备份现有数据
   ```bash
   cp -r ~/.desktop-tool ~/.desktop-tool.backup
   ```

2. 运行迁移工具
   ```bash
   npm run migrate:user-data
   ```

3. 验证数据完整性
   ```bash
   npm run verify:data
   ```

4. 清理备份 (确认成功后)
   ```bash
   rm -rf ~/.desktop-tool.backup
   ```

---

## API迁移

### 移除的API

#### API1: `[API名称]`

**移除原因**: [原因]

**替代方案**: [新的API或方法]

**示例**:
```typescript
// 旧API (已移除)
Plugin.on('activate', callback);

// 新API
Plugin.onEvent('activate', callback);
```

### 变更的API

#### API1: `[API名称]`

**变更内容**: [描述变更]

**参数变更**:
- 新增参数: `param3` (可选)
- 移除参数: `oldParam`
- 修改参数: `param2` (类型从 `string` 变为 `number`)

**示例**:
```typescript
// 旧签名
function processData(input: string, options: Options): Result;

// 新签名
function processData(input: string, options: Options, validate?: boolean): Result;
```

**迁移步骤**:
1. 添加新参数
2. 测试功能
3. 移除旧参数使用

### 新增的API

#### API1: `[API名称]`

**描述**: [新API功能]

**何时使用**: [使用场景]

**示例**:
```typescript
// 新API
const result = await newApiMethod();
```

---

## 插件迁移

### 插件Manifest变更

#### 变更1: [字段名称]

**描述**: [描述manifest变更]

**迁移前**:
```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "version": "1.0.0"
}
```

**迁移后**:
```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "minAppVersion": "2.0.0",
  "permissions": ["storage"]
}
```

**自动迁移**: [是/否]

**手动迁移步骤**:
1. 打开 `manifest.json`
2. 添加必需字段
3. 更新版本号
4. 测试插件加载

### 插件API变更

#### 变更1: [API名称]

**描述**: [API如何变更]

**旧用法**:
```typescript
// 旧API
app.api.getData();
```

**新用法**:
```typescript
// 新API
app.api.storage.get('data');
```

**迁移代码示例**:
```typescript
// 自动迁移脚本
function migratePluginCode(code: string): string {
  return code
    .replace(/app\.api\.getData\(\)/g, 'app.api.storage.get("data")')
    .replace(/app\.api\.setData\(([^)]+)\)/g, 'app.api.storage.set("data", $1)');
}
```

---

## 配置迁移

### 配置文件变更

#### 文件1: [配置文件路径]

**新增配置项**:
```json
{
  "newFeature": {
    "enabled": true,
    "option1": "value"
  }
}
```

**移除配置项**:
- `oldOption` (已弃用，使用 `newOption` 代替)

**修改配置项**:
```json
// 旧值
"timeout": 5000

// 新值 (单位从毫秒变为秒)
"timeout": 5

// 旧配置仍支持，但会显示警告
```

### 环境变量变更

#### 变量1: [变量名]

**旧变量**: `OLD_VAR_NAME`
**新变量**: `NEW_VAR_NAME`
**迁移时间**: [版本号]将停止支持旧变量

**迁移步骤**:
```bash
# 更新 .env 文件
sed -i 's/OLD_VAR_NAME/NEW_VAR_NAME/g' .env
```

---

## 依赖迁移

### NPM包变更

#### 包1: [包名称]

**旧版本**: `^1.0.0`
**新版本**: `^2.0.0`

**破坏性变更**:
- 变更1描述
- 变更2描述

**迁移步骤**:
```bash
# 更新package.json
npm install package@^2.0.0

# 运行测试
npm test

# 检查兼容性
npm run check:compatibility
```

### 系统依赖

#### 依赖1: [依赖名称]

**最低版本要求**: [版本号]

**检查兼容性**:
```bash
# 检查Node版本
node --version  # 需要 >= v18.0.0

# 检查操作系统
uname -a  # Linux/Mac/Windows
```

---

## 分步迁移指南

### 步骤1: 准备

**时间估计**: 5分钟

1. **备份现有数据**
   ```bash
   # 备份数据库
   cp -r ~/.desktop-tool/data ~/.desktop-tool/data.backup

   # 备份配置
   cp -r ~/.desktop-tool/config ~/.desktop-tool/config.backup
   ```

2. **创建新分支** (如适用)
   ```bash
   git checkout -b migrate-to-v2
   ```

3. **更新依赖**
   ```bash
   npm install
   ```

### 步骤2: 代码迁移

**时间估计**: 30分钟 - 2小时

1. **运行自动迁移工具**
   ```bash
   npm run migrate:code
   ```

2. **手动更新破坏性变更**
   - 检查编译错误
   - 更新受影响的代码
   - 参考"破坏性变更"章节

3. **更新测试**
   ```bash
   # 运行测试
   npm test

   # 修复失败的测试
   ```

### 步骤3: 数据迁移

**时间估计**: 10分钟

1. **运行数据迁移脚本**
   ```bash
   npm run migrate:database
   npm run migrate:user-data
   ```

2. **验证数据完整性**
   ```bash
   npm run verify:data
   ```

### 步骤4: 测试

**时间估计**: 30分钟

1. **单元测试**
   ```bash
   npm test
   ```

2. **集成测试**
   ```bash
   npm run test:integration
   ```

3. **E2E测试**
   ```bash
   npm run test:e2e
   ```

4. **手动测试**
   - [ ] 核心功能测试
   - [ ] 插件加载测试
   - [ ] 数据持久化测试

### 步骤5: 部署

**时间估计**: 15分钟

1. **构建应用**
   ```bash
   npm run build
   ```

2. **测试构建**
   ```bash
   npm run start
   ```

3. **打包发布**
   ```bash
   npm run dist
   ```

---

## 回滚计划

### 如果迁移失败

#### 选项1: 回滚代码

```bash
# 恢复到旧版本
git checkout v1.0.0

# 重新安装依赖
npm install

# 恢复数据
cp -r ~/.desktop-tool/data.backup ~/.desktop-tool/data
```

#### 选项2: 修复问题

[描述常见问题和修复方法]

### 回滚检查清单

- [ ] 代码已回滚
- [ ] 依赖已恢复
- [ ] 数据已恢复
- [ ] 配置已恢复
- [ ] 应用正常运行

---

## 常见问题

### Q1: [问题标题]

**问题**: [详细描述]

**答案**: [解决方案或解释]

**示例**:
**Q**: 迁移后插件无法加载

**A**: 检查manifest.json是否包含 `minAppVersion` 字段。

```bash
# 检查插件
npm run check:plugins

# 修复manifest
npm run fix:plugin-manifests
```

### Q2: [另一个问题]

[类似格式]

---

## 获取帮助

### 文档资源

- [API文档链接]
- [迁移博客文章]
- [视频教程]

### 社区支持

- [GitHub Issues](https://github.com/...)
- [讨论区](https://github.com/.../discussions)
- [Discord/Slack]

### 联系方式

- 邮件: support@example.com
- Twitter: @support

---

## 检查清单

### 迁移前

- [ ] 阅读完整文档
- [ ] 备份所有数据
- [ ] 评估迁移影响
- [ ] 准备回滚计划

### 迁移中

- [ ] 按步骤执行
- [ ] 验证每一步
- [ ] 记录问题
- [ ] 保持备份

### 迁移后

- [ ] 运行所有测试
- [ ] 手动验证功能
- [ ] 监控错误日志
- [ ] 收集用户反馈

- [ ] 清理备份 (确认成功后)
- [ ] 更新文档
- [ ] 分享经验

---

## 附录

### 术语表

| 术语 | 定义 |
|------|------|
| [术语1] | [定义] |
| [术语2] | [定义] |

### 代码片段

[额外的有用代码片段]

### 相关文档

- [设计文档](./DESIGN_DOC_TEMPLATE.md)
- [API文档](./API.md)
- [发布说明](./CHANGELOG.md)

---

**模板版本**: 1.0
**最后更新**: 2026-01-21

---

## 反馈

如果你在迁移过程中遇到问题或有建议，请：

1. 搜索现有Issue
2. 创建新Issue (使用模板: `migration-feedback`)
3. 联系维护团队

你的反馈帮助我们改进迁移体验！
