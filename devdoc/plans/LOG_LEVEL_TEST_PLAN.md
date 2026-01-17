# Day 2.4: 日志级别过滤测试计划

## 测试目标
验证统一日志框架的级别过滤功能是否正常工作

## 测试环境
- 桌面模式: `npm run dev`
- Web模式: `npm run dev:web`

## 测试方法
在浏览器开发者工具控制台中执行测试函数

## 测试步骤

### 步骤1: 打开应用并进入控制台
1. 启动应用: `npm run dev`
2. 打开浏览器开发者工具 (F12)
3. 切换到 Console 标签
4. 等待应用加载完成（会看到初始化日志输出）

### 步骤2: 测试 DEBUG 级别 (显示所有日志)
在控制台执行:
```javascript
testLogLevel(0)
```

**预期结果**:
- 应该看到 4 条日志:
  - `[DEBUG] [测试] DEBUG日志 - 当前级别: DEBUG`
  - `[INFO] [测试] INFO日志 - 当前级别: DEBUG`
  - `[WARN] [测试] WARN日志 - 当前级别: DEBUG`
  - `[ERROR] [测试] ERROR日志 - 当前级别: DEBUG`
- 所有日志都应该显示（DEBUG是最低级别，不过滤任何日志）

### 步骤3: 测试 INFO 级别 (过滤 DEBUG)
在控制台执行:
```javascript
testLogLevel(1)
```

**预期结果**:
- 应该看到 3 条日志:
  - ~~`[DEBUG]`~~ （被过滤，不显示）
  - `[INFO] [测试] INFO日志 - 当前级别: INFO`
  - `[WARN] [测试] WARN日志 - 当前级别: INFO`
  - `[ERROR] [测试] ERROR日志 - 当前级别: INFO`
- DEBUG 日志应该被过滤掉（不显示）

### 步骤4: 测试 WARN 级别 (过滤 DEBUG 和 INFO)
在控制台执行:
```javascript
testLogLevel(2)
```

**预期结果**:
- 应该看到 2 条日志:
  - ~~`[DEBUG]`~~ （被过滤，不显示）
  - ~~`[INFO]`~~ （被过滤，不显示）
  - `[WARN] [测试] WARN日志 - 当前级别: WARN`
  - `[ERROR] [测试] ERROR日志 - 当前级别: WARN`
- DEBUG 和 INFO 日志应该被过滤掉（不显示）

### 步骤5: 测试 ERROR 级别 (只显示 ERROR)
在控制台执行:
```javascript
testLogLevel(3)
```

**预期结果**:
- 应该看到 1 条日志:
  - ~~`[DEBUG]`~~ （被过滤，不显示）
  - ~~`[INFO]`~~ （被过滤，不显示）
  - ~~`[WARN]`~~ （被过滤，不显示）
  - `[ERROR] [测试] ERROR日志 - 当前级别: ERROR`
- 只有 ERROR 日志显示，其他都被过滤

### 步骤6: 切换回 DEBUG 级别
在控制台执行:
```javascript
testLogLevel(0)
```

**预期结果**:
- 所有日志级别再次显示
- 验证级别切换是可逆的

## 验证日志文件（桌面模式）

在终端执行以下命令查看日志文件:
```bash
# 查看最新的日志
tail -f ~/.config/desktop-tool/logs/app.log
```

然后在控制台再次执行:
```javascript
testLogLevel(2)
```

**预期结果**:
- 控制台: 只显示 WARN 和 ERROR 日志
- 日志文件: 记录了所有日志（文件不过滤，用于后续查询）

## 测试检查清单

- [ ] DEBUG 级别显示所有日志
- [ ] INFO 级别过滤 DEBUG 日志
- [ ] WARN 级别过滤 DEBUG 和 INFO 日志
- [ ] ERROR 级别只显示 ERROR 日志
- [ ] 级别切换正常工作
- [ ] 桌面模式下日志文件记录所有日志
- [ ] Web模式下控制台输出正常
- [ ] 日志颜色正确（灰色DEBUG、蓝色INFO、黄色WARN、红色ERROR）

## 成功标准

1. **控制台输出过滤正确**: 只显示 >= minLevel 的日志
2. **日志文件不过滤**: 桌面模式下所有日志都写入文件
3. **级别切换正常**: setMinLevel() 立即生效
4. **可逆性**: 可以从高级别切换回低级别

## 预期的日志颜色

```
DEBUG: 灰色 (#9CA3AF)
INFO:  蓝色 (#3B82F6)
WARN:  黄色 (#F59E0B)
ERROR: 红色 (#EF4444)
```

## 故障排查

**问题**: testLogLevel 函数未定义
**解决**: 等待应用完全加载，确保 App.tsx 的 useEffect 已执行

**问题**: 日志级别设置后没有效果
**解决**: 检查 logger.setMinLevel() 是否正确调用，查看控制台是否有错误

**问题**: 桌面模式下日志文件没有写入
**解决**: 检查 ~/.config/desktop-tool/logs/ 目录权限，查看主进程控制台是否有错误

## 测试完成后的清理

测试完成后，建议将日志级别设置为 INFO (默认):
```javascript
testLogLevel(1)
```
