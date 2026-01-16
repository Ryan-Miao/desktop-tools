import React, { useEffect, useState, useMemo, useCallback } from 'react';
import SearchBox from './components/SearchBox';
import PluginList from './components/PluginList';
import WindowControls from './components/WindowControls';
import FloatingClock from './components/FloatingClock';
import SettingsPanel from './components/SettingsPanel';
import PluginManager from './components/PluginManager';
import StatsReport from './components/StatsReport';
import BackupPanel from './components/BackupPanel';
import CalculatorPad from './components/CalculatorPad';
import { storageService } from './services/StorageService';
import { themes, applyTheme, getThemeById, getDefaultTheme, updatePanelOpacity } from './themes/themes';
import { inputEventTracker } from './services/InputEventTracker';

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
  const [showStatsReport, setShowStatsReport] = useState(false);
  const [showBackup, setShowBackup] = useState(false);
  const [isFloatingClockMode, setIsFloatingClockMode] = useState(false);

  // 初始化：加载保存的设置
  useEffect(() => {
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

    // 启动输入事件跟踪（在整个应用运行时）
    if (window.electron?.ipcRenderer) {
      inputEventTracker.start();

      return () => {
        inputEventTracker.stop();
      };
    }
  }, []);

  // 监听 URL hash 变化来支持独立窗口
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'floating-clock') {
        setIsFloatingClockMode(true);
        setActivePlugin('floating-clock');
      } else {
        setIsFloatingClockMode(false);
      }
    };

    // 初始检查
    handleHashChange();

    // 监听 hash 变化
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // 应用主题和透明度
  useEffect(() => {
    const theme = getThemeById(themeId) || getDefaultTheme();
    applyTheme(theme);

    // 更新 CSS 类名用于样式选择器
    document.documentElement.className = theme.mode;

    // 应用面板透明度
    const settings = storageService.getAppSettings();
    const opacity = settings.panelOpacity ?? 85;
    const opacityValue = opacity / 100;
    document.documentElement.style.setProperty('--panel-opacity', `${opacityValue}`);
    updatePanelOpacity(`${opacityValue}`);
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
        if (showStatsReport) {
          setShowStatsReport(false);
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
  }, [activePlugin, showSettings, showPluginManager, showStatsReport, showBackup]);

  const getMockPlugins = useCallback((): Plugin[] => [
    {
      id: 'floating-clock',
      name: '悬浮时钟',
      description: '桌面悬浮时钟，支持久坐提醒和统计功能',
      icon: '⏰'
    },
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
      {/* 悬浮时钟独立模式 */}
      {isFloatingClockMode && activePlugin === 'floating-clock' && (
        <FloatingClock onClose={handleClosePlugin} />
      )}

      {/* 正常模式 */}
      {!isFloatingClockMode && (
        <div className="main-window">
          <WindowControls
            themeId={themeId}
            onToggleTheme={handleToggleTheme}
            onMinimize={() => {
              if (window.electron?.ipcRenderer) {
                window.electron.ipcRenderer.send('window:minimize');
              }
            }}
            onMaximize={() => {
              if (window.electron?.ipcRenderer) {
                window.electron.ipcRenderer.send('window:maximize');
              }
            }}
            onClose={() => {
              if (window.electron?.ipcRenderer) {
                window.electron.ipcRenderer.send('window:close');
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
            />

            <PluginList
              plugins={filteredPlugins}
              searchQuery={searchQuery}
              onPluginClick={handlePluginClick}
            />
          </div>
        </div>
      )}

      {/* Plugin Modals (只在正常模式下显示) */}
      {!isFloatingClockMode && activePlugin === 'floating-clock' && (
        <FloatingClock onClose={handleClosePlugin} />
      )}

      {!isFloatingClockMode && activePlugin === 'calculator-pad' && (
        <CalculatorPad onClose={handleClosePlugin} />
      )}

      {/* Settings Panel */}
      {showSettings && (
        <SettingsPanel
          themeId={themeId}
          onClose={() => setShowSettings(false)}
          onChangeTheme={handleChangeTheme}
          onOpenStatsReport={() => setShowStatsReport(true)}
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

      {/* Stats Report */}
      {showStatsReport && (
        <StatsReport onClose={() => setShowStatsReport(false)} />
      )}

      {/* Backup Panel */}
      {showBackup && (
        <BackupPanel onClose={() => setShowBackup(false)} />
      )}
    </div>
  );
}

export default App;
