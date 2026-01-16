import React, { useEffect, useState } from 'react';
import SearchBox from './components/SearchBox';
import PluginList from './components/PluginList';
import WindowControls from './components/WindowControls';

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
    },
    {
      id: 'floating-clock',
      name: '悬浮时钟',
      description: '桌面悬浮时钟，支持久坐提醒和统计功能',
      icon: '⏰'
    }
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const filteredPlugins = plugins.filter(plugin =>
    plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plugin.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`app-container ${theme}`}>
      <div className="main-window">
        <WindowControls
          theme={theme}
          onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          onMinimize={() => console.log('Minimize')}
          onClose={() => console.log('Close')}
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

          <PluginList plugins={filteredPlugins} />
        </div>
      </div>
    </div>
  );
}

export default App;
