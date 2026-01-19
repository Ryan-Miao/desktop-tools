import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { pluginRegistry } from './services/PluginRegistry';
import { themes, applyTheme } from './themes/themes';
import { storageService } from './services/StorageService';
import { remotePluginLoader } from './services/RemotePluginLoader';
import { createLogger } from '../shared/logger';
import Loading from './components/Loading/Loading';

const logger = createLogger('StandaloneApp');

interface PluginLoadError {
  message: string;
  pluginId: string;
}

/**
 * 独立窗口应用入口
 *
 * 使用统一的插件加载接口：
 * - 内置插件：从 PluginRegistry 直接获取
 * - 用户插件：通过 PluginRegistry.loadPluginComponent() 动态加载
 */
function StandaloneApp() {
  const [pluginId, setPluginId] = useState<string | null>(null);
  const [windowId, setWindowId] = useState<string | null>(null);
  const [themeId, setThemeId] = useState<string>('light-blue');
  const [loadError, setLoadError] = useState<PluginLoadError | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [PluginComponent, setPluginComponent] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      // 从 URL hash 获取插件 ID 和窗口 ID
      const hash = window.location.hash;
      if (hash.startsWith('#plugin-standalone/')) {
        const id = hash.replace('#plugin-standalone/', '');
        setPluginId(id);
        setWindowId(`standalone-${id}`);
        logger.info(`Loading plugin: ${id}`);
      }

      // 加载主题设置
      const settings = storageService.getAppSettings();
      setThemeId(settings.themeId);

      // 加载已安装的远程插件（桌面模式和Web模式都需要）
      try {
        const installedPlugins = storageService.getInstalledRemotePlugins();
        logger.info('Loading npm plugins in standalone mode', { count: installedPlugins.length });

        for (const plugin of installedPlugins) {
          try {
            await remotePluginLoader.installPlugin(plugin.packageName, plugin.version);
            logger.info(`npm plugin loaded in standalone: ${plugin.id}`);
          } catch (error) {
            logger.error(`Failed to load npm plugin in standalone: ${plugin.id}`, { error });
          }
        }
      } catch (error) {
        logger.error('Failed to load npm plugins in standalone mode', { error });
      }

      // 标记为就绪
      setIsReady(true);
    };

    initializeApp();
  }, []);

  // 应用主题
  useEffect(() => {
    const theme = themes.find(t => t.id === themeId) || themes[0];
    document.documentElement.className = theme.mode;
    applyTheme(theme);
  }, [themeId]);

  // ESC 键关闭
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [windowId]);

  // 加载插件组件 - 使用统一接口
  const loadPluginComponent = useCallback(async () => {
    if (!pluginId || !isReady) return;

    setIsLoading(true);
    setLoadError(null);

    try {
      logger.info(`[StandaloneApp] Loading plugin component: ${pluginId}`);

      // ✅ 统一接口：内置和用户插件都通过这个方法加载
      const component = await pluginRegistry.loadPluginComponent(pluginId);

      logger.info(`[StandaloneApp] Plugin component loaded successfully: ${pluginId}`, {
        componentType: typeof component,
        componentName: component?.name || component?.displayName || 'anonymous',
        hasRender: typeof component?.prototype?.render === 'function'
      });
      setPluginComponent(() => component);
      setLoadError(null);
    } catch (error) {
      logger.error(`Error loading plugin component: ${pluginId}`, { error });
      setLoadError({
        message: `加载插件 "${pluginId}" 时发生错误: ${(error as Error).message}`,
        pluginId
      });
      setPluginComponent(null);
    } finally {
      setIsLoading(false);
    }
  }, [pluginId, isReady]);

  // 当插件 ID 改变时加载组件
  useEffect(() => {
    loadPluginComponent();
  }, [loadPluginComponent]);

  const handleClose = async () => {
    if (window.electron?.ipcRenderer && windowId) {
      await window.electron.ipcRenderer.invoke('standalone-window:close', windowId);
    }
  };

  const handleMinimize = async () => {
    if (window.electron?.ipcRenderer && windowId) {
      await window.electron.ipcRenderer.invoke('standalone-window:minimize', windowId);
    }
  };

  const handleMaximize = async () => {
    if (window.electron?.ipcRenderer && windowId) {
      await window.electron.ipcRenderer.invoke('standalone-window:maximize', windowId);
    }
  };

  // 加载中状态
  if (!isReady || !pluginId) {
    return (
      <div className="plugin-loading">
        <Loading />
        <p>加载插件中...</p>
      </div>
    );
  }

  // 动态加载中状态
  if (isLoading) {
    return (
      <div className="plugin-loading" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: '16px'
      }}>
        <Loading />
        <p style={{ fontSize: '14px', opacity: 0.7 }}>
          正在加载插件组件...
        </p>
      </div>
    );
  }

  // 错误状态
  if (loadError) {
    return (
      <div className="plugin-error" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h2>❌ 插件加载失败</h2>
        <p style={{ marginTop: '16px', color: 'var(--error-color, #dc3545)' }}>{loadError.message}</p>
        <p style={{ marginTop: '8px', fontSize: '12px', opacity: 0.7 }}>
          插件 ID: {loadError.pluginId}
        </p>
        <button
          onClick={handleClose}
          style={{
            marginTop: '24px',
            padding: '10px 20px',
            background: 'var(--primary-color, #0066CC)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          关闭窗口
        </button>
      </div>
    );
  }

  // 组件未找到
  if (!PluginComponent) {
    return (
      <div className="plugin-not-found" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h2>🔍 插件未找到</h2>
        <p style={{ marginTop: '16px' }}>无法加载请求的插件组件。</p>
        <p style={{ marginTop: '8px', fontSize: '12px', opacity: 0.7 }}>
          插件 ID: {pluginId}
        </p>
        <button
          onClick={handleClose}
          style={{
            marginTop: '24px',
            padding: '10px 20px',
            background: 'var(--primary-color, #0066CC)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          关闭窗口
        </button>
      </div>
    );
  }

  // 渲染插件
  return (
    <div className="standalone-container">
      <Suspense fallback={
        <div className="plugin-loading">
          <Loading />
          <p>加载组件中...</p>
        </div>
      }>
        <PluginComponent
          pluginId={pluginId}
          onClose={handleClose}
          onMinimize={handleMinimize}
          onMaximize={handleMaximize}
        />
      </Suspense>
    </div>
  );
}

export default StandaloneApp;
