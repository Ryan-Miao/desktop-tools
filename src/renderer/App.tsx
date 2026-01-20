import React, { useEffect, useState, useMemo, useCallback } from 'react';
import SearchBox from './components/SearchBox';
import PluginList from './components/PluginList';
import WindowControls from './components/WindowControls';
import SettingsPanel from './components/SettingsPanel';
import PluginManager from './components/PluginManager';
import PluginMarketPanel from './components/PluginMarketPanel';
import BackupPanel from './components/BackupPanel';
import PluginModal from './components/PluginModal';
import { storageService } from './services/StorageService';
import { themes, applyTheme, getThemeById, getDefaultTheme, updatePanelOpacity } from './themes/themes';
import { logger } from '../shared/logger';
import { pluginRegistry } from './services/PluginRegistry';
import { remotePluginLoader } from './services/RemotePluginLoader';
import { eventBus, AppEvents } from './utils/eventBus';

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
  const [showPluginMarket, setShowPluginMarket] = useState(false);
  const [showBackup, setShowBackup] = useState(false);
  const [activePluginId, setActivePluginId] = useState<string | null>(null);

  // 初始化：加载保存的设置
  useEffect(() => {
    // 加载主题设置
    const settings = storageService.getAppSettings();
    setThemeId(settings.themeId);

    // 加载插件（内联代码避免循环依赖）
    const loadPluginsInit = async () => {
      logger.info('[App] loadPluginsInit called - reloading plugin list');
      if (window.electron?.ipcRenderer) {
        // 桌面模式：先加载npm插件到PluginRegistry，再合并
        try {
          const installedPlugins = storageService.getInstalledRemotePlugins();
          logger.info('[App] Found installed npm plugins', { count: installedPlugins.length });

          for (const plugin of installedPlugins) {
            try {
              await remotePluginLoader.installPlugin(plugin.packageName, plugin.version);
              logger.info(`[App] npm plugin loaded: ${plugin.id}`);
            } catch (error) {
              logger.error(`[App] Failed to load npm plugin: ${plugin.id}`, { error });
            }
          }
        } catch (error) {
          logger.error('[App] Failed to load npm plugins', { error });
        }

        window.electron.ipcRenderer.invoke(
          window.electron.channels?.PLUGIN_LIST || 'plugin:list'
        ).then((mainProcessPlugins: Plugin[]) => {
          logger.info(`[App] Loaded ${mainProcessPlugins.length} plugins from main process`);

          // 从PluginRegistry获取已注册的插件（包含npm插件）
          const registryPlugins = pluginRegistry.getAll().map(info => ({
            id: info.pluginId,
            name: info.manifest.name,
            description: info.manifest.description,
            icon: info.manifest.icon,
            version: info.manifest.version
          }));
          logger.info(`[App] Loaded ${registryPlugins.length} plugins from registry`);

          // 合并并去重（使用Map以pluginId为key）
          const pluginMap = new Map<string, Plugin>();

          // 先添加主进程插件（内置和本地ZIP）
          mainProcessPlugins.forEach((p: Plugin) => {
            pluginMap.set(p.id, p);
          });

          // 添加/覆盖PluginRegistry中的插件（npm插件）
          registryPlugins.forEach(p => {
            pluginMap.set(p.id, p);
          });

          // 转换为数组
          const allPlugins = Array.from(pluginMap.values());
          logger.info(`[App] Total plugins after merge: ${allPlugins.length}`);
          setPlugins(allPlugins);
        }).catch((error) => {
          logger.error('[App] Failed to load plugins from main process', { error });
          // Fallback to pluginRegistry
          const registeredPlugins = pluginRegistry.getAll().map(info => ({
            id: info.pluginId,
            name: info.manifest.name,
            description: info.manifest.description,
            icon: info.manifest.icon
          }));
          logger.info(`[App] Loaded ${registeredPlugins.length} plugins from registry (fallback)`);
          setPlugins(registeredPlugins);
        });
      } else {
        // Web mode - load remote plugins first, then all from registry
        try {
          const installedPlugins = storageService.getInstalledRemotePlugins();
          logger.info('[App] Found installed remote plugins', { count: installedPlugins.length });

          for (const plugin of installedPlugins) {
            try {
              await remotePluginLoader.installPlugin(plugin.packageName, plugin.version);
              logger.info(`[App] Remote plugin loaded: ${plugin.id}`);
            } catch (error) {
              logger.error(`[App] Failed to load remote plugin: ${plugin.id}`, { error });
            }
          }
        } catch (error) {
          logger.error('[App] Failed to load remote plugins', { error });
        }

        const registeredPlugins = pluginRegistry.getAll().map(info => ({
          id: info.pluginId,
          name: info.manifest.name,
          description: info.manifest.description,
          icon: info.manifest.icon
        }));
        logger.info(`[App] Web mode: Loaded ${registeredPlugins.length} plugins from registry`);
        setPlugins(registeredPlugins);
      }
    };
    logger.info('[App] Initial plugin load on mount');
    loadPluginsInit();

    // 监听主进程插件事件
    const handlePluginLoaded = (event: any, ...args: any[]) => {
      logger.info(`[App] Received plugin event: ${event}, args: ${JSON.stringify(args)}`);
      loadPluginsInit();
    };

    if (window.electron?.ipcRenderer) {
      logger.info('[App] Setting up plugin event listeners');
      window.electron.ipcRenderer.on('plugin:loaded', handlePluginLoaded);
      window.electron.ipcRenderer.on('plugin:unloaded', handlePluginLoaded);
      window.electron.ipcRenderer.on('plugin:installed', handlePluginLoaded);
      window.electron.ipcRenderer.on('plugin:uninstalled', handlePluginLoaded);
      logger.info('[App] Plugin event listeners registered');
    }

    // 监听 PluginRegistry 事件
    const handleRegistryChange = (pluginId: string) => {
      logger.info(`PluginRegistry changed: ${pluginId}, reloading plugins`);
      loadPluginsInit();
    };

    pluginRegistry.on('registered', handleRegistryChange);
    pluginRegistry.on('unregistered', handleRegistryChange);

    // 监听全局事件总线的插件变化事件
    const handlePluginsChanged = () => {
      logger.info('[App] Plugins changed (global event), reloading');
      loadPluginsInit();
    };

    const cleanupEventBus = eventBus.on(AppEvents.PLUGINS_CHANGED, handlePluginsChanged);

    return () => {
      if (window.electron?.ipcRenderer) {
        window.electron.ipcRenderer.removeAllListeners('plugin:loaded');
        window.electron.ipcRenderer.removeAllListeners('plugin:unloaded');
        window.electron.ipcRenderer.removeAllListeners('plugin:installed');
        window.electron.ipcRenderer.removeAllListeners('plugin:uninstalled');
      }
      pluginRegistry.off('registered', handleRegistryChange);
      pluginRegistry.off('unregistered', handleRegistryChange);
      cleanupEventBus(); // 清理全局事件监听
    };
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
    const controller = new AbortController();
    const { signal } = controller;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // 关闭所有打开的面板
        setShowSettings(false);
        setShowPluginManager(false);
        setShowPluginMarket(false);
        setShowBackup(false);
        // 关闭插件modal
        setActivePluginId(null);
      }

      // F12 - 切换开发者工具（仅在 Electron 环境）
      if (event.key === 'F12' && window.electron?.ipcRenderer) {
        event.preventDefault();
        window.electron.ipcRenderer.invoke('window:toggle-devtools').catch((error: any) => {
          console.error('Failed to toggle devtools:', error);
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown, { signal });

    return () => {
      controller.abort();
    };
  }, []); // Remove dependencies to prevent re-registration, always close all modals

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
    console.log('[App] handlePluginClick called with:', pluginId);

    try {
      // 桌面模式：通过 IPC 创建独立窗口
      if (window.electron?.ipcRenderer) {
        const plugin = plugins.find(p => p.id === pluginId);
        console.log('[App] Found plugin:', plugin);

        console.log('[App] Calling plugin:open-standalone with:', pluginId, plugin?.name || 'Plugin');
        const result = await window.electron.ipcRenderer.invoke(
          'plugin:open-standalone',
          pluginId,
          plugin?.name || 'Plugin'
        );

        console.log('[App] IPC result:', result);

        if (result.success) {
          console.log('[App] Plugin opened successfully, updating last used time');
          // 更新最后使用时间
          storageService.updatePluginLastUsed(pluginId);
        } else {
          console.error('[App] Failed to open plugin:', result.error);
        }
      } else {
        // Web模式：使用modal显示插件
        console.log('[App] Running in web mode, showing plugin modal');
        setActivePluginId(pluginId);
        storageService.updatePluginLastUsed(pluginId);
      }
    } catch (error) {
      console.error('[App] Failed to open plugin window:', error);
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
    const loadPluginsInit = async () => {
      if (window.electron?.ipcRenderer) {
        // 桌面模式：先加载npm插件
        try {
          const installedPlugins = storageService.getInstalledRemotePlugins();
          for (const plugin of installedPlugins) {
            try {
              await remotePluginLoader.installPlugin(plugin.packageName, plugin.version);
            } catch (error) {
              logger.error(`Failed to reload npm plugin: ${plugin.id}`, { error });
            }
          }
        } catch (error) {
          logger.error('Failed to reload npm plugins', { error });
        }

        window.electron.ipcRenderer.invoke(
          window.electron.channels?.PLUGIN_LIST || 'plugin:list'
        ).then((mainProcessPlugins: Plugin[]) => {
          // 从PluginRegistry获取已注册的插件（包含npm插件）
          const registryPlugins = pluginRegistry.getAll().map(info => ({
            id: info.pluginId,
            name: info.manifest.name,
            description: info.manifest.description,
            icon: info.manifest.icon,
            version: info.manifest.version
          }));

          // 合并并去重
          const pluginMap = new Map<string, Plugin>();
          mainProcessPlugins.forEach((p: Plugin) => {
            pluginMap.set(p.id, p);
          });
          registryPlugins.forEach(p => {
            pluginMap.set(p.id, p);
          });

          const allPlugins = Array.from(pluginMap.values());
          setPlugins(allPlugins);
        }).catch((error) => {
          logger.error('Failed to reload plugins', { error });
          // Fallback to pluginRegistry
          const registeredPlugins = pluginRegistry.getAll().map(info => ({
            id: info.pluginId,
            name: info.manifest.name,
            description: info.manifest.description,
            icon: info.manifest.icon
          }));
          setPlugins(registeredPlugins);
        });
      } else {
        // Web mode - use pluginRegistry
        const registeredPlugins = pluginRegistry.getAll().map(info => ({
          id: info.pluginId,
          name: info.manifest.name,
          description: info.manifest.description,
          icon: info.manifest.icon
        }));
        setPlugins(registeredPlugins);
      }
    };
    loadPluginsInit();
  };

  return (
    <>
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
            onOpenPluginMarket={() => setShowPluginMarket(true)}
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

        {/* Plugin Market */}
        {showPluginMarket && (
          <PluginMarketPanel onClose={() => setShowPluginMarket(false)} />
        )}

        {/* Backup Panel */}
        {showBackup && (
          <BackupPanel onClose={() => setShowBackup(false)} />
        )}
      </div>

      {/* Plugin Modal - outside flex container to avoid layout conflicts */}
      {activePluginId && (
        <PluginModal
          pluginId={activePluginId}
          onClose={() => setActivePluginId(null)}
        />
      )}
    </>
  );
}

export default App;
