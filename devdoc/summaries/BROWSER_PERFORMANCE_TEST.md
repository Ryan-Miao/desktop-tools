# 浏览器性能测试指南

## 测试说明

这份指南将帮助你完成浏览器端的性能测试。所有测试都可以通过在浏览器控制台中执行命令来完成。

---

## 准备工作

### 1. 打开开发者工具
在 Electron 应用窗口中：
- 按 **F12** 或 **Ctrl+Shift+I** 打开开发者工具
- 切换到 **Console** 标签

### 2. 等待应用加载完成
确保应用完全启动，控制台中没有错误信息

---

## 测试 1：基础性能测试（1000条日志）

### 执行命令
```javascript
testLogPerformance(1000)
```

### 预期结果
- ✅ 总耗时 < 500ms
- ✅ 平均每条日志 < 0.5ms
- ✅ UI 保持响应（可以移动鼠标）
- ✅ 控制台显示绿色成功消息

### 记录结果
```
总耗时: ___ ms
平均每条: ___ ms
内存使用: ___ MB
```

---

## 测试 2：压力测试（10000条日志）

### 执行命令
```javascript
testLogPerformance(10000)
```

### 预期结果
- ✅ 总耗时 < 3秒
- ✅ 平均每条日志 < 0.3ms
- ✅ UI 最终恢复响应
- ✅ 没有内存泄漏警告

### 记录结果
```
总耗时: ___ ms
平均每条: ___ ms
内存使用: ___ MB
```

---

## 测试 3：UI 响应性测试

### 执行命令
```javascript
// 启动 UI 响应性监控
const uiTestInterval = setInterval(() => {
  console.log('%c[UI测试] %c页面仍然响应 - ' + new Date().toLocaleTimeString(),
    'font-weight: bold',
    'color: #4caf50');
}, 500);

// 立即执行性能测试
testLogPerformance(5000)

// 测试完成后停止监控（10秒后）
setTimeout(() => {
  clearInterval(uiTestInterval);
  console.log('%c[UI测试] %c测试完成', 'font-weight: bold', 'color: #2196f3');
}, 10000);
```

### 验证方法
- ✅ 在日志写入期间，`[UI测试]` 消息应该**持续输出**
- ✅ 鼠标移动流畅，没有卡顿
- ✅ 证明主线程没有被阻塞

---

## 测试 4：内存使用测试

### 执行命令
```javascript
async function testMemoryUsage() {
  console.log('%c=== 内存使用测试 ===', 'color: #2196f3; font-weight: bold; font-size: 14px');

  // 第一次测试
  console.log('第一次测试（1000条日志）...');
  const result1 = await testLogPerformance(1000);
  console.log('%c第一次内存使用:', 'color: #ff9800', result1.memoryUsed, 'MB');

  // 等待垃圾回收
  console.log('等待垃圾回收...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 第二次测试
  console.log('第二次测试（1000条日志）...');
  const result2 = await testLogPerformance(1000);
  console.log('%c第二次内存使用:', 'color: #ff9800', result2.memoryUsed, 'MB');

  // 分析结果
  const memoryDiff = Math.abs(parseFloat(result2.memoryUsed) - parseFloat(result1.memoryUsed));
  console.log('%c=== 测试结果 ===', 'color: #4caf50; font-weight: bold');
  console.log('内存差异:', memoryDiff.toFixed(2), 'MB');

  if (memoryDiff < 0.5) {
    console.log('%c✅ 优秀：内存使用稳定，无内存泄漏', 'color: #4caf50; font-weight: bold');
  } else if (memoryDiff < 2) {
    console.log('%c✓ 良好：内存使用基本稳定', 'color: #8bc34a; font-weight: bold');
  } else {
    console.log('%c⚠️ 警告：可能有轻微内存泄漏', 'color: #ff9800; font-weight: bold');
  }
}

// 执行测试
testMemoryUsage()
```

### 预期结果
- ✅ 两次测试的内存使用相近
- ✅ 内存差异 < 0.5 MB
- ✅ 无明显内存增长

---

