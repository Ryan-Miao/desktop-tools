# JSON 格式化插件 - 快速导入指南

## 📦 快速开始（3 步完成）

### 步骤 1：复制插件文件

```bash
# 进入项目目录
cd /home/ryan/project/learn-ai/desktop-tool

# 复制插件到组件目录
cp -r external-plugins/json-formatter src/renderer/components/
```

### 步骤 2：注册插件

打开 `src/renderer/App.tsx`，找到 `plugins` 数组，添加：

```typescript
{
  id: 'json-formatter',
  name: 'JSON 格式化',
  description: '格式化、压缩、转义和验证 JSON',
  icon: '📝'
}
```

打开 `src/renderer/StandaloneApp.tsx`，添加导入和渲染逻辑：

```typescript
// 在文件顶部添加导入
import JSONFormatter from './components/json-formatter';

// 在渲染逻辑中添加
if (pluginId === 'json-formatter') {
  return (
    <div className="standalone-container">
      <Suspense fallback={<div className="plugin-loading"><p>加载中...</p></div>}>
        <JSONFormatter
          onClose={handleClose}
          onMinimize={handleMinimize}
          onMaximize={handleMaximize}
        />
      </Suspense>
    </div>
  );
}
```

### 步骤 3：重启应用

```bash
# 如果应用正在运行，先停止（Ctrl+C）
# 然后重新启动
npm run dev
```

## ✅ 完成！

现在在主界面搜索或找到 **📝 JSON 格式化** 插件，点击即可使用！

## 🎯 功能演示

### 格式化
```json
{"name":"test","value":123}
```
↓ 转换为 ↓
```json
{
  "name": "test",
  "value": 123
}
```

### 压缩
```json
{
  "name": "test"
}
```
↓ 转换为 ↓
```json
{"name":"test"}
```

### 转义
```json
{"key": "value"}
```
↓ 转换为 ↓
```json
"{\"key\": \"value\"}"
```

## 💡 使用技巧

1. **加载示例** - 点击输入面板的 📋 按钮加载示例 JSON
2. **调整缩进** - 在工具栏选择 2 空格、4 空格或无缩进
3. **快速清空** - 点击 🗑️ 按钮清空输入
4. **复制结果** - 处理完成后点击复制按钮

## ❓ 遇到问题？

### 看不到插件图标？

检查：
- [ ] 是否正确复制了插件文件到 `src/renderer/components/json-formatter`
- [ ] 是否在 `App.tsx` 的 `plugins` 数组中添加了插件配置
- [ ] 是否在 `StandaloneApp.tsx` 中添加了渲染逻辑

### 插件加载失败？

检查：
- [ ] 浏览器控制台是否有错误信息
- [ ] 导入路径是否正确（`./components/json-formatter`）
- [ ] 是否重启了开发服务器

### 样式显示异常？

检查：
- [ ] `JSONFormatter.css` 是否在同一目录
- [ ] 组件中是否正确导入了样式：`import './JSONFormatter.css'`

## 📚 更多信息

详细文档请查看：[README.md](./README.md)
