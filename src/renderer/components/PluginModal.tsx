import React, { useEffect, useState, useRef, Suspense } from 'react';
import { pluginRegistry } from '../services/PluginRegistry';
import { createLogger } from '../../shared/logger';
import Loading from './Loading/Loading';
import './PluginModal.css';

const logger = createLogger('PluginModal');

interface PluginModalProps {
  pluginId: string;
  onClose: () => void;
}

export default function PluginModal({ pluginId, onClose }: PluginModalProps) {
  const [PluginComponent, setPluginComponent] = useState<React.ComponentType<any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pluginInfo, setPluginInfo] = useState<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // 获取插件信息
  useEffect(() => {
    try {
      const info = pluginRegistry.getPluginInfo(pluginId);
      setPluginInfo(info);
      logger.info(`[PluginModal] Plugin info loaded: ${pluginId}`, { source: info?.source });
    } catch (err) {
      logger.error(`[PluginModal] Failed to get plugin info: ${pluginId}`, { error: err });
      setError('Failed to load plugin information');
    } finally {
      setIsLoading(false);
    }
  }, [pluginId]);

  // ESC键关闭
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // 监听来自iframe的消息
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // 只接受来自同源的iframe消息
      if (event.source !== iframeRef.current?.contentWindow) return;

      // 处理关闭请求
      if (event.data.type === 'CLOSE_MODAL') {
        onClose();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onClose]);

  // 加载插件组件（仅内置插件）
  useEffect(() => {
    const loadPlugin = async () => {
      // 远程插件不需要加载组件，使用iframe
      if (pluginInfo?.source === 'remote') {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        logger.info(`[PluginModal] Loading plugin component: ${pluginId}`);
        const component = await pluginRegistry.loadPluginComponent(pluginId);
        logger.info(`[PluginModal] Plugin component loaded successfully: ${pluginId}`);
        setPluginComponent(() => component);
      } catch (err) {
        logger.error(`[PluginModal] Failed to load plugin component: ${pluginId}`, { error: err });
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    if (pluginInfo && pluginInfo.source !== 'remote') {
      loadPlugin();
    }
  }, [pluginId, pluginInfo]);

  // 生成iframe的HTML内容（仅远程插件）
  const generateIframeContent = () => {
    if (!pluginInfo || pluginInfo.source !== 'remote') {
      return null;
    }

    // 获取插件URL和CSS URL
    const packageName = pluginInfo.packageName || 'desktop-tool-pl-qrcode';
    const version = pluginInfo.version || 'latest';
    const cssUrl = `https://esm.sh/${packageName}@${version}/dist/style.css`;
    const jsUrl = `https://esm.sh/${packageName}@${version}/dist/index.js?external=react,react-dom`;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pluginInfo.manifest?.name || pluginId}</title>
  <link rel="stylesheet" href="${cssUrl}">
  <script type="importmap">
    {
      "imports": {
        "react": "https://esm.sh/react@18.3.1",
        "react-dom/client": "https://esm.sh/react-dom@18.3.1/client"
      }
    }
  </script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    #root { width: 100%; height: 100vh; overflow: auto; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module">
    import React from 'react';
    import { createRoot } from 'react-dom/client';

    // 从父窗口获取插件ID
    const pluginId = '${pluginId}';

    // 通知父窗口关闭modal
    window.closeModal = () => {
      window.parent.postMessage({ type: 'CLOSE_MODAL' }, '*');
    };

    // 加载插件
    (async () => {
      try {
        console.log('[Plugin] Loading plugin from:', '${jsUrl}');
        // 动态导入插件
        const pluginModule = await import('${jsUrl}');
        const PluginComponent = pluginModule.default;
        console.log('[Plugin] Plugin component loaded:', PluginComponent);

        // 创建根并渲染
        const root = createRoot(document.getElementById('root'));
        root.render(
          React.createElement(PluginComponent, {
            pluginId: pluginId,
            onClose: window.closeModal
          })
        );
      } catch (error) {
        console.error('[Plugin] Failed to load plugin:', error);
        document.getElementById('root').innerHTML = '<div style="padding: 20px; color: red;">Failed to load plugin: ' + error.message + '</div>';
      }
    })();
  </script>
</body>
</html>
    `;
  };

  // 加载状态
  if (isLoading) {
    return (
      <div className="plugin-modal-overlay" onClick={onClose}>
        <div className="plugin-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="plugin-modal-loading">
            <Loading />
            <p>加载插件中...</p>
          </div>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="plugin-modal-overlay" onClick={onClose}>
        <div className="plugin-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="plugin-modal-error">
            <h2>❌ 加载失败</h2>
            <p>{error}</p>
            <p className="plugin-modal-error-hint">插件ID: {pluginId}</p>
            <button onClick={onClose}>关闭</button>
          </div>
        </div>
      </div>
    );
  }

  // 远程插件：使用iframe隔离
  if (pluginInfo?.source === 'remote') {
    const iframeContent = generateIframeContent();

    return (
      <div className="plugin-modal-overlay" onClick={onClose}>
        <div className="plugin-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="plugin-modal-header">
            <h3>{pluginInfo.manifest?.name || pluginId}</h3>
            <button
              className="plugin-modal-close"
              onClick={onClose}
              aria-label="关闭"
            >
              ✕
            </button>
          </div>
          <div className="plugin-modal-body iframe-container">
            <iframe
              ref={iframeRef}
              srcDoc={iframeContent}
              sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
              title={pluginInfo.manifest?.name || pluginId}
              className="plugin-iframe"
            />
          </div>
        </div>
      </div>
    );
  }

  // 内置插件：直接渲染组件（不使用iframe）
  return (
    <div className="plugin-modal-overlay" onClick={onClose}>
      <div className="plugin-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="plugin-modal-header">
          <h3>{pluginInfo?.manifest?.name || pluginId}</h3>
          <button
            className="plugin-modal-close"
            onClick={onClose}
            aria-label="关闭"
          >
            ✕
          </button>
        </div>
        <div className="plugin-modal-body">
          <Suspense fallback={
            <div className="plugin-modal-loading">
              <Loading />
              <p>加载组件中...</p>
            </div>
          }>
            {PluginComponent && <PluginComponent pluginId={pluginId} onClose={onClose} />}
          </Suspense>
        </div>
      </div>
    </div>
  );
}

// 辅助函数：从PluginRegistry获取插件名称（已移除，使用pluginInfo代替）
