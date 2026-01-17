import './BackupPanel.css';
import React, { useState, useEffect } from 'react';
import { createLogger } from '../../shared/logger';

const logger = createLogger('BackupPanel');

interface Plugin {
  plugin_id: string;
  plugin_name: string;
  plugin_version?: string;
}

const BackupPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [selectedPlugins, setSelectedPlugins] = useState<Set<string>>(new Set());
  const [includeAppSettings, setIncludeAppSettings] = useState(true);
  const [includeDatabase, setIncludeDatabase] = useState(true);

  // 恢复选项
  const [restorePlugins, setRestorePlugins] = useState(true);
  const [restoreAppSettings, setRestoreAppSettings] = useState(true);
  const [restoreDatabase, setRestoreDatabase] = useState(false);

  // 加载插件列表
  useEffect(() => {
    loadPlugins();
  }, []);

  const loadPlugins = async () => {
    try {
      if (!window.electron?.ipcRenderer) return;
      const result = await window.electron.ipcRenderer.invoke('db:get-plugin-list');
      if (result && Array.isArray(result)) {
        setPlugins(result);
        // 默认全选所有插件
        setSelectedPlugins(new Set(result.map((p: Plugin) => p.plugin_id)));
      }
    } catch (error) {
      logger.error('Failed to load plugins', { error });
    }
  };

  // 全选/取消全选插件
  const toggleSelectAll = () => {
    if (selectedPlugins.size === plugins.length) {
      setSelectedPlugins(new Set());
    } else {
      setSelectedPlugins(new Set(plugins.map(p => p.plugin_id)));
    }
  };

  // 切换单个插件选择
  const togglePlugin = (pluginId: string) => {
    const newSelected = new Set(selectedPlugins);
    if (newSelected.has(pluginId)) {
      newSelected.delete(pluginId);
    } else {
      newSelected.add(pluginId);
    }
    setSelectedPlugins(newSelected);
  };

  // 创建选择性备份
  const handleCreateBackup = async () => {
    setLoading(true);
    setMessage('');
    try {
      const options = {
        includePlugins: true,
        pluginIds: Array.from(selectedPlugins),
        includeAppSettings,
        includeDatabase
      };

      const result = await window.electron!.ipcRenderer.invoke('backup:create-selective', options);
      if (result.success) {
        setMessage(`✅ 备份创建成功！\n\n文件位置: ${result.filePath}\n\n备份内容：\n- 插件：${selectedPlugins.size} 个\n- 应用设置：${includeAppSettings ? '✓' : '✗'}\n- 数据库：${includeDatabase ? '✓' : '✗'}\n\n建议将备份文件保存在安全的位置。`);
      } else {
        setMessage(`❌ 备份失败: ${result.error}`);
      }
    } catch (error) {
      setMessage(`❌ 备份失败: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // 导入恢复备份
  const handleImportBackup = async () => {
    setLoading(true);
    setMessage('');
    try {
      const options = {
        pluginIds: restorePlugins ? undefined : [], // 如果不恢复插件，传空数组
        includeAppSettings: restoreAppSettings,
        includeDatabase: restoreDatabase
      };

      const result = await window.electron!.ipcRenderer.invoke('backup:restore-selective', options);
      if (result.success) {
        setMessage(`✅ 备份恢复成功！\n\n应用将在 2 秒后重新启动以加载新数据...`);
        setTimeout(() => {
          if (window.electron?.ipcRenderer) {
            window.electron.ipcRenderer.send('app:relaunch');
          } else {
            window.location.reload();
          }
        }, 2000);
      } else {
        setMessage(`❌ 恢复失败: ${result.error}`);
      }
    } catch (error) {
      setMessage(`❌ 恢复失败: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // 清除消息
  const clearMessage = () => {
    setMessage('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content backup-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>💾 数据备份与导入</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* 导出备份 */}
          <div className="backup-section export-section">
            <div className="section-header">
              <h3>📤 导出备份</h3>
              <span className="section-icon">💾</span>
            </div>
            <p className="section-desc">
              选择要备份的内容，建议定期备份以防数据丢失。
            </p>

            {/* 备份选项 */}
            <div className="backup-options">
              <div className="option-header">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedPlugins.size === plugins.length && plugins.length > 0}
                    onChange={toggleSelectAll}
                  />
                  <span>选择插件 ({selectedPlugins.size}/{plugins.length})</span>
                </label>
              </div>

              {plugins.length > 0 ? (
                <div className="plugins-grid">
                  {plugins.map(plugin => (
                    <label key={plugin.plugin_id} className="plugin-checkbox-item">
                      <input
                        type="checkbox"
                        checked={selectedPlugins.has(plugin.plugin_id)}
                        onChange={() => togglePlugin(plugin.plugin_id)}
                      />
                      <span className="plugin-name">{plugin.plugin_name}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="empty-state">暂无插件数据</p>
              )}

              <div className="other-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={includeAppSettings}
                    onChange={(e) => setIncludeAppSettings(e.target.checked)}
                  />
                  <span>应用设置（主题、语言等）</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={includeDatabase}
                    onChange={(e) => setIncludeDatabase(e.target.checked)}
                  />
                  <span>数据库（统计数据等）</span>
                </label>
              </div>
            </div>

            <button
              className="action-button export-button"
              onClick={handleCreateBackup}
              disabled={loading || selectedPlugins.size === 0}
            >
              {loading ? '⏳ 导出中...' : '📦 创建备份文件'}
            </button>
          </div>

          {/* 导入备份 */}
          <div className="backup-section import-section">
            <div className="section-header">
              <h3>📥 导入备份</h3>
              <span className="section-icon">♻️</span>
            </div>
            <p className="section-desc warning">
              ⚠️ 从备份文件恢复数据将覆盖当前选定内容！请谨慎操作。
            </p>

            {/* 恢复选项 */}
            <div className="restore-options">
              <h4>选择要恢复的内容：</h4>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={restorePlugins}
                  onChange={(e) => setRestorePlugins(e.target.checked)}
                />
                <span>插件数据</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={restoreAppSettings}
                  onChange={(e) => setRestoreAppSettings(e.target.checked)}
                />
                <span>应用设置</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={restoreDatabase}
                  onChange={(e) => setRestoreDatabase(e.target.checked)}
                />
                <span>数据库（统计数据）</span>
              </label>
            </div>

            <button
              className="action-button import-button"
              onClick={handleImportBackup}
              disabled={loading || (!restorePlugins && !restoreAppSettings && !restoreDatabase)}
            >
              {loading ? '⏳ 导入中...' : '📂 选择备份文件并恢复'}
            </button>
          </div>

          {/* 消息提示 */}
          {message && (
            <div className={`message-box ${message.includes('✅') ? 'success' : 'error'}`}>
              <div className="message-content">
                <pre>{message}</pre>
                <button className="message-close" onClick={clearMessage}>
                  知道了
                </button>
              </div>
            </div>
          )}

          {/* 备份说明 */}
          <div className="info-section">
            <h4>ℹ️ 备份说明</h4>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-icon">📁</span>
                <div>
                  <strong>插件数据</strong>
                  <p>每个插件独立存储，可选择备份</p>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon">⚙️</span>
                <div>
                  <strong>应用设置</strong>
                  <p>主题、语言、面板透明度等</p>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon">📊</span>
                <div>
                  <strong>数据库</strong>
                  <p>键盘、鼠标等统计数据</p>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon">🔐</span>
                <div>
                  <strong>文件格式</strong>
                  <p>ZIP 压缩格式，包含 manifest.json</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupPanel;