## 测试 5：动画性能测试

### 测试步骤

1. **打开 Performance 标签**
   - 按 **F12** 打开开发者工具
   - 切换到 **Performance** 标签

2. **开始录制**
   - 点击 🔴 **录制** 按钮（圆点）
   - 或者按 **Ctrl+E**

3. **执行动画**
   - 点击"插件开发" → "计算稿纸"
   - 观察窗口打开动画
   - 等待 1-2 秒
   - 点击窗口关闭按钮（×）
   - 观察窗口关闭动画

4. **停止录制**
   - 点击 🔴 **停止** 按钮
   - 或者按 **Ctrl+E**

5. **分析结果**
   - 查看 **FPS** 图表（应该在 60fps 附近）
   - 查看 **Frames** 部分
   - 检查是否有红色标记（长任务）

### 预期结果
```
平均 FPS: ___
最低 FPS: ___
长任务数量: ___
```

**成功标准：**
- ✅ 平均 FPS ≥ 55
- ✅ 最低 FPS ≥ 30
- ✅ 没有长任务（>50ms）

---

## 测试 6：启动时间测试

### 测试步骤

1. **完全关闭应用**
   - 关闭所有 Electron 窗口
   - 或者使用 `pkill -f electron`

2. **启动应用并计时**
   ```bash
   time npm run dev
   ```

3. **记录时间**
   - **启动时间**：从命令执行到窗口出现
   - **首屏渲染**：从窗口出现到内容完全显示

### 预期结果
```
启动时间: ___ 秒
首屏渲染: ___ 毫秒
```

**成功标准：**
- ✅ 启动时间 < 5 秒
- ✅ 首屏渲染 < 1 秒

---

## 测试 7：综合性能测试（一键测试）

### 执行命令
```javascript
async function runAllPerformanceTests() {
  console.clear();
  console.log('%c╔══════════════════════════════════════════════════════╗',
    'color: #00bcd4; font-weight: bold');
  console.log('%c║          综合性能测试套件 v1.0                    ║',
    'color: #00bcd4; font-weight: bold');
  console.log('%c╚══════════════════════════════════════════════════════╝',
    'color: #00bcd4; font-weight: bold');
  console.log('');

  const results = {};

  // 测试 1: 基础测试（1000条）
  console.log('%c【测试 1/4】基础性能测试（1000条日志）',
    'color: #2196f3; font-weight: bold');
  results.test1 = await testLogPerformance(1000);
  console.log('');

  // 等待
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 测试 2: 压力测试（5000条）
  console.log('%c【测试 2/4】压力测试（5000条日志）',
    'color: #2196f3; font-weight: bold');
  results.test2 = await testLogPerformance(5000);
  console.log('');

  // 等待
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 测试 3: 内存测试
  console.log('%c【测试 3/4】内存使用测试',
    'color: #2196f3; font-weight: bold');
  const result1 = await testLogPerformance(1000);
  await new Promise(resolve => setTimeout(resolve, 2000));
  const result2 = await testLogPerformance(1000);
  const memoryDiff = Math.abs(parseFloat(result2.memoryUsed) - parseFloat(result1.memoryUsed));
  results.memoryTest = {
    first: result1.memoryUsed,
    second: result2.memoryUsed,
    diff: memoryDiff.toFixed(2) + ' MB'
  };
  console.log('');

  // 总结
  console.log('%c╔══════════════════════════════════════════════════════╗',
    'color: #4caf50; font-weight: bold');
  console.log('%c║              测试结果汇总                          ║',
    'color: #4caf50; font-weight: bold');
  console.log('%c╚══════════════════════════════════════════════════════╝',
    'color: #4caf50; font-weight: bold');
  console.log('');
  console.log('%c测试 1（1000条）:', 'color: #2196f3; font-weight: bold',
    `${results.test1.duration.toFixed(2)}ms`,
    `(${results.test1.avgTime.toFixed(3)}ms/条)`);
  console.log('%c测试 2（5000条）:', 'color: #2196f3; font-weight: bold',
    `${results.test2.duration.toFixed(2)}ms`,
    `(${results.test2.avgTime.toFixed(3)}ms/条)`);
  console.log('%c内存差异:', 'color: #2196f3; font-weight: bold', results.memoryTest.diff);
  console.log('');

  // 评估
  let allPassed = true;

  if (results.test1.duration < 500) {
    console.log('%c✅ 测试1 通过', 'color: #4caf50; font-weight: bold');
  } else {
    console.log('%c❌ 测试1 失败：耗时 > 500ms', 'color: #f44336; font-weight: bold');
    allPassed = false;
  }

  if (results.test2.duration < 3000) {
    console.log('%c✅ 测试2 通过', 'color: #4caf50; font-weight: bold');
  } else {
    console.log('%c❌ 测试2 失败：耗时 > 3000ms', 'color: #f44336; font-weight: bold');
    allPassed = false;
  }

  if (memoryDiff < 0.5) {
    console.log('%c✅ 内存测试通过', 'color: #4caf50; font-weight: bold');
  } else {
    console.log('%c⚠️ 内存测试警告：可能有轻微内存泄漏',
      'color: #ff9800; font-weight: bold');
  }

  console.log('');
  if (allPassed) {
    console.log('%c🎉 所有测试通过！性能表现优秀！',
      'color: #4caf50; font-weight: bold; font-size: 16px');
  } else {
    console.log('%c⚠️ 部分测试未通过，建议检查性能',
      'color: #ff9800; font-weight: bold; font-size: 16px');
  }

  return results;
}

// 执行所有测试
runAllPerformanceTests()
```

