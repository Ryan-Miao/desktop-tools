import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import StandaloneApp from './StandaloneApp';
import './styles/global.css';
import './styles/themes.css';

// Import built-in plugins and their manifests
import { pluginRegistry } from './services/PluginRegistry';
import CalculatorPad, { calculatorManifest } from './components/CalculatorPad';
import JSONFormatter, { jsonFormatterManifest } from './components/JSONFormatter';
import PasswordGenerator, { passwordGeneratorManifest } from './components/PasswordGenerator';
import UrlCodec, { urlCodecManifest } from './components/UrlCodec';
import Base64Tool, { base64ToolManifest } from './components/Base64Tool';
import CryptoTool, { cryptoToolManifest } from './components/CryptoTool';
import Notepad, { notepadManifest } from './components/Notepad';
import TodoList, { todoListManifest } from './components/TodoList';
import OcrTool, { ocrToolManifest } from './components/OcrTool';

// Register built-in plugins explicitly
pluginRegistry.register('com.desktop-tool.calculator-pad', {
  component: CalculatorPad,
  pluginId: 'com.desktop-tool.calculator-pad',
  manifest: calculatorManifest
});

pluginRegistry.register('com.desktop-tool.json-formatter', {
  component: JSONFormatter,
  pluginId: 'com.desktop-tool.json-formatter',
  manifest: jsonFormatterManifest
});

pluginRegistry.register('com.desktop-tool.plugin.password-generator', {
  component: PasswordGenerator,
  pluginId: 'com.desktop-tool.plugin.password-generator',
  manifest: passwordGeneratorManifest
});

pluginRegistry.register('com.desktop-tool.plugin.url-codec', {
  component: UrlCodec,
  pluginId: 'com.desktop-tool.plugin.url-codec',
  manifest: urlCodecManifest
});

pluginRegistry.register('com.desktop-tool.plugin.base64-tool', {
  component: Base64Tool,
  pluginId: 'com.desktop-tool.plugin.base64-tool',
  manifest: base64ToolManifest
});

pluginRegistry.register('com.desktop-tool.plugin.crypto-tool', {
  component: CryptoTool,
  pluginId: 'com.desktop-tool.plugin.crypto-tool',
  manifest: cryptoToolManifest
});

pluginRegistry.register('com.desktop-tool.plugin.notepad', {
  component: Notepad,
  pluginId: 'com.desktop-tool.plugin.notepad',
  manifest: notepadManifest
});

pluginRegistry.register('com.desktop-tool.plugin.todo-list', {
  component: TodoList,
  pluginId: 'com.desktop-tool.plugin.todo-list',
  manifest: todoListManifest
});

pluginRegistry.register('com.desktop-tool.plugin.ocr-tool', {
  component: OcrTool,
  pluginId: 'com.desktop-tool.plugin.ocr-tool',
  manifest: ocrToolManifest
});

// 路由组件 - 根据hash决定渲染哪个应用
// Web模式：使用modal显示插件，不需要hash路由
// 桌面模式：独立窗口需要hash路由来区分StandaloneApp和App
function Root() {
  const hash = window.location.hash;

  // 检查是否是独立窗口模式（桌面Electron独立窗口）
  const isStandaloneWindow = hash.startsWith('#plugin-standalone/');

  if (isStandaloneWindow) {
    return <StandaloneApp />;
  }

  return <App />;
}

// 渲染应用
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);

