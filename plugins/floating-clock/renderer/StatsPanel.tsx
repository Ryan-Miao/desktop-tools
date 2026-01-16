import React, { useState, useEffect } from 'react';

interface StatsPanelProps {
  onClose: () => void;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ onClose }) => {
  const [view, setView] = useState<'realtime' | 'history'>('realtime');
  const [stats, setStats] = useState({
    keyboardCount: 0,
    mouseClickCount: 0,
    mouseDistance: 0
  });

  useEffect(() => {
    // Load stats from database
    const loadStats = async () => {
      // This would fetch actual stats from the main process
      setStats({
        keyboardCount: 1234,
        mouseClickCount: 567,
        mouseDistance: 12345.67
      });
    };

    loadStats();
    const timer = setInterval(loadStats, 5000);

    return () => clearInterval(timer);
  }, []);

  const exportToExcel = async () => {
    // Export stats to Excel
    console.log('Exporting to Excel...');
  };

  return (
    <div className="stats-panel-overlay" onClick={onClose}>
      <div className="stats-panel" onClick={(e) => e.stopPropagation()}>
        <div className="stats-header">
          <h2>统计面板</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="stats-tabs">
          <button
            className={view === 'realtime' ? 'active' : ''}
            onClick={() => setView('realtime')}
          >
            实时统计
          </button>
          <button
            className={view === 'history' ? 'active' : ''}
            onClick={() => setView('history')}
          >
            历史记录
          </button>
        </div>

        {view === 'realtime' && (
          <div className="stats-content">
            <div className="stat-card">
              <div className="stat-icon">⌨️</div>
              <div className="stat-info">
                <div className="stat-label">键盘次数</div>
                <div className="stat-value">{stats.keyboardCount}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🖱️</div>
              <div className="stat-info">
                <div className="stat-label">鼠标点击</div>
                <div className="stat-value">{stats.mouseClickCount}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📏</div>
              <div className="stat-info">
                <div className="stat-label">移动距离</div>
                <div className="stat-value">
                  {stats.mouseDistance.toFixed(2)} px
                </div>
              </div>
            </div>

            <button className="action-button" onClick={exportToExcel}>
              导出 Excel
            </button>
          </div>
        )}

        {view === 'history' && (
          <div className="stats-content">
            <div className="history-filters">
              <select>
                <option>按小时</option>
                <option>按天</option>
                <option>按周</option>
              </select>
            </div>

            <div className="history-chart">
              {/* Chart would go here */}
              <p>历史数据图表区域</p>
            </div>

            <button className="action-button" onClick={exportToExcel}>
              导出 Excel
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .stats-panel-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .stats-panel {
          width: 600px;
          max-height: 80vh;
          background: var(--background);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          overflow: hidden;
        }

        .stats-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-color);
        }

        .stats-header h2 {
          margin: 0;
          color: var(--text-primary);
        }

        .close-button {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          background: rgba(0, 0, 0, 0.1);
          color: var(--text-primary);
          font-size: 18px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .close-button:hover {
          background: rgba(0, 0, 0, 0.2);
        }

        .stats-tabs {
          display: flex;
          padding: 16px 24px 0;
          gap: 8px;
        }

        .stats-tabs button {
          padding: 8px 16px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-size: 14px;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }

        .stats-tabs button.active {
          color: var(--primary-color);
          border-bottom-color: var(--primary-color);
        }

        .stats-content {
          padding: 24px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 12px;
          margin-bottom: 12px;
        }

        .stat-icon {
          font-size: 32px;
        }

        .stat-info {
          flex: 1;
        }

        .stat-label {
          font-size: 14px;
          color: var(--text-secondary);
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .action-button {
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 8px;
          background: var(--primary-color);
          color: white;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          margin-top: 16px;
        }

        .action-button:hover {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
};

export default StatsPanel;
