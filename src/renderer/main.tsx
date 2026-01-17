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

// 检测是否是独立窗口
const isStandalone = window.location.hash.startsWith('#plugin-standalone/');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isStandalone ? <StandaloneApp /> : <App />}
  </React.StrictMode>
);
