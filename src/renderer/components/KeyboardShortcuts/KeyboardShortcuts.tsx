/**
 * Keyboard Shortcuts Guide Plugin
 *
 * Comprehensive keyboard shortcuts reference for developers
 */

import React, { useState, useCallback, useMemo } from 'react';
import PluginWindow from '../PluginWindow/PluginWindow';
import styles from './KeyboardShortcuts.module.css';

interface KeyboardShortcutsProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

type Category = 'all' | 'general' | 'browser' | 'editor' | 'terminal' | 'system';

interface Shortcut {
  keys: string[];
  description: string;
  category: Category;
  platform?: 'all' | 'windows' | 'mac' | 'linux';
}

const shortcuts: Shortcut[] = [
  // General
  { keys: ['Ctrl', 'C'], description: '复制', category: 'general', platform: 'all' },
  { keys: ['Ctrl', 'V'], description: '粘贴', category: 'general', platform: 'all' },
  { keys: ['Ctrl', 'X'], description: '剪切', category: 'general', platform: 'all' },
  { keys: ['Ctrl', 'Z'], description: '撤销', category: 'general', platform: 'all' },
  { keys: ['Ctrl', 'Y'], description: '重做', category: 'general', platform: 'all' },
  { keys: ['Ctrl', 'A'], description: '全选', category: 'general', platform: 'all' },
  { keys: ['Ctrl', 'F'], description: '查找', category: 'general', platform: 'all' },
  { keys: ['Ctrl', 'S'], description: '保存', category: 'general', platform: 'all' },

  // Browser
  { keys: ['Ctrl', 'T'], description: '新标签页', category: 'browser', platform: 'all' },
  { keys: ['Ctrl', 'W'], description: '关闭标签页', category: 'browser', platform: 'all' },
  { keys: ['Ctrl', 'R'], description: '刷新页面', category: 'browser', platform: 'all' },
  { keys: ['Ctrl', 'Shift', 'T'], description: '恢复关闭的标签页', category: 'browser', platform: 'all' },
  { keys: ['Ctrl', 'D'], description: '添加书签', category: 'browser', platform: 'all' },
  { keys: ['Ctrl', 'L'], description: '聚焦地址栏', category: 'browser', platform: 'all' },
  { keys: ['Ctrl', 'Tab'], description: '切换标签页', category: 'browser', platform: 'all' },
  { keys: ['Space'], description: '向下滚动', category: 'browser', platform: 'all' },
  { keys: ['Shift', 'Space'], description: '向上滚动', category: 'browser', platform: 'all' },

  // Editor
  { keys: ['Ctrl', '/'], description: '注释/取消注释', category: 'editor', platform: 'all' },
  { keys: ['Ctrl', 'Shift', 'K'], description: '删除行', category: 'editor', platform: 'all' },
  { keys: ['Alt', '↑', '↓'], description: '移动行', category: 'editor', platform: 'all' },
  { keys: ['Ctrl', 'Enter'], description: '在下方插入行', category: 'editor', platform: 'all' },
  { keys: ['Ctrl', 'Shift', 'Enter'], description: '在上方插入行', category: 'editor', platform: 'all' },
  { keys: ['Ctrl', 'D'], description: '选择单词', category: 'editor', platform: 'all' },
  { keys: ['Ctrl', 'Shift', 'D'], description: '复制行', category: 'editor', platform: 'all' },
  { keys: ['Ctrl', 'G'], description: '跳转到行', category: 'editor', platform: 'all' },
  { keys: ['Ctrl', 'Shift', 'F'], description: '全局查找', category: 'editor', platform: 'all' },
  { keys: ['F2'], description: '重命名符号', category: 'editor', platform: 'all' },

  // Terminal
  { keys: ['Ctrl', 'C'], description: '终止进程', category: 'terminal', platform: 'all' },
  { keys: ['Ctrl', 'L'], description: '清屏', category: 'terminal', platform: 'all' },
  { keys: ['Ctrl', 'A'], description: '跳到行首', category: 'terminal', platform: 'all' },
  { keys: ['Ctrl', 'E'], description: '跳到行尾', category: 'terminal', platform: 'all' },
  { keys: ['Ctrl', 'U'], description: '删除到行首', category: 'terminal', platform: 'all' },
  { keys: ['Ctrl', 'K'], description: '删除到行尾', category: 'terminal', platform: 'all' },
  { keys: ['Ctrl', 'R'], description: '搜索历史命令', category: 'terminal', platform: 'all' },
  { keys: ['↑', '↓'], description: '浏览历史命令', category: 'terminal', platform: 'all' },
  { keys: ['Tab'], description: '自动补全', category: 'terminal', platform: 'all' },
  { keys: ['Ctrl', 'Z'], description: '后台运行', category: 'terminal', platform: 'linux' },

  // System
  { keys: ['Ctrl', 'Alt', 'Del'], description: '任务管理器 (Windows)', category: 'system', platform: 'windows' },
  { keys: ['Win', 'D'], description: '显示桌面', category: 'system', platform: 'windows' },
  { keys: ['Win', 'L'], description: '锁定屏幕', category: 'system', platform: 'windows' },
  { keys: ['Win', 'E'], description: '打开文件资源管理器', category: 'system', platform: 'windows' },
  { keys: ['Cmd', 'Space'], description: 'Spotlight 搜索', category: 'system', platform: 'mac' },
  { keys: ['Cmd', 'Tab'], description: '切换应用', category: 'system', platform: 'mac' },
  { keys: ['Cmd', 'Q'], description: '退出应用', category: 'system', platform: 'mac' },
  { keys: ['Cmd', 'Option', 'Esc'], description: '强制退出', category: 'system', platform: 'mac' },
  { keys: ['Alt', 'Tab'], description: '切换窗口', category: 'system', platform: 'windows' },
  { keys: ['Ctrl', 'Alt', '←', '→'], description: '切换工作区', category: 'system', platform: 'linux' },
];

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
  onClose,
  onMinimize,
  onMaximize,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [platform, setPlatform] = useState<'all' | 'windows' | 'mac' | 'linux'>('all');

  // Filter shortcuts based on category, search, and platform
  const filteredShortcuts = useMemo(() => {
    return shortcuts.filter(shortcut => {
      const matchesCategory = selectedCategory === 'all' || shortcut.category === selectedCategory;
      const matchesSearch = searchQuery === '' ||
        shortcut.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shortcut.keys.some(key => key.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesPlatform = platform === 'all' ||
        shortcut.platform === 'all' ||
        shortcut.platform === platform;

      return matchesCategory && matchesSearch && matchesPlatform;
    });
  }, [selectedCategory, searchQuery, platform]);

  // Get platform name
  const getPlatformName = useCallback((p: typeof platform) => {
    switch (p) {
      case 'windows': return 'Windows';
      case 'mac': return 'macOS';
      case 'linux': return 'Linux';
      default: return '全部平台';
    }
  }, []);

  // Format keys for display
  const formatKeys = useCallback((keys: string[]) => {
    return keys.map((key, index) => {
      const isLast = index === keys.length - 1;
      const isFirst = index === 0;

      let displayKey = key;
      if (key === 'Ctrl') displayKey = platform === 'mac' ? '⌘' : 'Ctrl';
      if (key === 'Alt') displayKey = platform === 'mac' ? 'Option' : 'Alt';
      if (key === 'Cmd') displayKey = '⌘';
      if (key === 'Win') displayKey = '⊞';

      return (
        <span key={index} className={styles.key}>
          {displayKey}
          {!isLast && <span className={styles.keySeparator}>+</span>}
        </span>
      );
    });
  }, [platform]);

  return (
    <PluginWindow
      title="快捷键指南"
      icon="⌨️"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      className="keyboard-shortcuts-standalone"
      pluginId="keyboard-shortcuts"
      showStandaloneButton={false}
    >
      <div className={styles.container}>
        {/* Filters */}
        <div className={styles.filters}>
          {/* Search */}
          <div className={styles.searchBox}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索快捷键..."
              className={styles.searchInput}
            />
          </div>

          {/* Category Filter */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>分类</label>
            <div className={styles.filterButtons}>
              <button
                onClick={() => setSelectedCategory('all')}
                className={`${styles.filterButton} ${selectedCategory === 'all' ? styles.active : ''}`}
              >
                全部
              </button>
              <button
                onClick={() => setSelectedCategory('general')}
                className={`${styles.filterButton} ${selectedCategory === 'general' ? styles.active : ''}`}
              >
                通用
              </button>
              <button
                onClick={() => setSelectedCategory('browser')}
                className={`${styles.filterButton} ${selectedCategory === 'browser' ? styles.active : ''}`}
              >
                浏览器
              </button>
              <button
                onClick={() => setSelectedCategory('editor')}
                className={`${styles.filterButton} ${selectedCategory === 'editor' ? styles.active : ''}`}
              >
                编辑器
              </button>
              <button
                onClick={() => setSelectedCategory('terminal')}
                className={`${styles.filterButton} ${selectedCategory === 'terminal' ? styles.active : ''}`}
              >
                终端
              </button>
              <button
                onClick={() => setSelectedCategory('system')}
                className={`${styles.filterButton} ${selectedCategory === 'system' ? styles.active : ''}`}
              >
                系统
              </button>
            </div>
          </div>

          {/* Platform Filter */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>平台</label>
            <div className={styles.filterButtons}>
              <button
                onClick={() => setPlatform('all')}
                className={`${styles.filterButton} ${platform === 'all' ? styles.active : ''}`}
              >
                全部
              </button>
              <button
                onClick={() => setPlatform('windows')}
                className={`${styles.filterButton} ${platform === 'windows' ? styles.active : ''}`}
              >
                Windows
              </button>
              <button
                onClick={() => setPlatform('mac')}
                className={`${styles.filterButton} ${platform === 'mac' ? styles.active : ''}`}
              >
                macOS
              </button>
              <button
                onClick={() => setPlatform('linux')}
                className={`${styles.filterButton} ${platform === 'linux' ? styles.active : ''}`}
              >
                Linux
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className={styles.resultsInfo}>
          找到 <strong>{filteredShortcuts.length}</strong> 个快捷键
          {searchQuery && <span> 匹配 "<strong>{searchQuery}</strong>"</span>}
        </div>

        {/* Shortcuts List */}
        <div className={styles.shortcutsList}>
          {filteredShortcuts.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🔍</div>
              <p>未找到匹配的快捷键</p>
            </div>
          ) : (
            filteredShortcuts.map((shortcut, index) => (
              <div key={index} className={styles.shortcutItem}>
                <div className={styles.shortcutKeys}>
                  {formatKeys(shortcut.keys)}
                </div>
                <div className={styles.shortcutDescription}>
                  {shortcut.description}
                </div>
                <div className={styles.shortcutMeta}>
                  <span className={styles.category}>
                    {shortcut.category}
                  </span>
                  {shortcut.platform && shortcut.platform !== 'all' && (
                    <span className={styles.platform}>
                      {getPlatformName(shortcut.platform)}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Tips */}
        <div className={styles.tips}>
          <h4 className={styles.tipsTitle}>💡 使用提示</h4>
          <ul className={styles.tipsList}>
            <li>使用搜索框快速查找特定快捷键</li>
            <li>切换平台查看系统特定的快捷键</li>
            <li>按分类浏览可以更快找到相关快捷键</li>
            <li>macOS 用户会自动看到 Cmd 键替代 Ctrl 键</li>
          </ul>
        </div>
      </div>
    </PluginWindow>
  );
};

export default KeyboardShortcuts;
