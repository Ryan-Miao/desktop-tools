import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { app, dialog } from 'electron';
import { ClockSettings } from '@shared/types/config';

export class DatabaseService {
  private db: Database.Database | null = null;

  async initialize() {
    const dbPath = path.join(app.getPath('userData'), 'data.db');
    this.db = new Database(dbPath);

    // Enable foreign keys
    this.db.pragma('foreign_keys = ON');

    // Create tables
    this.createTables();

    // 添加测试数据（仅开发环境）- 在表创建后执行
    if (process.env.NODE_ENV !== 'production') {
      // Use setTimeout to ensure tables are fully created
      setTimeout(() => {
        this.seedTestData();
      }, 100);
    }

    // Only log in development or when debug mode is enabled
    if (process.env.NODE_ENV !== 'production') {
      console.log('Database initialized at:', dbPath);
    }
  }

  private seedTestData() {
    if (!this.db) return;

    try {
      // 检查是否已有数据
      const keyboardCount = this.db.prepare('SELECT COUNT(*) as count FROM keyboard_stats').get() as { count: number };
      if (keyboardCount.count > 0) {
        return; // 已有数据，不添加测试数据
      }

      if (process.env.NODE_ENV !== 'production') {
        console.log('Seeding test data...');
      }

    // 生成最近7天的测试数据
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now - i * dayMs);
      // 使用每天中午12点的时间戳
      const timestamp = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0).toISOString();

      // 随机生成数据
      const keyboardCount = Math.floor(Math.random() * 5000) + 1000;
      const mouseClickCount = Math.floor(Math.random() * 3000) + 500;
      const mouseMoveDistance = Math.floor(Math.random() * 50000) + 10000;

