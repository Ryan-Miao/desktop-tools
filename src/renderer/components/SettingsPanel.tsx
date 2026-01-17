import React, { useState, useEffect, lazy, Suspense } from 'react';
import { themes, getThemeById, updatePanelOpacity } from '../themes/themes';
import { storageService } from '../services/StorageService';
import logger from '../services/LoggerService';
import { Loading } from './Loading';
import './SettingsPanel.css';

// 延迟加载非关键组件（优化设置面板加载时间）
const BackupPanel = lazy(() => import('./BackupPanel'));
const PerformanceMonitor = lazy(() => import('./PerformanceMonitor'));

interface SettingsPanelProps {
  themeId: string;
  onClose: () => void;
  onChangeTheme: (themeId: string) => void;
  onOpenBackup?: () => void;
  onOpacityChange?: (opacity: number) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ themeId, onClose, onChangeTheme, onOpenBackup, onOpacityChange }) => {
  const [debugMode, setDebugMode] = useState(false);
  const [hardwareAcceleration, setHardwareAcceleration] = useState(true);
  const [animations, setAnimations] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [panelOpacity, setPanelOpacity] = useState(85);
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'grid-icons' | 'grid' | 'list'>('grid');
  const [gridColumns, setGridColumns] = useState(6);
  const [logDirectory, setLogDirectory] = useState<string>('');
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    // Load settings from storage
    const settings = storageService.getAppSettings();
    setDebugMode(settings.debugMode ?? false);
    setHardwareAcceleration(settings.hardwareAcceleration ?? true);
    setAnimations(settings.animations ?? true);
    setAutoSave(settings.autoSave ?? true);
    setPanelOpacity(settings.panelOpacity ?? 85);
    setLayoutMode(settings.layoutMode || 'grid');
    setGridColumns(settings.gridColumns || 6);

    // 检测是否在 Electron 环境中
    const electronEnv = logger.isElectronEnv();
    setIsElectron(electronEnv);

    // 加载日志目录
    if (electronEnv) {
      loadLogDirectory();
    }

    // 初始化时应用透明度
    const opacity = settings.panelOpacity ?? 85;
    const opacityValue = opacity / 100;
    document.documentElement.style.setProperty('--panel-opacity', `${opacityValue}`);
    updatePanelOpacity(`${opacityValue}`);
  }, []);

  const loadLogDirectory = async () => {
    try {
      const directory = await logger.getLogDirectory();
      setLogDirectory(directory);
    } catch (error) {
      logger.error('Failed to load log directory', error);
    }
  };

  const handleDebugModeToggle = () => {
    const newValue = !debugMode;
    setDebugMode(newValue);
    storageService.updateAppSettings({ debugMode: newValue });
    // Reload to apply debug mode changes
    if (newValue) {
      logger.info('Debug mode enabled');
    } else {
      logger.info('Debug mode disabled');
    }
  };

  const handleHardwareAccelerationToggle = () => {
    const newValue = !hardwareAcceleration;
    setHardwareAcceleration(newValue);
    storageService.updateAppSettings({ hardwareAcceleration: newValue });
  };

  const handleAnimationsToggle = () => {
    const newValue = !animations;
    setAnimations(newValue);
    storageService.updateAppSettings({ animations: newValue });
  };

  const handleAutoSaveToggle = () => {
    const newValue = !autoSave;
    setAutoSave(newValue);
    storageService.updateAppSettings({ autoSave: newValue });
  };

  const handlePanelOpacityChange = (value: number) => {
    logger.info('Opacity changed', { value, opacityValue: value / 100 });
    setPanelOpacity(value);
    storageService.updateAppSettings({ panelOpacity: value });

    // 立即应用透明度
    const opacityValue = value / 100;
    document.documentElement.style.setProperty('--panel-opacity', `${opacityValue}`);

    updatePanelOpacity(`${opacityValue}`);
  };

  const handlePluginLayoutChange = (layout: 'grid-icons' | 'grid' | 'list') => {
    setLayoutMode(layout);
    storageService.updateAppSettings({ layoutMode: layout });
    logger.info(`Layout mode changed to: ${layout}`);
  };

  const handleGridColumnsChange = (columns: number) => {
    const clampedValue = Math.max(3, Math.min(10, columns));
    setGridColumns(clampedValue);
    storageService.updateAppSettings({ gridColumns: clampedValue });
    logger.info(`Grid columns changed to: ${clampedValue}`);
  };

  const handleChangeLogDirectory = async () => {
    if (!isElectron) {
      return;
    }

    try {
      // 这里可以添加目录选择对话框
      // 简化版：直接提示用户输入
      const newDirectory = prompt('请输入新的日志目录路径:', logDirectory);
      if (newDirectory && newDirectory !== logDirectory) {
        await logger.setLogDirectory(newDirectory);
        setLogDirectory(newDirectory);
        storageService.updateAppSettings({ logDirectory: newDirectory });
        logger.info(`Log directory changed to: ${newDirectory}`);
      }
    } catch (error) {
      logger.error('Failed to change log directory', error);
      alert('更改日志目录失败: ' + (error as Error).message);
    }
  };

  const handleOpenLogDirectory = () => {
    if (logDirectory) {
      logger.info(`Opening log directory: ${logDirectory}`);
      // 在实际应用中，这里应该打开系统文件管理器
      alert(`日志目录位置: ${logDirectory}`);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>⚙️ 设置</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* 外观设置 */}
          <section className="settings-section">
            <h3>外观</h3>

            <div className="setting-full-width">
              <label className="setting-block-label">主题</label>
              <div className="themes-grid">
                {themes.map((theme) => (
                  <div
                    key={theme.id}
                    className={`theme-card ${themeId === theme.id ? 'theme-card-active' : ''}`}
                    onClick={() => onChangeTheme(theme.id)}
                  >
                    <div
                      className="theme-preview"
                      style={{
                        background: theme.colors.background,
                        color: theme.colors.foreground
                      }}
                    >
                      <span className="theme-icon">{theme.icon}</span>
                      <div className="theme-colors">
                        <div className="theme-color-dot" style={{ background: theme.colors.primary }}></div>
                        <div className="theme-color-dot" style={{ background: theme.colors.secondary }}></div>
                        <div className="theme-color-dot" style={{ background: theme.colors.accent }}></div>
                      </div>
                    </div>
                    <div className="theme-info">
                      <span className="theme-name">{theme.name}</span>
                      <span className="theme-mode">{theme.mode === 'light' ? '浅' : '深'}</span>
                    </div>
                    {themeId === theme.id && <div className="theme-check">✓</div>}
                  </div>
                ))}
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label>语言</label>
              </div>
              <select className="setting-select" defaultValue="zh-CN">
                <option value="zh-CN">简体中文</option>
                <option value="en-US">English</option>
              </select>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label>面板透明度</label>
                <span className="setting-description">{panelOpacity}%</span>
              </div>
              <div className="opacity-slider-container">
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={panelOpacity}
                  onChange={(e) => handlePanelOpacityChange(parseInt(e.target.value))}
                  className="opacity-slider"
                />
              </div>
            </div>

            <div className="setting-full-width">
              <label className="setting-block-label">插件布局</label>
              <div className="layout-options">
                <button className={`layout-option ${layoutMode === 'grid-icons' ? 'active' : ''}`} onClick={() => handlePluginLayoutChange('grid-icons')}>
                  <span className="layout-icon">◉</span>
                  <span className="layout-name">图标</span>
                </button>
                <button className={`layout-option ${layoutMode === 'grid' ? 'active' : ''}`} onClick={() => handlePluginLayoutChange('grid')}>
                  <span className="layout-icon">▦</span>
                  <span className="layout-name">网格</span>
                </button>
                <button className={`layout-option ${layoutMode === 'list' ? 'active' : ''}`} onClick={() => handlePluginLayoutChange('list')}>
                  <span className="layout-icon">☰</span>
                  <span className="layout-name">列表</span>
                </button>
              </div>
            </div>

            {(layoutMode === 'grid' || layoutMode === 'grid-icons') && (
              <div className="setting-item">
                <div className="setting-info">
                  <label>网格列数</label>
                  <span className="setting-description">{gridColumns} 列</span>
                </div>
                <div className="grid-columns-selector">
                  <button className="column-button" onClick={() => handleGridColumnsChange(gridColumns - 1)} disabled={gridColumns <= 3}>−</button>
                  <div className="column-value">{gridColumns}</div>
                  <button className="column-button" onClick={() => handleGridColumnsChange(gridColumns + 1)} disabled={gridColumns >= 10}>+</button>
                </div>
              </div>
            )}
          </section>

          {/* 性能设置 */}
          <section className="settings-section">
            <h3>性能</h3>

            <div className="settings-grid-2">
              <div className="setting-item">
                <div className="setting-info">
                  <label>硬件加速</label>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={hardwareAcceleration} onChange={handleHardwareAccelerationToggle} />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <label>动画效果</label>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={animations} onChange={handleAnimationsToggle} />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </section>

          {/* 开发者设置 */}
          <section className="settings-section">
            <h3>开发者</h3>

            <div className="settings-grid-2">
              <div className="setting-item">
                <div className="setting-info">
                  <label>调试模式</label>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={debugMode} onChange={handleDebugModeToggle} />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </section>

          {/* 日志配置 - 仅在 Electron 中显示 */}
          {isElectron && (
            <section className="settings-section">
              <h3>日志</h3>

              <div className="setting-item">
                <div className="setting-info">
                  <label>日志目录</label>
                  <span className="setting-description" style={{ fontFamily: 'monospace', fontSize: '11px', padding: '2px 6px', background: 'var(--log-directory-bg, rgba(0,0,0,0.05))', borderRadius: '3px', display: 'inline-block', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {logDirectory || '加载中...'}
                  </span>
                </div>
                <div className="setting-value-group">
                  <button className="setting-button" onClick={handleOpenLogDirectory}>打开</button>
                  <button className="setting-button" onClick={handleChangeLogDirectory}>更改</button>
                </div>
              </div>
            </section>
          )}

          {/* 隐私设置 */}
          <section className="settings-section">
            <h3>隐私</h3>

            <div className="settings-grid-2">
              <div className="setting-item">
                <div className="setting-info">
                  <label>统计数据</label>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <label>自动保存</label>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={autoSave} onChange={handleAutoSaveToggle} />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </section>

          {/* 数据管理 */}
          <section className="settings-section">
            <h3>数据管理</h3>

            <div className="settings-grid-2">
              <div className="setting-item">
                <div className="setting-info">
                  <label>数据备份</label>
                </div>
                <button className="setting-button primary" onClick={onOpenBackup}>管理</button>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <label>性能监控</label>
                </div>
                <button className="setting-button" onClick={() => setShowPerformanceMonitor(true)}>查看</button>
              </div>
            </div>
          </section>

          {/* 关于 */}
          <section className="settings-section">
            <h3>关于</h3>

            <div className="about-info">
              <div className="app-info">
                <h4>Desktop Tool</h4>
                <p>v1.0.0</p>
              </div>
              <div className="app-links">
                <a href="#" className="app-link">GitHub</a>
                <a href="#" className="app-link">文档</a>
                <a href="#" className="app-link">反馈</a>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* 延迟加载的面板 */}
      {showPerformanceMonitor && (
        <Suspense fallback={<Loading type="dots" text="加载中..." overlay fullscreen />}>
          <PerformanceMonitor onClose={() => setShowPerformanceMonitor(false)} />
        </Suspense>
      )}
    </div>
  );
};

export default SettingsPanel;
