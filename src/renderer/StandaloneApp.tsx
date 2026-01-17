import React, { useEffect, useState, Suspense } from 'react';
import CalculatorPad from './components/CalculatorPad';
import { themes, applyTheme } from './themes/themes';
import { storageService } from './services/StorageService';

/**
 * 独立窗口应用入口
 *
 * 直接渲染插件内容，不包含工作台界面
 */
function StandaloneApp() {
  const [pluginId, setPluginId] = useState<string | null>(null);
  const [windowId, setWindowId] = useState<string | null>(null);
  const [themeId, setThemeId] = useState<string>('light-blue');

  useEffect(() => {
    // 从 URL hash 获取插件 ID 和窗口 ID
    const hash = window.location.hash;
    if (hash.startsWith('#plugin-standalone/')) {
      const id = hash.replace('#plugin-standalone/', '');
      setPluginId(id);
      setWindowId(`standalone-${id}`);
    }

    // 加载主题设置
    const settings = storageService.getAppSettings();
    setThemeId(settings.themeId);
  }, []);

  // 应用主题
  useEffect(() => {
    const theme = themes.find(t => t.id === themeId) || themes[0];
    document.documentElement.className = theme.mode;
    applyTheme(theme);
  }, [themeId]);

  // ESC 键关闭
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [windowId]);

  const handleClose = async () => {
    if (window.electron?.ipcRenderer && windowId) {
      await window.electron.ipcRenderer.invoke('standalone-window:close', windowId);
    }
  };

  const handleMinimize = async () => {
    if (window.electron?.ipcRenderer && windowId) {
      await window.electron.ipcRenderer.invoke('standalone-window:minimize', windowId);
    }
  };

  const handleMaximize = async () => {
    if (window.electron?.ipcRenderer && windowId) {
      await window.electron.ipcRenderer.invoke('standalone-window:maximize', windowId);
    }
  };

  if (!pluginId) {
    return <div className="plugin-loading"><p>加载中...</p></div>;
  }

  if (pluginId === 'calculator-pad') {
    return (
      <div className="standalone-container">
        <Suspense fallback={<div className="plugin-loading"><p>加载中...</p></div>}>
          <CalculatorPad
            onClose={handleClose}
            onMinimize={handleMinimize}
            onMaximize={handleMaximize}
          />
        </Suspense>
      </div>
    );
  }

  return <div>Unknown plugin</div>;
}

export default StandaloneApp;