      // 直接插入数据库
      this.db.prepare('INSERT INTO keyboard_stats (count, timestamp) VALUES (?, ?)').run(keyboardCount, timestamp);
      this.db.prepare('INSERT INTO mouse_click_stats (button, count, timestamp) VALUES (?, ?, ?)').run('left', mouseClickCount, timestamp);
      this.db.prepare('INSERT INTO mouse_move_stats (distance, timestamp) VALUES (?, ?)').run(mouseMoveDistance, timestamp);
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('Test data seeded successfully');
    }
    } catch (error) {
      // Table might not exist yet, or other error
      if (process.env.NODE_ENV !== 'production') {
        console.log('Skipping test data seeding:', error instanceof Error ? error.message : error);
      }
    }
  }

  private createTables() {
    if (!this.db) return;

    this.db.exec(`
      -- Clock settings table
      CREATE TABLE IF NOT EXISTS clock_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        theme TEXT DEFAULT 'light',
        color TEXT DEFAULT '#000000',
        font_family TEXT DEFAULT 'system-ui',
        font_size INTEGER DEFAULT 14,
        opacity REAL DEFAULT 1.0,
        position_x INTEGER DEFAULT 100,
        position_y INTEGER DEFAULT 100,
        work_duration INTEGER DEFAULT 3600000,
        break_duration INTEGER DEFAULT 300000,
        enable_reminder INTEGER DEFAULT 1
      );

      -- Insert default settings if not exists
      INSERT OR IGNORE INTO clock_settings (id) VALUES (1);

      -- Keyboard stats table
      CREATE TABLE IF NOT EXISTS keyboard_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        count INTEGER NOT NULL,
        timestamp DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_keyboard_stats_timestamp_unique
        ON keyboard_stats(timestamp);

      -- Mouse click stats table
      CREATE TABLE IF NOT EXISTS mouse_click_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        button TEXT NOT NULL,
        count INTEGER NOT NULL,
        timestamp DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_mouse_click_stats_button_timestamp_unique
        ON mouse_click_stats(button, timestamp);

      -- Mouse move stats table
      CREATE TABLE IF NOT EXISTS mouse_move_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        distance REAL NOT NULL,
        timestamp DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_mouse_move_stats_timestamp_unique
        ON mouse_move_stats(timestamp);

      -- Plugin data table
      CREATE TABLE IF NOT EXISTS plugin_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        plugin_id TEXT NOT NULL UNIQUE,
        plugin_name TEXT NOT NULL,
        plugin_version TEXT,
        data_json TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_plugin_data_plugin_id
        ON plugin_data(plugin_id);
    `);
  }

  // Clock settings operations
  getClockSettings(): ClockSettings | null {
    if (!this.db) return null;

    const stmt = this.db.prepare('SELECT * FROM clock_settings WHERE id = 1');
    return stmt.get() as ClockSettings | null;
  }

  updateClockSettings(settings: Partial<ClockSettings>): void {
    if (!this.db) return;

    const stmt = this.db.prepare(`
      UPDATE clock_settings
      SET theme = ?, color = ?, font_family = ?, font_size = ?,
          opacity = ?, position_x = ?, position_y = ?,
          work_duration = ?, break_duration = ?, enable_reminder = ?
      WHERE id = 1
    `);

    stmt.run(
      settings.theme,
      settings.color,
      settings.fontFamily,
      settings.fontSize,
      settings.opacity,
      settings.positionX,
      settings.positionY,
      settings.workDuration,
      settings.breakDuration,
      settings.enableReminder ? 1 : 0
    );
  }

  // Statistics operations
  saveKeyboardStats(count: number): void {
    if (!this.db) return;

    const now = new Date();
    const hourTimestamp = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours(),
      0,
      0,
      0
    ).toISOString();

    // First try to update existing record
    const updateStmt = this.db.prepare(`
      UPDATE keyboard_stats
      SET count = count + ?
      WHERE timestamp = ?
    `);

    const result = updateStmt.run(count, hourTimestamp);

    // If no rows were updated, insert a new record
    if (result.changes === 0) {
      const insertStmt = this.db.prepare(`
        INSERT INTO keyboard_stats (count, timestamp)
        VALUES (?, ?)
      `);
      insertStmt.run(count, hourTimestamp);
    }
  }

  saveMouseClickStats(button: string, count: number): void {
    if (!this.db) return;

    const now = new Date();
    const hourTimestamp = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours(),
      0,
      0,
      0
    ).toISOString();

    // First try to update existing record
    const updateStmt = this.db.prepare(`
      UPDATE mouse_click_stats
      SET count = count + ?
      WHERE button = ? AND timestamp = ?
    `);

    const result = updateStmt.run(count, button, hourTimestamp);

    // If no rows were updated, insert a new record
    if (result.changes === 0) {
      const insertStmt = this.db.prepare(`
        INSERT INTO mouse_click_stats (button, count, timestamp)
        VALUES (?, ?, ?)
      `);
      insertStmt.run(button, count, hourTimestamp);
    }
  }

  saveMouseMoveStats(distance: number): void {
    if (!this.db) return;

    const now = new Date();
    const hourTimestamp = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours(),
      0,
      0,
      0
    ).toISOString();

    // First try to update existing record
    const updateStmt = this.db.prepare(`
      UPDATE mouse_move_stats
      SET distance = distance + ?
      WHERE timestamp = ?
    `);

    const result = updateStmt.run(distance, hourTimestamp);

    // If no rows were updated, insert a new record
    if (result.changes === 0) {
      const insertStmt = this.db.prepare(`
        INSERT INTO mouse_move_stats (distance, timestamp)
        VALUES (?, ?)
      `);
      insertStmt.run(distance, hourTimestamp);
    }
  }

  getKeyboardStats(startDate: Date, endDate: Date): any[] {
    if (!this.db) return [];

    const stmt = this.db.prepare(`
      SELECT timestamp, count
      FROM keyboard_stats
      WHERE timestamp BETWEEN ? AND ?
      ORDER BY timestamp ASC
    `);

    return stmt.all(startDate.toISOString(), endDate.toISOString());
  }

  getMouseClickStats(startDate: Date, endDate: Date): any[] {
    if (!this.db) return [];

    const stmt = this.db.prepare(`
      SELECT timestamp, button, count
      FROM mouse_click_stats
      WHERE timestamp BETWEEN ? AND ?
      ORDER BY timestamp ASC
    `);

    return stmt.all(startDate.toISOString(), endDate.toISOString());
  }

  getMouseMoveStats(startDate: Date, endDate: Date): any[] {
    if (!this.db) return [];

    const stmt = this.db.prepare(`
      SELECT timestamp, distance
      FROM mouse_move_stats
      WHERE timestamp BETWEEN ? AND ?
      ORDER BY timestamp ASC
    `);

    return stmt.all(startDate.toISOString(), endDate.toISOString());
  }

  // Plugin data operations
  /**
   * 保存或更新插件数据
   */
  savePluginData(pluginId: string, pluginName: string, pluginVersion: string | undefined, dataJson: string): void {
    if (!this.db) return;

    const now = new Date().toISOString();

    // First try to update existing record
    const updateStmt = this.db.prepare(`
      UPDATE plugin_data
      SET plugin_name = ?, plugin_version = ?, data_json = ?, updated_at = ?
      WHERE plugin_id = ?
    `);

    const result = updateStmt.run(pluginName, pluginVersion, dataJson, now, pluginId);

    // If no rows were updated, insert a new record
    if (result.changes === 0) {
      const insertStmt = this.db.prepare(`
        INSERT INTO plugin_data (plugin_id, plugin_name, plugin_version, data_json, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      insertStmt.run(pluginId, pluginName, pluginVersion, dataJson, now, now);
    }
  }

  /**
   * 获取插件数据
   */
  getPluginData(pluginId: string): { plugin_id: string; plugin_name: string; plugin_version: string; data_json: string } | null {
    if (!this.db) return null;

    const stmt = this.db.prepare('SELECT * FROM plugin_data WHERE plugin_id = ?');
    return stmt.get(pluginId) as any;
  }

  /**
   * 获取所有插件数据
   */
  getAllPluginData(): any[] {
    if (!this.db) return [];

    const stmt = this.db.prepare('SELECT * FROM plugin_data ORDER BY plugin_name ASC');
    return stmt.all();
  }

  /**
   * 删除插件数据
   */
  deletePluginData(pluginId: string): void {
    if (!this.db) return;

    const stmt = this.db.prepare('DELETE FROM plugin_data WHERE plugin_id = ?');
    stmt.run(pluginId);
  }

  /**
   * 获取插件列表（用于备份选择）
   */
  getPluginList(): Array<{ plugin_id: string; plugin_name: string; plugin_version: string }> {
    if (!this.db) return [];

    const stmt = this.db.prepare('SELECT plugin_id, plugin_name, plugin_version FROM plugin_data ORDER BY plugin_name ASC');
    return stmt.all() as Array<{ plugin_id: string; plugin_name: string; plugin_version: string }>;
  }

  // Export stats to CSV
  async exportStats(data: any[]): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      // Show save dialog
      const result = await dialog.showSaveDialog({
        title: '导出统计数据',
        defaultPath: path.join(app.getPath('downloads'), `stats_${Date.now()}.csv`),
        filters: [
          { name: 'CSV Files', extensions: ['csv'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      if (!result.filePath) {
        return { success: false, error: '用户取消操作' };
      }

      // Generate CSV content
      const headers = ['日期', '键盘次数', '鼠标点击', '移动距离(米)'];
      const rows = data.map(item => [
        new Date(item.date).toLocaleString('zh-CN'),
        item.keyboard_count || 0,
        item.mouse_click_count || 0,
        ((item.mouse_move_distance || 0) / 1000).toFixed(2)
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      // Write to file
      fs.writeFileSync(result.filePath, '\uFEFF' + csvContent, 'utf-8');

      return { success: true, filePath: result.filePath };
    } catch (error) {
      console.error('Export failed:', error);
      return { success: false, error: error instanceof Error ? error.message : '导出失败' };
    }
  }

  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}
