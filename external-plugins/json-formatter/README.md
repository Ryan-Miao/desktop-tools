# JSON 格式化工具插件

美观强大的 JSON 格式化、压缩、转义和验证工具。

## ✨ 特性

- 🎨 **美观界面** - 现代化的 UI 设计，支持浅色/深色主题
- ⚡ **多种模式** - 格式化、压缩、转义、反转义、验证
- 📊 **实时统计** - 字符数、行数、大小统计
- 📋 **一键复制** - 快速复制处理结果
- 🔍 **语法验证** - 实时检测 JSON 语法错误
- 💡 **智能提示** - 友好的错误提示和操作建议
- 🎯 **自定义缩进** - 支持 2 空格、4 空格或无缩进

## 🚀 如何导入到应用

### 方法一：手动注册（推荐）

#### 步骤 1：复制插件到项目

```bash
# 将插件复制到项目组件目录
cp -r external-plugins/json-formatter src/renderer/components/
```

#### 步骤 2：在 App.tsx 中注册插件

编辑 `src/renderer/App.tsx`：

```tsx
// 1. 导入插件组件
import JSONFormatter from './components/json-formatter';

// 2. 添加到插件列表
const plugins: Plugin[] = [
  // ... 其他插件
  {
    id: 'json-formatter',
    name: 'JSON 格式化',
    description: '格式化、压缩、转义和验证 JSON',
    icon: '📝'
  }
];
```

#### 步骤 3：在 StandaloneApp.tsx 中添加渲染逻辑

编辑 `src/renderer/StandaloneApp.tsx`：

```tsx
// 1. 导入插件
import JSONFormatter from './components/json-formatter';

// 2. 添加路由判断
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

#### 步骤 4：重启应用

```bash
npm run dev
```

现在在主界面点击 **JSON 格式化** 图标即可使用插件！

### 方法二：通过插件管理器导入（未来功能）

> 注意：外部插件导入功能正在开发中，敬请期待！

未来的使用方式：

1. 打开应用设置
2. 进入「插件管理」
3. 点击「导入插件」
4. 选择 `external-plugins/json-formatter` 目录
5. 确认导入

## 📖 使用说明

### 格式化模式

将 JSON 美化为易读的格式，支持自定义缩进：

```json
{"name":"test","value":123}
```

↓ 格式化为 ↓

```json
{
  "name": "test",
  "value": 123
}
```

### 压缩模式

移除所有空格和换行，最小化 JSON 体积：

```json
{
  "name": "test",
  "value": 123
}
```

↓ 压缩为 ↓

```json
{"name":"test","value":123}
```

### 转义模式

转义特殊字符，用于字符串中嵌入 JSON：

```json
{"key": "value"}
```

↓ 转义为 ↓

```json
"{\"key\": \"value\"}"
```

### 验证模式

快速验证 JSON 语法是否正确，不输出结果。

## 🎨 界面预览

插件包含以下主要区域：

- **工具栏** - 模式切换和缩进设置
- **输入面板** - 粘贴或输入 JSON
- **输出面板** - 显示处理结果
- **状态栏** - 显示处理状态和统计信息

## ⌨️ 快捷键

- `ESC` - 关闭窗口
- `Ctrl+C` - 复制输出（在输出面板点击后）

## 🛠️ 技术栈

- React 18
- TypeScript
- CSS3 (CSS Variables)

## 📝 开发说明

### 目录结构

```
json-formatter/
├── JSONFormatter.tsx    # 主组件
├── JSONFormatter.css    # 样式文件
├── manifest.json        # 插件清单
├── index.ts            # 导出文件
├── package.json        # NPM 配置
└── README.md           # 说明文档
```

### 自定义和扩展

如需自定义插件，可以修改：

1. **添加新功能模式** - 在 `JSONFormatter.tsx` 中扩展 `Mode` 类型
2. **调整样式** - 修改 `JSONFormatter.css`
3. **修改配置** - 编辑 `manifest.json`

## 🐛 已知问题

- 外部插件导入功能尚未实现
- 需要手动注册到应用中

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📮 联系方式

- 提交问题：[GitHub Issues](https://github.com/yourname/desktop-tool/issues)
- 邮箱：your@email.com

---

Made with ❤️ by External Plugin Developer
