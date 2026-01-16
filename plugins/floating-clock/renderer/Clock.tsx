import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface ClockProps {
  settings?: {
    color: string;
    fontFamily: string;
    fontSize: number;
    opacity: number;
  };
}

const FloatingClock: React.FC<ClockProps> = ({ settings }) => {
  const [time, setTime] = useState(new Date());
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date: Date) => {
    return format(date, 'yyyy-MM-dd HH:mm:ss EEEE', { locale: zhCN });
  };

  const handleDragStart = (e: React.MouseEvent) => {
    // Start dragging the window
    e.preventDefault();
    window.electron?.ipcRenderer?.send?.('window:start-drag');
  };

  return (
    <div
      className="floating-clock"
      style={{
        color: settings?.color || '#000000',
        fontFamily: settings?.fontFamily || 'system-ui',
        fontSize: `${settings?.fontSize || 14}px`,
        opacity: settings?.opacity || 1
      }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onMouseDown={handleDragStart}
    >
      <div className="clock-content">
        {formatDateTime(time)}
      </div>

      {showControls && (
        <div className="clock-controls">
          <button
            className="control-button stats-button"
            onClick={() => {
              // Open stats panel
            }}
            title="统计"
          >
            📊
          </button>
          <button
            className="control-button settings-button"
            onClick={() => {
              // Open settings panel
            }}
            title="设置"
          >
            ⚙️
          </button>
        </div>
      )}

      <style jsx>{`
        .floating-clock {
          position: relative;
          padding: 16px;
          user-select: none;
          cursor: move;
          white-space: nowrap;
        }

        .clock-content {
          font-weight: 500;
          letter-spacing: 0.5px;
        }

        .clock-controls {
          position: absolute;
          top: -8px;
          right: -8px;
          display: flex;
          gap: 4px;
        }

        .control-button {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: none;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          font-size: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .control-button:hover {
          transform: scale(1.1);
          background: rgba(0, 0, 0, 0.9);
        }
      `}</style>
    </div>
  );
};

export default FloatingClock;
