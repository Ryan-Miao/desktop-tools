import React, { useMemo, useState } from 'react';
import { storageService } from '../services/StorageService';
import logger from '../services/LoggerService';
import './PluginList.css';

interface Plugin {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface PluginListProps {
  plugins: Plugin[];
  searchQuery: string;
  onPluginClick?: (pluginId: string) => void;
}

type LayoutMode = 'grid-icons' | 'grid' | 'list';

const PluginList: React.FC<PluginListProps> = ({ plugins, searchQuery, onPluginClick }) => {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('grid');
  const [gridColumns, setGridColumns] = useState(6);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [, forceUpdate] = useState({});
  const [hoveredPluginId, setHoveredPluginId] = useState<string | null>(null);

  // 加载布局设置和常用插件
  React.useEffect(() => {
    const loadSettings = () => {
      const settings = storageService.getAppSettings();
      setLayoutMode(settings.layoutMode || 'grid');
      setGridColumns(settings.gridColumns || 6);
      loadFavorites();
    };

    loadSettings();

    // 监听 storage 变化（每秒检查一次）
    const interval = setInterval(() => {
      const settings = storageService.getAppSettings();
      if (settings.layoutMode !== layoutMode) {
        setLayoutMode(settings.layoutMode || 'grid');
      }
      if (settings.gridColumns !== gridColumns) {
        setGridColumns(settings.gridColumns || 6);
      }
      forceUpdate({});
    }, 1000);

    return () => clearInterval(interval);
  }, [layoutMode, gridColumns]);

  const loadFavorites = () => {
    const favPlugins = storageService.getFavoritePlugins();
    setFavorites(new Set(favPlugins));
  };

  // 切换收藏状态
  const handleToggleFavorite = (e: React.MouseEvent, pluginId: string) => {
    e.stopPropagation();
    const newFavorites = storageService.togglePluginFavorite(pluginId);
    if (newFavorites) {
      setFavorites(prev => new Set(prev).add(pluginId));
    } else {
      setFavorites(prev => {
        const next = new Set(prev);
        next.delete(pluginId);
        return next;
      });
    }
  };

  // 拖拽相关函数
  const handleDragStart = (e: React.DragEvent, pluginId: string) => {
    logger.debug('Drag start', { pluginId });
    setDraggedItem(pluginId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', pluginId);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    document.querySelectorAll('.drag-over').forEach(el => {
      el.classList.remove('drag-over');
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedItem) {
      e.currentTarget.classList.add('drag-over');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e: React.DragEvent, targetPluginId: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');

    if (!draggedItem || draggedItem === targetPluginId) {
      return;
    }

    const favPlugins = storageService.getFavoritePlugins();
    const draggedIndex = favPlugins.indexOf(draggedItem);
    const targetIndex = favPlugins.indexOf(targetPluginId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const newOrder = [...favPlugins];
      newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedItem);

      newOrder.forEach((id, index) => {
        storageService.updatePluginState(id, { order: index });
      });

      loadFavorites();
      forceUpdate({});
    }

    setDraggedItem(null);
  };

  // 分类插件
  const { favoritePlugins, otherPlugins } = useMemo(() => {
    // 搜索模式：不分区
    if (searchQuery.trim()) {
      return {
        favoritePlugins: [],
        otherPlugins: []
      };
    }

    const allPluginStates = storageService.getPluginsState();
    const fav = plugins.filter(p => favorites.has(p.id));
    const other = plugins.filter(p => !favorites.has(p.id));

    const sortedFav = fav.sort((a, b) => {
      const stateA = allPluginStates.find(s => s.id === a.id);
      const stateB = allPluginStates.find(s => s.id === b.id);
      const orderA = stateA?.order ?? 999;
      const orderB = stateB?.order ?? 999;
      return orderA - orderB;
    });

    return {
      favoritePlugins: sortedFav,
      otherPlugins: other
    };
  }, [plugins, favorites, searchQuery]);

  // ========== 渲染插件卡片 ==========
  const renderPluginCard = (plugin: Plugin, isFavorite: boolean = false) => {
    const canDrag = isFavorite && layoutMode !== 'grid-icons';
    const isFav = favorites.has(plugin.id);

    return (
      <div
        key={plugin.id}
        className={`plugin-card layout-${layoutMode}`}
        onClick={() => onPluginClick?.(plugin.id)}
        draggable={canDrag}
        onDragStart={canDrag ? (e) => handleDragStart(e, plugin.id) : undefined}
        onDragEnd={canDrag ? handleDragEnd : undefined}
        onDragOver={canDrag ? handleDragOver : undefined}
        onDragEnter={canDrag ? handleDragEnter : undefined}
        onDragLeave={canDrag ? handleDragLeave : undefined}
        onDrop={canDrag ? (e) => handleDrop(e, plugin.id) : undefined}
        onMouseEnter={() => setHoveredPluginId(plugin.id)}
        onMouseLeave={() => setHoveredPluginId(null)}
        style={{ cursor: canDrag ? 'grab' : 'pointer' }}
      >
        <div className="plugin-icon">{plugin.icon}</div>

        {/* 图标网格模式：只显示图标 */}
        {layoutMode === 'grid-icons' && null}

        {/* 普通网格模式：显示名称 */}
        {layoutMode === 'grid' && (
          <div className="plugin-info">
            <h3 className="plugin-name">{plugin.name}</h3>
          </div>
        )}

        {/* 列表模式：显示所有信息 */}
        {layoutMode === 'list' && (
          <>
            <div className="plugin-info">
              <h3 className="plugin-name">{plugin.name}</h3>
              <p className="plugin-description">{plugin.description}</p>
            </div>
            <div className="plugin-actions">
              <button
                className={`favorite-button ${isFav ? 'is-favorite' : ''}`}
                onClick={(e) => handleToggleFavorite(e, plugin.id)}
                title={isFav ? '从常用移除' : '添加到常用'}
              >
                {isFav ? '⭐' : '☆'}
              </button>
              <button className="plugin-button">打开</button>
            </div>
          </>
        )}

        {/* 悬浮提示：显示完整信息 */}
        {hoveredPluginId === plugin.id && layoutMode !== 'list' && (
          <div className="plugin-tooltip">
            <div className="tooltip-content">
              <h4 className="tooltip-name">
                <span style={{ fontSize: '20px' }}>{plugin.icon}</span>
                {plugin.name}
              </h4>
              <p className="tooltip-description">{plugin.description}</p>
              <div className="tooltip-actions">
                <button
                  className={`tooltip-favorite ${isFav ? 'is-favorite' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFavorite(e, plugin.id);
                  }}
                  title={isFav ? '从常用移除' : '添加到常用'}
                >
                  <span>{isFav ? '⭐' : '☆'}</span>
                  <span>{isFav ? '已收藏' : '收藏'}</span>
                </button>
                <button
                  className="tooltip-open"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPluginClick?.(plugin.id);
                  }}
                >
                  打开插件
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ========== 搜索结果渲染（独立） ==========
  const renderSearchResult = (plugin: Plugin) => {
    const isFav = favorites.has(plugin.id);

    return (
      <div
        key={plugin.id}
        className="search-result-item"
        onClick={() => onPluginClick?.(plugin.id)}
      >
        <div className="search-result-icon">{plugin.icon}</div>
        <div className="search-result-content">
          <div className="search-result-header">
            <h3 className="search-result-name">{plugin.name}</h3>
            <span className={`search-result-favorite ${isFav ? 'is-favorite' : ''}`}>
              {isFav ? '⭐' : '☆'}
            </span>
          </div>
          <p className="search-result-description">{plugin.description}</p>
        </div>
        <button className="search-result-button">打开</button>
      </div>
    );
  };

  const isSearchMode = searchQuery.trim();

  // 计算网格样式
  const getGridStyle = () => {
    if (layoutMode === 'grid') {
      logger.debug(`Applying grid layout with ${gridColumns} columns`);
      return {
        display: 'grid',
        gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
        gap: '12px'
      };
    }
    if (layoutMode === 'grid-icons') {
      logger.debug(`Applying grid-icons layout with ${gridColumns} columns`);
      return {
        display: 'grid',
        gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
        gap: '8px'
      };
    }
    return {};
  };

  return (
    <div className="plugin-list-container">
      {/* 搜索模式：独立渲染 */}
      {isSearchMode && (
        <div className="search-results-container">
          <div className="section-header">
            <h2>🔍 搜索结果</h2>
            <span className="section-count">{plugins.length}</span>
          </div>

          {plugins.length === 0 ? (
            <div className="empty-state">
              <p>没有找到匹配的插件</p>
            </div>
          ) : (
            <div className="search-results-list">
              {plugins.map(plugin => renderSearchResult(plugin))}
            </div>
          )}
        </div>
      )}

      {/* 非搜索模式：正常渲染 */}
      {!isSearchMode && (
        <>
          {favoritePlugins.length > 0 && (
            <>
              <div className="section-header">
                <h2>⭐ 常用</h2>
                <span className="section-count">{favoritePlugins.length}</span>
              </div>
              <div
                className={`plugin-list section-favorites layout-${layoutMode}`}
                style={getGridStyle()}
              >
                {favoritePlugins.map(plugin => renderPluginCard(plugin, true))}
              </div>
              <div className="section-divider"></div>
            </>
          )}

          {otherPlugins.length > 0 && (
            <>
              <div className="section-header">
                <h2>📦 全部</h2>
                <span className="section-count">{otherPlugins.length}</span>
              </div>
              <div
                className={`plugin-list layout-${layoutMode}`}
                style={getGridStyle()}
              >
                {otherPlugins.map(plugin => renderPluginCard(plugin, false))}
              </div>
            </>
          )}

          {plugins.length === 0 && favoritePlugins.length === 0 && (
            <div className="empty-state">
              <p>没有插件</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PluginList;
