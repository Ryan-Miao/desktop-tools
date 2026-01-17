import React, { useEffect, useState } from 'react';
import SearchBox from './components/SearchBox';
import PluginList from './components/PluginList';
import WindowControls from './components/WindowControls';
import { logger } from '../shared/logger';

interface Plugin {
  id: string;
  name: string;
  description: string;
  icon: string;
}

function App() {
  const [plugins, setPlugins] = useState<Plugin[]>([
    {
      id: 'json-tool',
      name: 'JSON 工具',
      description: 'JSON 序列化、压缩、转义、与 Excel 互转',
      icon: '🔧'
    }
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // 测试Web模式日志
  useEffect(() => {
    logger.debug('Web模式 - DEBUG日志', { platform: 'web' });
    logger.info('Web应用已启动', { version: '1.0.0', mode: 'web' });
    logger.warn('Web模式 - WARN日志', { warning: '浏览器测试' });
    logger.error('Web模式 - ERROR日志', { error: '测试错误' });
  }, []);

  const filteredPlugins = plugins.filter(plugin =>
    plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plugin.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

          <PluginList plugins={filteredPlugins} searchQuery={searchQuery} />
        </div>
      </div>
    </div>
  );
}

export default App;
