import React, { useEffect, useState, useMemo } from 'react';
import SearchBox from './components/SearchBox';
import PluginList from './components/PluginList';
import WindowControls from './components/WindowControls';
import PluginMarketPanel from './components/PluginMarketPanel';
import PluginModal from './components/PluginModal';
import { logger } from '../shared/logger';
import { pluginRegistry } from './services/PluginRegistry';
import { remotePluginLoader } from './services/RemotePluginLoader';
import { storageService } from './services/StorageService';

interface Plugin {
  id: string;
  name: string;
  description: string;
  icon: string;
}

function App() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showPluginMarket, setShowPluginMarket] = useState(false);
  const [activePluginId, setActivePluginId] = useState<string | null>(null);

  // 加载插件列表
  useEffect(() => {
    const loadPlugins = async () => {
      // 1. 加载已安装的远程插件
      try {
        const installedPlugins = storageService.getInstalledRemotePlugins();
        logger.info('Found installed remote plugins', { count: installedPlugins.length });

        for (const plugin of installedPlugins) {
          try {
            await remotePluginLoader.installPlugin(plugin.packageName, plugin.version);
            logger.info(`Remote plugin loaded: ${plugin.id}`);
          } catch (error) {
            logger.error(`Failed to load remote plugin: ${plugin.id}`, { error });
          }
        }
      } catch (error) {
        logger.error('Failed to load remote plugins', { error });
      }

      // 2. 从 pluginRegistry 加载所有插件（内置 + 远程）
      const registeredPlugins = pluginRegistry.getAll().map(info => ({
        id: info.pluginId,
        name: info.manifest.name,
        description: info.manifest.description,
        icon: info.manifest.icon
      }));

      logger.info('Web模式 - 加载插件列表', {
        count: registeredPlugins.length,
        plugins: registeredPlugins.map(p => p.id)
      });

      setPlugins(registeredPlugins);

      // 测试Web模式日志
      logger.debug('Web模式 - DEBUG日志', { platform: 'web' });
      logger.info('Web应用已启动', { version: '1.0.0', mode: 'web' });
      logger.warn('Web模式 - WARN日志', { warning: '浏览器测试' });
    };

    loadPlugins();
  }, []);

  const filteredPlugins = plugins.filter(plugin =>
    plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plugin.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePluginClick = async (pluginId: string) => {
    // Web 模式：使用modal显示插件
    console.log('handlePluginClick called with pluginId:', pluginId);

    setActivePluginId(pluginId);
    storageService.updatePluginLastUsed(pluginId);

    // 记录日志
    logger.info('Opening plugin in modal', { pluginId });
  };

  return (
    <>
      <div className={`app-container ${theme}`}>
        <div className="main-window">
          <WindowControls
            themeId={theme === 'light' ? 'light-blue' : 'dark-ocean'}
            onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            onMinimize={() => console.log('Minimize')}
            onMaximize={() => console.log('Maximize')}
            onClose={() => console.log('Close')}
            onOpenSettings={() => console.log('Open Settings')}
            onOpenPluginManager={() => console.log('Open Plugin Manager')}
            onOpenPluginMarket={() => setShowPluginMarket(true)}
          />

          <div className="content">
            <div className="header">
              <h1 className="title">Desktop Tool</h1>
              <p className="subtitle">Your powerful productivity platform</p>
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

        {showPluginMarket && (
          <PluginMarketPanel onClose={() => setShowPluginMarket(false)} />
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
