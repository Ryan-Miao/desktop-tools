import React, { useEffect, useState, useMemo } from 'react';
import SearchBox from './components/SearchBox';
import PluginList from './components/PluginList';
import WindowControls from './components/WindowControls';
import { logger } from '../shared/logger';
import { pluginRegistry } from './services/PluginRegistry';

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

  // 加载插件列表
  useEffect(() => {
    // 从 pluginRegistry 加载注册的插件
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
  }, []);

  const filteredPlugins = plugins.filter(plugin =>
    plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plugin.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePluginClick = async (pluginId: string) => {
    // Web 模式：在新标签页中打开插件
    const pluginUrl = `${window.location.origin}/#/plugin-standalone/${pluginId}`;
    window.open(pluginUrl, '_blank');

    // 记录日志
    logger.info('Opening plugin in new tab', { pluginId, pluginUrl });
  };

  return (
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
    </div>
  );
}

export default App;
