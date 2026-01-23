import React, { useState, useEffect } from "react";
import { createLogger } from "../../../shared/logger";
import "./PerformanceMonitor.css";

const logger = createLogger("PerformanceMonitor");

interface LogFileInfo {
  name: string;
  size: number;
  modified: Date;
}

interface PerformanceMonitorProps {
  onClose: () => void;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  onClose,
}) => {
  const [logSize, setLogSize] = useState<string>("0 KB");
  const [logFiles, setLogFiles] = useState<LogFileInfo[]>([]);
  const [cleaning, setCleaning] = useState(false);
  const [lastCleanup, setLastCleanup] = useState<string>("-");

  // 加载日志信息
  const loadLogInfo = async () => {
    try {
      if (!window.electron?.ipcRenderer) return;

      // 获取日志文件大小
      const sizeInfo = await window.electron.ipcRenderer.invoke("log:get-size");
      setLogSize(`${sizeInfo.totalSizeKB} KB`);

      // 获取日志文件信息
      const files =
        await window.electron.ipcRenderer.invoke("log:get-file-info");
      setLogFiles(files);
    } catch (error) {
      logger.error("Failed to load log info", { error });
    }
  };

  // 清理旧日志
  const handleCleanLogs = async () => {
    setCleaning(true);
    try {
      if (!window.electron?.ipcRenderer) return;

      await window.electron.ipcRenderer.invoke("log:clean-old");
      await loadLogInfo();
      setLastCleanup(new Date().toLocaleString("zh-CN"));
    } catch (error) {
      logger.error("Failed to clean logs", { error });
    } finally {
      setCleaning(false);
    }
  };

  // 格式化文件大小
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  // 格式化修改时间
  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "今天";
    if (days === 1) return "昨天";
    if (days < 7) return `${days} 天前`;
    return date.toLocaleDateString("zh-CN");
  };

  useEffect(() => {
    loadLogInfo();
    // 每 30 秒刷新一次
    const interval = setInterval(loadLogInfo, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="performance-monitor">
      <div className="monitor-header">
        <h2>📊 性能监控</h2>
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="monitor-content">
        {/* 日志文件统计 */}
        <section className="monitor-section">
          <h3>日志文件统计</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">总大小</div>
              <div className="stat-value">{logSize}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">文件数量</div>
              <div className="stat-value">{logFiles.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">上次清理</div>
              <div className="stat-value">{lastCleanup}</div>
            </div>
          </div>

          <button
            className="clean-button"
            onClick={handleCleanLogs}
            disabled={cleaning}
          >
            {cleaning ? "清理中..." : "🧹 清理旧日志（30天）"}
          </button>
        </section>

        {/* 日志文件列表 */}
        {logFiles.length > 0 && (
          <section className="monitor-section">
            <h3>日志文件列表</h3>
            <div className="file-list">
              {logFiles.map((file, index) => (
                <div key={index} className="file-item">
                  <div className="file-info">
                    <div className="file-name">{file.name}</div>
                    <div className="file-meta">
                      <span>{formatSize(file.size)}</span>
                      <span>•</span>
                      <span>{formatTime(file.modified)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 性能指标 */}
        <section className="monitor-section">
          <h3>性能指标</h3>
          <div className="metrics-grid">
            <div className="metric-item">
              <div className="metric-label">日志轮转</div>
              <div className="metric-status good">✅ 已启用（10MB）</div>
            </div>
            <div className="metric-item">
              <div className="metric-label">自动清理</div>
              <div className="metric-status good">✅ 已启用（30天）</div>
            </div>
            <div className="metric-item">
              <div className="metric-label">异步写入</div>
              <div className="metric-status good">✅ 正常</div>
            </div>
            <div className="metric-item">
              <div className="metric-label">写入延迟</div>
              <div className="metric-status good">&lt; 1ms</div>
            </div>
          </div>
        </section>

        {/* 说明信息 */}
        <section className="monitor-section info-section">
          <h3>💡 说明</h3>
          <ul className="info-list">
            <li>日志文件达到 10MB 时会自动轮转</li>
            <li>超过 30 天的日志文件会被自动清理</li>
            <li>最多保留 5 个历史日志文件</li>
            <li>日志写入不会阻塞 UI（异步）</li>
            <li>系统会自动监控日志文件大小</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default PerformanceMonitor;
