import React, { useState, useEffect } from 'react';
import { IPCChannels, PluginEvents } from '@shared/constants/channels';
import { PluginManifest, PluginState, PluginSource } from '@shared/types/plugin';
import { createLogger } from '../../shared/logger';
import './PluginManager.css';

const logger = createLogger('PluginManager');

interface PluginManagerProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * 增强的插件管理组件
 *
 * 功能：
 * - 插件列表展示
 * - 启用/禁用插件
 * - 安装/卸载插件
 * - 导入/导出插件
 * - 插件详情查看
 * - 远程插件加载
 */
const PluginManager: React.FC<PluginManagerProps> = ({ visible, onClose }) => {
  const [plugins, setPlugins] = useState<PluginManifest[]>([]);
  const [pluginStates, setPluginStates] = useState<PluginState[]>([]);
  const [filter, setFilter] = useState<'all' | 'enabled' | 'disabled' | 'favorite'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedPlugin, setSelectedPlugin] = useState<string | null>(null);
  const [installing, setInstalling] = useState<string | null>(null);

  // 加载插件列表
  useEffect(() => {
    if (visible) {
      loadPlugins();
      loadPluginStates();
    }
  }, [visible]);

  const loadPlugins = async () => {
    try {
      const pluginList = await window.electron?.ipcRenderer?.invoke(IPCChannels.PLUGIN_LIST) || [];
      setPlugins(pluginList);
    } catch (error) {
      logger.error('Failed to load plugins', { error });
    }
  };

  const loadPluginStates = async () => {
    try {
      const states = await window.electron?.ipcRenderer?.invoke(IPCChannels.PLUGIN_GET_ALL_STATES) || [];
      setPluginStates(states);
    } catch (error) {
      logger.error('Failed to load plugin states', { error });
    }
  };

  // 监听插件事件
  useEffect(() => {
    const handlePluginLoaded = (_event: any, pluginId: string) => {
      loadPlugins();
      loadPluginStates();
    };

    const handlePluginUnloaded = (_event: any, pluginId: string) => {
      loadPlugins();
      loadPluginStates();
    };

    const handlePluginInstalled = (_event: any, pluginId: string) => {
      loadPlugins();
      loadPluginStates();
    };

    const handlePluginUninstalled = (_event: any, pluginId: string) => {
      loadPlugins();
      loadPluginStates();
    };

    const handlePluginUpdated = (_event: any, pluginId: string) => {
      loadPlugins();
    };

    if (window.electron?.ipcRenderer) {
      window.electron.ipcRenderer.on(PluginEvents.LOADED, handlePluginLoaded);
      window.electron.ipcRenderer.on(PluginEvents.UNLOADED, handlePluginUnloaded);
      window.electron.ipcRenderer.on(PluginEvents.INSTALLED, handlePluginInstalled);
      window.electron.ipcRenderer.on(PluginEvents.UNINSTALLED, handlePluginUninstalled);
      window.electron.ipcRenderer.on(PluginEvents.UPDATED, handlePluginUpdated);
    }

    return () => {
      if (window.electron?.ipcRenderer) {
        window.electron.ipcRenderer.removeAllListeners(PluginEvents.LOADED);
        window.electron.ipcRenderer.removeAllListeners(PluginEvents.UNLOADED);
        window.electron.ipcRenderer.removeAllListeners(PluginEvents.INSTALLED);
        window.electron.ipcRenderer.removeAllListeners(PluginEvents.UNINSTALLED);
        window.electron.ipcRenderer.removeAllListeners(PluginEvents.UPDATED);
      }
    };
  }, [visible]);

  // 获取插件状态
  const getPluginState = (pluginId: string): PluginState | undefined => {
    return pluginStates.find(s => s.id === pluginId);
  };

  // 过滤插件
  const getFilteredPlugins = (): PluginManifest[] => {
    let filtered = [...plugins];

    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        (p.category && p.category.toLowerCase().includes(query)) ||
        (p.keywords && p.keywords.some(k => k.toLowerCase().includes(query)))
      );
    }

    // 状态过滤
    if (filter === 'enabled') {
      filtered = filtered.filter(p => {
        const state = getPluginState(p.id);
        return state?.enabled;
      });
    } else if (filter === 'disabled') {
      filtered = filtered.filter(p => {
        const state = getPluginState(p.id);
        return state && !state.enabled;
      });
    } else if (filter === 'favorite') {
      filtered = filtered.filter(p => {
        const state = getPluginState(p.id);
        return state?.customData?.favorite;
      });
    }

    return filtered;
  };

  const filteredPlugins = getFilteredPlugins();

  // 启用/禁用插件
  const togglePluginEnabled = async (pluginId: string) => {
    const state = getPluginState(pluginId);
    if (!state) return;

    try {
      const newState = { ...state, enabled: !state.enabled };
      // TODO: 需要添加保存插件状态的 IPC
      setPluginStates(prev => prev.map(s => s.id === pluginId ? newState : s));
    } catch (error) {
      logger.error('Failed to toggle plugin', { error });
    }
  };

  // 切换收藏
  const togglePluginFavorite = async (pluginId: string) => {
    const state = getPluginState(pluginId);
    if (!state) return;

    try {
      const newState = {
        ...state,
        customData: { ...state.customData, favorite: !state.customData?.favorite }
      };
      // TODO: 需要添加保存插件状态的 IPC
      setPluginStates(prev => prev.map(s => s.id === pluginId ? newState : s));
    } catch (error) {
      logger.error('Failed to toggle favorite', { error });
    }
  };

  // 卸载/重载插件
  const unloadPlugin = async (pluginId: string) => {
    try {
      await window.electron?.ipcRenderer?.invoke(IPCChannels.PLUGIN_UNLOAD, pluginId);
    } catch (error) {
      logger.error('Failed to unload plugin', { error });
    }
  };

  const reloadPlugin = async (pluginId: string) => {
    try {
      await window.electron?.ipcRenderer?.invoke(IPCChannels.PLUGIN_RELOAD, pluginId);
    } catch (error) {
      logger.error('Failed to reload plugin', { error });
    }
  };

  // 卸载插件
  const uninstallPlugin = async (pluginId: string) => {
    if (!confirm(`确定要卸载插件 "${pluginId}" 吗？`)) {
      return;
    }

    try {
      await window.electron?.ipcRenderer?.invoke(IPCChannels.PLUGIN_UNINSTALL, pluginId);
    } catch (error) {
      logger.error('Failed to uninstall plugin', { error });
    }
  };

  // 导入插件
  const handleImportPlugin = async (file: File) => {
    if (!file) return;

    // 检查文件类型
    if (!file.name.endsWith('.zip')) {
      alert('请选择 ZIP 格式的插件文件');
      return;
    }

    try {
      // 读取文件
      const arrayBuffer = await file.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: 'application/zip' });

      // 保存到临时目录（需要主进程处理）
      const formData = new FormData();
      formData.append('plugin', blob, file.name);

      // TODO: 添加导入插件的 IPC 处理
      setInstalling(file.name);

      setTimeout(() => {
        setInstalling(null);
        loadPlugins();
        loadPluginStates();
      }, 2000);
    } catch (error) {
      logger.error('Failed to import plugin', { error });
      alert(`导入插件失败: ${error}`);
    }
  };

  // 导出插件
  const exportPlugin = async (pluginId: string) => {
    try {
      const result = await window.electron?.ipcRenderer?.invoke(IPCChannels.PLUGIN_EXPORT, pluginId);
      if (result?.canceled) {
        logger.info('Export canceled');
        return;
      }
      if (result?.exported) {
        logger.info('Plugin exported successfully', { pluginId, path: result.path });
        alert(`插件已导出到:\n${result.path}`);
      }
    } catch (error) {
      logger.error('Failed to export plugin', { error });
      alert(`导出插件失败: ${error}`);
    }
  };

  // 导入插件
  const importPlugin = async () => {
    try {
      const result = await window.electron?.ipcRenderer?.invoke(IPCChannels.PLUGIN_IMPORT);
      if (result?.canceled) {
        logger.info('Import canceled');
        return;
      }
      if (result?.imported) {
        logger.info('Plugin imported successfully', { path: result.path });
        alert(`插件导入成功！\n${result.path}`);
        // 重新加载插件列表
        loadPlugins();
        loadPluginStates();
      }
    } catch (error) {
      logger.error('Failed to import plugin', { error });
      alert(`导入插件失败: ${error}`);
    }
  };

  // // 检查更新
  const checkUpdates = async () => {
    try {
      await window.electron?.ipcRenderer?.invoke(IPCChannels.PLUGIN_CHECK_UPDATES);
    } catch (error) {
      logger.error('Failed to check updates', { error });
    }
  };

  // 获取插件来源标签
  const getSourceLabel = (pluginId: string): string => {
    const state = getPluginState(pluginId);
    if (!state) return 'Unknown';

    switch (state.source) {
      case PluginSource.BUILTIN:
        return '内置';
      case PluginSource.LOCAL:
        return '本地';
      case PluginSource.REMOTE:
        return '远程';
      default:
        return 'Unknown';
    }
  };

  if (!visible) return null;

  return (
    <div className="plugin-manager-overlay" onClick={onClose}>
      <div className="plugin-manager-modal" onClick={(e) => e.stopPropagation()}>
        {/* 头部 */}
        <div className="plugin-manager-header">
          <h2 className="plugin-manager-title">插件管理</h2>
          <button className="plugin-manager-close" onClick={onClose}>✕</button>
        </div>

        {/* 工具栏 */}
        <div className="plugin-manager-toolbar">
          {/* 搜索框 */}
          <input
            className="plugin-manager-search"
            type="text"
            placeholder="搜索插件..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* 过滤器 */}
          <div className="plugin-manager-filters">
            <button
              className={`plugin-manager-filter ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              全部
            </button>
            <button
              className={`plugin-manager-filter ${filter === 'enabled' ? 'active' : ''}`}
              onClick={() => setFilter('enabled')}
            >
              已启用
            </button>
            <button
              className={`plugin-manager-filter ${filter === 'disabled' ? 'active' : ''}`}
              onClick={() => setFilter('disabled')}
            >
              已禁用
            </button>
            <button
              className={`plugin-manager-filter ${filter === 'favorite' ? 'active' : ''}`}
              onClick={() => setFilter('favorite')}
            >
              已收藏
            </button>
          </div>

          {/* 操作按钮 */}
          <div className="plugin-manager-actions">
            <button
              className="plugin-manager-button plugin-manager-button-import"
              onClick={importPlugin}
              title="从 ZIP 文件导入插件"
            >
              📥 导入插件
            </button>
            <button
              className="plugin-manager-button plugin-manager-button-update"
              onClick={checkUpdates}
              title="检查更新"
            >
              检查更新
            </button>
          </div>
        </div>

        {/* 插件列表 */}
        <div className="plugin-manager-content">
          {filteredPlugins.length === 0 ? (
            <div className="plugin-manager-empty">
              {searchQuery ? '未找到匹配的插件' : '没有插件'}
            </div>
          ) : (
            <div className="plugin-manager-list">
              {filteredPlugins.map((plugin) => {
                const state = getPluginState(plugin.id);
                const isEnabled = state?.enabled ?? true;
                const isFavorite = state?.customData?.favorite ?? false;

                return (
                  <div
                    key={plugin.id}
                    className={`plugin-manager-item ${selectedPlugin === plugin.id ? 'selected' : ''}`}
                    onClick={() => setSelectedPlugin(plugin.id === selectedPlugin ? null : plugin.id)}
                  >
                    {/* 插件信息 */}
                    <div className="plugin-manager-item-info">
                      <div className="plugin-manager-item-icon">
                        {plugin.icon}
                      </div>
                      <div className="plugin-manager-item-details">
                        <div className="plugin-manager-item-name">{plugin.name}</div>
                        <div className="plugin-manager-item-desc">{plugin.description}</div>
                        <div className="plugin-manager-item-meta">
                          <span className="plugin-manager-item-version">v{plugin.version}</span>
                          <span className="plugin-manager-item-source">{getSourceLabel(plugin.id)}</span>
                          {state?.updateAvailable && (
                            <span className="plugin-manager-item-update">有更新</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="plugin-manager-item-actions">
                      <button
                        className={`plugin-manager-action plugin-manager-action-enable ${isEnabled ? 'enabled' : 'disabled'}`}
                        onClick={() => togglePluginEnabled(plugin.id)}
                        title={isEnabled ? '禁用' : '启用'}
                      >
                        {isEnabled ? '🟢' : '⚫'}
                      </button>

                      <button
                        className={`plugin-manager-action plugin-manager-action-favorite ${isFavorite ? 'active' : ''}`}
                        onClick={() => togglePluginFavorite(plugin.id)}
                        title={isFavorite ? '取消收藏' : '收藏'}
                      >
                        ⭐
                      </button>

                      <button
                        className="plugin-manager-action plugin-manager-action-reload"
                        onClick={() => reloadPlugin(plugin.id)}
                        title="重载"
                      >
                        🔄
                      </button>

                      {state?.source === PluginSource.LOCAL && (
                        <button
                          className="plugin-manager-action plugin-manager-action-uninstall"
                          onClick={() => uninstallPlugin(plugin.id)}
                          title="卸载"
                        >
                          🗑
                        </button>
                      )}

                      <button
                        className="plugin-manager-action plugin-manager-action-export"
                        onClick={() => exportPlugin(plugin.id)}
                        title="导出"
                      >
                        📤
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 插件详情面板 */}
        {selectedPlugin && (
          <div className="plugin-manager-detail">
            {(() => {
              const plugin = plugins.find(p => p.id === selectedPlugin);
              if (!plugin) return null;

              const state = getPluginState(selectedPlugin);

              return (
                <div className="plugin-detail-card">
                  <div className="plugin-detail-header">
                    <span className="plugin-detail-icon">{plugin.icon}</span>
                    <div className="plugin-detail-title-group">
                      <h3 className="plugin-detail-name">{plugin.name}</h3>
                      <button
                        className="plugin-detail-close"
                        onClick={() => setSelectedPlugin(null)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <div className="plugin-detail-body">
                    <div className="plugin-detail-section">
                      <label className="plugin-detail-label">描述：</label>
                      <p className="plugin-detail-value">{plugin.description}</p>
                    </div>

                    <div className="plugin-detail-section">
                      <label className="plugin-detail-label">版本：</label>
                      <p className="plugin-detail-value">{plugin.version}</p>
                    </div>

                    <div className="plugin-detail-section">
                      <label className="plugin-detail-label">作者：</label>
                      <p className="plugin-detail-value">{plugin.author}</p>
                    </div>

                    <div className="plugin-detail-section">
                      <label className="plugin-detail-label">插件 ID：</label>
                      <p className="plugin-detail-value">{plugin.id}</p>
                    </div>

                    <div className="plugin-detail-section">
                      <label className="plugin-detail-label">来源：</label>
                      <p className="plugin-detail-value">{getSourceLabel(plugin.id)}</p>
                    </div>

                    {plugin.category && (
                      <div className="plugin-detail-section">
                        <label className="plugin-detail-label">分类：</label>
                        <p className="plugin-detail-value">{plugin.category}</p>
                      </div>
                    )}

                    {plugin.keywords && plugin.keywords.length > 0 && (
                      <div className="plugin-detail-section">
                        <label className="plugin-detail-label">关键词：</label>
                        <p className="plugin-detail-value">
                          {plugin.keywords.join(', ')}
                        </p>
                      </div>
                    )}

                    {state && (
                      <div className="plugin-detail-section">
                        <label className="plugin-detail-label">安装时间：</label>
                        <p className="plugin-detail-value">
                          {state.installedAt ? new Date(state.installedAt).toLocaleString('zh-CN') : 'Unknown'}
                        </p>
                      </div>
                    )}

                    {state?.lastUsed && (
                      <div className="plugin-detail-section">
                        <label className="plugin-detail-label">最后使用：</label>
                        <p className="plugin-detail-value">
                          {new Date(state.lastUsed).toLocaleString('zh-CN')}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="plugin-detail-actions">
                    <button
                      className="plugin-detail-action-button"
                      onClick={() => reloadPlugin(selectedPlugin)}
                    >
                      重载插件
                    </button>

                    {state?.source === PluginSource.LOCAL && (
                      <>
                        <button
                          className="plugin-detail-action-button"
                          onClick={() => uninstallPlugin(selectedPlugin)}
                        >
                          卸载插件
                        </button>

                        <button
                          className="plugin-detail-action-button"
                          onClick={() => exportPlugin(selectedPlugin)}
                        >
                          导出插件
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* 导入插件对话框 */}
        {showImportDialog && (
          <div className="plugin-import-dialog">
            <div className="plugin-import-content">
              <h3 className="plugin-import-title">导入插件</h3>
              <p className="plugin-import-desc">选择 ZIP 格式的插件文件进行安装</p>

              <div
                className="plugin-import-drop-dzone"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add('drag-over');
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove('drag-over');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('drag-over');

                  const files = e.dataTransfer?.files;
                  if (files && files.length > 0) {
                    handleImportPlugin(files[0]);
                  }
                }}
              >
                {installing ? (
                  <div className="plugin-import-loading">
                    <div className="loading-spinner"></div>
                    <p>正在安装 {installing}...</p>
                  </div>
                ) : (
                  <>
                    <p className="plugin-import-hint">拖放 ZIP 文件到此处</p>
                    <input
                      type="file"
                      accept=".zip"
                      className="plugin-import-input"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImportPlugin(file);
                      }}
                    />
                  </>
                )}
              </div>

              <button
                className="plugin-import-cancel"
                onClick={() => {
                  setShowImportDialog(false);
                  setInstalling(null);
                }}
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PluginManager;