### 这将自动执行：
- ✅ 基础性能测试（1000条）
- ✅ 压力测试（5000条）
- ✅ 内存使用测试
- ✅ 自动评估结果
- ✅ 生成测试报告

---

## 快速测试命令

### 只测试日志性能
```javascript
testLogPerformance(1000)
```

### 只测试UI响应性
```javascript
setInterval(() => console.log('[UI测试]', Date.now()), 500)
testLogPerformance(3000)
```

### 只测试内存
```javascript
testMemoryUsage()
```

### 运行全部测试
```javascript
runAllPerformanceTests()
```

---

## 测试记录模板

完成测试后，请记录结果：

```
=== 性能测试记录 ===

测试日期：___
测试人员：___

【测试 1】基础性能测试（1000条）
总耗时：___ ms
平均每条：___ ms
内存使用：___ MB
结果：✅ 通过 / ❌ 失败

【测试 2】压力测试（10000条）
总耗时：___ ms
平均每条：___ ms
内存使用：___ MB
结果：✅ 通过 / ❌ 失败

【测试 3】UI 响应性测试
UI 是否保持响应：✅ 是 / ❌ 否
结果：✅ 通过 / ❌ 失败

【测试 4】内存使用测试
第一次：___ MB
第二次：___ MB
差异：___ MB
结果：✅ 通过 / ❌ 失败

【测试 5】动画性能测试
平均 FPS：___
最低 FPS：___
长任务数量：___
结果：✅ 通过 / ❌ 失败

【测试 6】启动时间测试
启动时间：___ 秒
首屏渲染：___ ms
结果：✅ 通过 / ❌ 失败

=== 总体评估 ===
通过率：___/6
性能等级：优秀 / 良好 / 一般 / 需要优化
```

---

## 故障排查

### 问题 1：testLogPerformance 未定义
**原因：** 应用未完全加载
**解决：** 刷新页面，等待加载完成后重试

### 问题 2：UI 冻结或卡顿
**原因：** 日志写入阻塞了主线程
**检查：** 确认使用的是 `npm run dev`（桌面模式）而不是 `npm run dev:web`

### 问题 3：测试报错
**原因：** 日志系统初始化失败
**解决：** 检查控制台是否有错误消息

---

## 下一步

完成所有测试后：
1. 记录测试结果
2. 如果有失败的测试，分析原因并优化
3. 将测试结果添加到 `PERFORMANCE_TEST_RESULTS.md`
4. 提交测试报告

---

**测试愉快！** 🚀
