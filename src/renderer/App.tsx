import React, { useEffect, useState, useMemo, useCallback } from 'react';
import SearchBox from './components/SearchBox';
import PluginList from './components/PluginList';
import WindowControls from './components/WindowControls';
import SettingsPanel from './components/SettingsPanel';
import PluginManager from './components/PluginManager';
import BackupPanel from './components/BackupPanel';
import { storageService } from './services/StorageService';
import { themes, applyTheme, getThemeById, getDefaultTheme, updatePanelOpacity } from './themes/themes';
import { logger } from '../shared/logger';

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
  const [showSettings, setShowSettings] = useState(false);
  const [showPluginManager, setShowPluginManager] = useState(false);
  const [showBackup, setShowBackup] = useState(false);

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

      // F12 - 切换开发者工具（仅在 Electron 环境）
      if (event.key === 'F12' && window.electron?.ipcRenderer) {
        event.preventDefault();
        window.electron.ipcRenderer.invoke('window:toggle-devtools').catch((error: any) => {
          console.error('Failed to toggle devtools:', error);
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showSettings, showPluginManager, showBackup]);

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

  const handlePluginClick = async (pluginId: string) => {
    try {
      // 通过 IPC 创建独立窗口
      if (window.electron?.ipcRenderer) {
        const plugin = plugins.find(p => p.id === pluginId);
        const result = await window.electron.ipcRenderer.invoke(
          'plugin:open-standalone',
          pluginId,
          plugin?.name || 'Plugin'
        );

        if (result.success) {
          // 更新最后使用时间
          storageService.updatePluginLastUsed(pluginId);
        } else {
          console.error('Failed to open plugin:', result.error);
        }
      }
    } catch (error) {
      console.error('Failed to open plugin window:', error);
    }
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
    </div>
  );
}

export default App;
