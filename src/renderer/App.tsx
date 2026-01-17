import React, { useEffect, useState, useMemo, useCallback, lazy, Suspense } from 'react';
import SearchBox from './components/SearchBox';
import PluginList from './components/PluginList';
import WindowControls from './components/WindowControls';
import { storageService } from './services/StorageService';
import { themes, applyTheme, getThemeById, getDefaultTheme, updatePanelOpacity } from './themes/themes';
import { logger } from '../shared/logger';
import { Loading } from './components/Loading';

// 延迟加载非关键组件（优化启动时间）
const SettingsPanel = lazy(() => import('./components/SettingsPanel'));
const PluginManager = lazy(() => import('./components/PluginManager'));
const BackupPanel = lazy(() => import('./components/BackupPanel'));
const CalculatorPad = lazy(() => import('./components/CalculatorPad'));

interface Plugin {
  id: string;
  name: string;
  description: string;
  icon: string;
}

function App() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [themeId, setThemeId] = useState<string>('light-blue');
  const [activePlugin, setActivePlugin] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showPluginManager, setShowPluginManager] = useState(false);
  const [showBackup, setShowBackup] = useState(false);

  // 初始化：加载保存的设置
  useEffect(() => {
    // ============ 测试统一日志框架 ============
    logger.debug('这是一条DEBUG日志', { test: true, value: 123 });
    logger.info('应用已启动', { version: '1.0.0', mode: 'desktop' });
    logger.warn('这是一条WARN日志', { warning: '测试警告' });
    logger.error('这是一条ERROR日志', { error: 'test error', code: 500 });

    // 暴露测试函数到全局（用于控制台测试）
    (window as any).testLogLevel = (level: number) => {
      const { LogLevel } = require('../shared/logger/types');
      logger.setMinLevel(level);
      console.log(`%c[测试] 日志级别设置为: ${LogLevel[level]} (${level})`, 'color: #00bcd4; font-weight: bold');

      // 测试所有级别的日志
      logger.debug(`[测试] DEBUG日志 - 当前级别: ${LogLevel[level]}`);
      logger.info(`[测试] INFO日志 - 当前级别: ${LogLevel[level]}`);
      logger.warn(`[测试] WARN日志 - 当前级别: ${LogLevel[level]}`);
      logger.error(`[测试] ERROR日志 - 当前级别: ${LogLevel[level]}`);

      console.log('%c[测试] 请观察控制台输出，验证级别过滤是否正常', 'color: #ff9800');
      console.log('%c[测试] 示例: testLogLevel(0) 显示全部, testLogLevel(1) 过滤DEBUG', 'color: #666');
    };

    console.log('%c[测试] 使用 testLogLevel(level) 测试日志级别过滤', 'color: #00bcd4; font-weight: bold');
    console.log('%c[测试] level: 0=DEBUG, 1=INFO, 2=WARN, 3=ERROR', 'color: #666');
    console.log('%c[测试] 示例: testLogLevel(1) 设置为INFO级别，过滤掉DEBUG日志', 'color: #666');

    // 性能测试：验证异步写入不阻塞UI
    (window as any).testLogPerformance = async (count: number = 1000) => {
      console.log(`%c[性能测试] 开始测试：连续写入 ${count} 条日志`, 'color: #e91e63; font-weight: bold');

      const startTime = performance.now();
      const startMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // 快速连续写入大量日志
      for (let i = 0; i < count; i++) {
        logger.info(`[性能测试] 日志条目 ${i + 1}/${count}`, {
          iteration: i,
          timestamp: Date.now(),
          data: { test: 'performance', value: Math.random() }
        });
      }

      const endTime = performance.now();
      const endMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const duration = endTime - startTime;
      const memoryUsed = ((endMemory - startMemory) / 1024 / 1024).toFixed(2);

      console.log(`%c[性能测试] 完成！总耗时: ${duration.toFixed(2)}ms`, 'color: #4caf50; font-weight: bold');
      console.log(`%c[性能测试] 平均每条日志: ${(duration / count).toFixed(3)}ms`, 'color: #4caf50');
      console.log(`%c[性能测试] 内存使用: ${memoryUsed} MB`, 'color: #4caf50');
      console.log(`%c[性能测试] 如果UI没有卡顿，说明异步写入成功！`, 'color: #ff9800; font-weight: bold');

      return {
        count,
        duration,
        avgTime: duration / count,
        memoryUsed
      };
    };

    console.log('%c[性能测试] 使用 testLogPerformance(count) 测试异步写入性能', 'color: #e91e63; font-weight: bold');
    console.log('%c[性能测试] 示例: testLogPerformance(1000) 测试写入1000条日志', 'color: #666');
    // ==========================================

    // 加载主题设置
    const settings = storageService.getAppSettings();
    setThemeId(settings.themeId);

    // 加载插件（内联代码避免循环依赖）
    const loadPluginsInit = () => {
      if (window.electron?.ipcRenderer) {
        window.electron.ipcRenderer.invoke(
          window.electron.channels?.PLUGIN_LIST || 'plugin:list'
        ).then((pluginList: Plugin[]) => {
          const normalizedPlugins = pluginList.map(plugin => ({
            ...plugin,
            id: plugin.id.replace('com.desktop-tool.', '')
          }));
          setPlugins(normalizedPlugins);
        }).catch(() => {
          setPlugins(getMockPlugins());
        });
      } else {
        setPlugins(getMockPlugins());
      }
    };
    loadPluginsInit();
  }, []);

  // 应用主题和透明度
  useEffect(() => {
    const theme = getThemeById(themeId) || getDefaultTheme();

    // 更新 CSS 类名用于样式选择器
    document.documentElement.className = theme.mode;

    // 应用面板透明度
    const settings = storageService.getAppSettings();
    const opacity = settings.panelOpacity ?? 85;
    const opacityValue = opacity / 100;

    // 应用主题时传入透明度值
    applyTheme(theme, `${opacityValue}`);

    // 同时设置 CSS 变量
    document.documentElement.style.setProperty('--panel-opacity', `${opacityValue}`);
  }, [themeId]);

  // ESC 键监听 - 关闭所有面板
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // 关闭所有打开的面板
        if (activePlugin) {
          setActivePlugin(null);
        }
        if (showSettings) {
          setShowSettings(false);
        }
        if (showPluginManager) {
          setShowPluginManager(false);
        }
        if (showBackup) {
          setShowBackup(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activePlugin, showSettings, showPluginManager, showBackup]);

  const getMockPlugins = useCallback((): Plugin[] => [
    {
      id: 'calculator-pad',
      name: '计算稿纸',
      description: '数学表达式计算，历史记录保存',
      icon: '🧮'
    }
  ], []);

  const filteredPlugins = useMemo(() => {
    return plugins.filter(plugin => {
      // 检查插件是否启用
      const pluginState = storageService.getPluginState(plugin.id);
      const isEnabled = pluginState?.enabled ?? true;

      // 搜索过滤
      const matchesSearch =
        plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plugin.description.toLowerCase().includes(searchQuery.toLowerCase());

      return isEnabled && matchesSearch;
    });
  }, [plugins, searchQuery]);

  const handlePluginClick = (pluginId: string) => {
    setActivePlugin(pluginId);
    // 更新最后使用时间
    storageService.updatePluginLastUsed(pluginId);
  };

  const handleClosePlugin = () => {
    setActivePlugin(null);
  };

  const handleSearchEnter = useCallback(() => {
    if (filteredPlugins.length > 0) {
      // Open the first matching plugin
      handlePluginClick(filteredPlugins[0].id);
    }
  }, [filteredPlugins]);

  const handleChangeTheme = (newThemeId: string) => {
    setThemeId(newThemeId);
    // 保存到本地存储
    storageService.updateAppSettings({ themeId: newThemeId });
  };

  const handleToggleTheme = () => {
    // 简单的浅色/深色切换（用于快速切换）
    const currentTheme = getThemeById(themeId) || getDefaultTheme();
    const sameModeThemes = themes.filter(t => t.mode !== currentTheme.mode);
    const nextTheme = sameModeThemes[0] || getDefaultTheme();
    handleChangeTheme(nextTheme.id);
  };

  const handleRefreshPlugins = () => {
    // Refresh plugins by reloading from the source
    const loadPluginsInit = () => {
      if (window.electron?.ipcRenderer) {
        window.electron.ipcRenderer.invoke(
          window.electron.channels?.PLUGIN_LIST || 'plugin:list'
        ).then((pluginList: Plugin[]) => {
          const normalizedPlugins = pluginList.map(plugin => ({
            ...plugin,
            id: plugin.id.replace('com.desktop-tool.', '')
          }));
          setPlugins(normalizedPlugins);
        }).catch(() => {
          setPlugins(getMockPlugins());
        });
      } else {
        setPlugins(getMockPlugins());
      }
    };
    loadPluginsInit();
  };

  return (
    <div className="app-container">
      <div className="main-window">
        <WindowControls
          themeId={themeId}
          onToggleTheme={handleToggleTheme}
          onMinimize={async () => {
            if (window.electron?.ipcRenderer) {
              await window.electron.ipcRenderer.invoke('window:minimize');
            }
          }}
          onMaximize={async () => {
            if (window.electron?.ipcRenderer) {
              await window.electron.ipcRenderer.invoke('window:maximize');
            }
          }}
          onClose={async () => {
            if (window.electron?.ipcRenderer) {
              await window.electron.ipcRenderer.invoke('window:close');
            }
          }}
          onOpenSettings={() => setShowSettings(true)}
          onOpenPluginManager={() => setShowPluginManager(true)}
        />

        <div className="content">
          <div className="header">
            <h1 className="title">工作台</h1>
            <p className="subtitle">高效集成工具平台</p>
          </div>

          <SearchBox
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search plugins..."
            onEnter={handleSearchEnter}
          />

          <PluginList
            plugins={filteredPlugins}
            searchQuery={searchQuery}
            onPluginClick={handlePluginClick}
          />
        </div>
      </div>

      {/* Plugin Modals */}
      <Suspense fallback={<Loading type="dots" text="加载中..." overlay fullscreen />}>
        {activePlugin === 'calculator-pad' && (
          <CalculatorPad onClose={handleClosePlugin} />
        )}

        {/* Settings Panel */}
        {showSettings && (
          <SettingsPanel
            themeId={themeId}
            onClose={() => setShowSettings(false)}
            onChangeTheme={handleChangeTheme}
            onOpenBackup={() => setShowBackup(true)}
          />
        )}

        {/* Plugin Manager */}
        {showPluginManager && (
          <PluginManager
            visible={showPluginManager}
            onClose={() => setShowPluginManager(false)}
          />
        )}

        {/* Backup Panel */}
        {showBackup && (
          <BackupPanel onClose={() => setShowBackup(false)} />
        )}
      </Suspense>
    </div>
  );
}

export default App;
