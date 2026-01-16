import React, { useState, useEffect } from 'react';
import { getThemeById } from '../themes/themes';
import './WindowControls.css';

interface WindowControlsProps {
  themeId: string;
  onToggleTheme: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
  onOpenSettings: () => void;
  onOpenPluginManager: () => void;
}

const WindowControls: React.FC<WindowControlsProps> = ({
  themeId,
  onToggleTheme,
  onMinimize,
  onMaximize,
  onClose,
  onOpenSettings,
  onOpenPluginManager
}) => {
  const theme = getThemeById(themeId);
  const mode = theme?.mode || 'light';
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    // Check if window is maximized
    const checkMaximized = async () => {
      if (window.electron?.ipcRenderer) {
        const maximized = await window.electron.ipcRenderer.invoke('window:is-maximized');
        setIsMaximized(maximized);
      }
    };

    checkMaximized();

    // Listen for maximize/unmaximize events
    if (window.electron?.ipcRenderer) {
      const handleMaximize = () => setIsMaximized(true);
      const handleUnmaximize = () => setIsMaximized(false);

      window.electron.ipcRenderer.on('window:maximized', handleMaximize);
      window.electron.ipcRenderer.on('window:unmaximized', handleUnmaximize);

      return () => {
        window.electron.ipcRenderer.removeAllListeners('window:maximized');
        window.electron.ipcRenderer.removeAllListeners('window:unmaximized');
      };
    }
  }, []);

  const handleMaximizeClick = () => {
    onMaximize();
    // Optimistically update the state
    setIsMaximized(!isMaximized);
  };

  return (
    <div className="window-controls">
      <div className="window-buttons">
        <button
          className="window-button window-button-close"
          onClick={onClose}
          aria-label="Close"
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path
              d="M1 1L11 11M1 11L11 1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <button
          className="window-button window-button-minimize"
          onClick={onMinimize}
          aria-label="Minimize"
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path
              d="M2 6H10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <button
          className="window-button window-button-maximize"
          onClick={handleMaximizeClick}
          aria-label="Maximize"
        >
          {isMaximized ? (
            <svg width="12" height="12" viewBox="0 0 12 12">
              <rect
                x="2"
                y="2"
                width="8"
                height="8"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                rx="1"
              />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12">
              <rect
                x="1"
                y="1"
                width="10"
                height="10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                rx="2"
              />
            </svg>
          )}
        </button>
      </div>

      <div className="control-buttons">
        <button
          className="plugin-toggle"
          onClick={onOpenPluginManager}
          aria-label="Plugin Manager"
          title="插件管理"
        >
          🧩
        </button>
        <button
          className="settings-toggle"
          onClick={onOpenSettings}
          aria-label="Settings"
          title="设置"
        >
          ⚙️
        </button>
        <button
          className="theme-toggle"
          onClick={onToggleTheme}
          aria-label="Toggle theme"
        >
          {mode === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </div>
  );
};

export default WindowControls;
