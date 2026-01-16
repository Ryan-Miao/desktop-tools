import Database from 'better-sqlite3';
import { PluginState, WindowState, IPluginStore, PluginStoreConfig } from '@shared/types/plugin';

/**
 * 插件存储服务 - 管理插件和窗口状态的持久化
 */
export class PluginStore implements IPluginStore {
  private db: Database.Database | null = null;
  private config: PluginStoreConfig;

  constructor(config: PluginStoreConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    const Database = require('better-sqlite3');
    const path = require('path');
    const { app } = require('electron');

    const dbPath = path.join(app.getPath('userData'), this.config.dbName);
    this.db = new Database(dbPath);
    if (this.db) {
      this.db.pragma('foreign_keys = ON');
    }

    this.createTables();
  }

  private createTables(): void {
    if (!this.db) return;

    // Plugin states table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS plugin_states (
        id TEXT PRIMARY KEY,
        enabled INTEGER DEFAULT 1,
        installed INTEGER DEFAULT 1,
        source TEXT DEFAULT 'builtin',
        installed_at INTEGER DEFAULT (strftime('%s', 'now')),
        last_used INTEGER,
        update_available INTEGER DEFAULT 0,
        remote_version TEXT,
        custom_data TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_plugin_states_enabled
        ON plugin_states(enabled);

      CREATE INDEX IF NOT EXISTS idx_plugin_states_source
        ON plugin_states(source);
    `);

    // Window states table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS window_states (
        id TEXT PRIMARY KEY,
        plugin_id TEXT,
        x INTEGER,
        y INTEGER,
        width INTEGER,
        height INTEGER,
        is_maximized INTEGER DEFAULT 0,
        is_minimized INTEGER DEFAULT 0,
        is_fullscreen INTEGER DEFAULT 0,
        z_index INTEGER DEFAULT 0
      );

      CREATE INDEX IF NOT EXISTS idx_window_states_plugin_id
        ON window_states(plugin_id);
    `);
  }

  // ==================== Plugin State Operations ====================

  async saveState(pluginId: string, state: PluginState): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const insertStmt = this.db.prepare(`
      INSERT OR REPLACE INTO plugin_states
        (id, enabled, installed, source, installed_at, last_used, update_available, remote_version, custom_data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertStmt.run(
      pluginId,
      state.enabled ? 1 : 0,
      state.installed ? 1 : 0,
      state.source,
      state.installedAt || Math.floor(Date.now() / 1000),
      state.lastUsed || null,
      state.updateAvailable ? 1 : 0,
      state.remoteVersion || null,
      state.customData ? JSON.stringify(state.customData) : null
    );
  }

  async getState(pluginId: string): Promise<PluginState | undefined> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('SELECT * FROM plugin_states WHERE id = ?');
    const result = stmt.get(pluginId) as any;

    if (!result) return undefined;

    return {
      id: result.id,
      enabled: result.enabled === 1,
      installed: result.installed === 1,
      source: result.source,
      installedAt: result.installed_at,
      lastUsed: result.last_used,
      updateAvailable: result.update_available === 1,
      remoteVersion: result.remote_version,
      customData: result.custom_data ? JSON.parse(result.custom_data) : undefined
    };
  }

  async getAllStates(): Promise<PluginState[]> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('SELECT * FROM plugin_states ORDER BY installed_at DESC');
    const results = stmt.all() as any[];

    return results.map(result => ({
      id: result.id,
      enabled: result.enabled === 1,
      installed: result.installed === 1,
      source: result.source,
      installedAt: result.installed_at,
      lastUsed: result.last_used,
      updateAvailable: result.update_available === 1,
      remoteVersion: result.remote_version,
      customData: result.custom_data ? JSON.parse(result.custom_data) : undefined
    }));
  }

  async deleteState(pluginId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('DELETE FROM plugin_states WHERE id = ?');
    stmt.run(pluginId);
  }

  // ==================== Window State Operations ====================

  async saveWindowState(windowId: string, state: WindowState): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const insertStmt = this.db.prepare(`
      INSERT OR REPLACE INTO window_states
        (id, plugin_id, x, y, width, height, is_maximized, is_minimized, is_fullscreen, z_index)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertStmt.run(
      windowId,
      state.pluginId || null,
      state.x || null,
      state.y || null,
      state.width || null,
      state.height || null,
      state.isMaximized ? 1 : 0,
      state.isMinimized ? 1 : 0,
      state.isFullscreen ? 1 : 0,
      state.zIndex || null
    );
  }

  async getWindowState(windowId: string): Promise<WindowState | undefined> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('SELECT * FROM window_states WHERE id = ?');
    const result = stmt.get(windowId) as any;

    if (!result) return undefined;

    return {
      id: result.id,
      pluginId: result.plugin_id,
      x: result.x,
      y: result.y,
      width: result.width,
      height: result.height,
      isMaximized: result.is_maximized === 1,
      isMinimized: result.is_minimized === 1,
      isFullscreen: result.is_fullscreen === 1,
      zIndex: result.z_index
    };
  }

  async deleteWindowState(windowId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('DELETE FROM window_states WHERE id = ?');
    stmt.run(windowId);
  }

  // ==================== Batch Operations ====================

  async deleteAllWindowStatesForPlugin(pluginId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('DELETE FROM window_states WHERE plugin_id = ?');
    stmt.run(pluginId);
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}
