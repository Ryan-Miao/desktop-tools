import Database from "@vscode/sqlite3";
import path from "path";
import fs from "fs";
import { app, dialog } from "electron";
import { ClockSettings } from "@shared/types/config";
import { createLogger } from "../../shared/logger";

const logger = createLogger("Database");

// Helper to promisify Database methods
function dbRun(
  db: Database.Database,
  sql: string,
  params: any[] = [],
): Promise<Database.RunResult> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function dbGet(
  db: Database.Database,
  sql: string,
  params: any[] = [],
): Promise<any> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function dbAll(
  db: Database.Database,
  sql: string,
  params: any[] = [],
): Promise<any[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function dbExec(db: Database.Database, sql: string): Promise<void> {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

export class DatabaseService {
  private db: Database.Database | null = null;

  async initialize(): Promise<void> {
    const dbPath = path.join(app.getPath("userData"), "data.db");

    return new Promise((resolve, reject) => {
      // Use require to get the correct constructor
      const SQLite3 = require("@vscode/sqlite3");
      this.db = new SQLite3.Database(dbPath, (err: Error | null) => {
        if (err) {
          logger.error("Failed to open database", { error: err.message });
          reject(err);
          return;
        }

        // Create tables and continue
        this.createTables()
          .then(() => {
            // Add test data (dev only)
            if (process.env.NODE_ENV !== "production") {
              setTimeout(() => {
                this.seedTestData().catch(() => {
                  // Ignore errors
                });
              }, 100);
            }

            if (process.env.NODE_ENV !== "production") {
              logger.info("Database initialized", { path: dbPath });
            }
            resolve();
          })
          .catch(reject);
      });
    });
  }

  private async seedTestData(): Promise<void> {
    if (!this.db) return;

    try {
      // Check if data already exists
      const keyboardCount = (await dbGet(
        this.db,
        "SELECT COUNT(*) as count FROM keyboard_stats",
      )) as { count: number };

      if (keyboardCount.count > 0) {
        return;
      }

      if (process.env.NODE_ENV !== "production") {
        logger.info("Seeding test data...");
      }

      // Generate test data for last 7 days
      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;

      for (let i = 6; i >= 0; i--) {
        const date = new Date(now - i * dayMs);
        const timestamp = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          12,
          0,
          0,
        ).toISOString();

        const keyboardCount = Math.floor(Math.random() * 5000) + 1000;
        const mouseClickCount = Math.floor(Math.random() * 3000) + 500;
        const mouseMoveDistance = Math.floor(Math.random() * 50000) + 10000;

        await dbRun(
          this.db,
          "INSERT INTO keyboard_stats (count, timestamp) VALUES (?, ?)",
          [keyboardCount, timestamp],
        );
        await dbRun(
          this.db,
          "INSERT INTO mouse_click_stats (button, count, timestamp) VALUES (?, ?, ?)",
          ["left", mouseClickCount, timestamp],
        );
        await dbRun(
          this.db,
          "INSERT INTO mouse_move_stats (distance, timestamp) VALUES (?, ?)",
          [mouseMoveDistance, timestamp],
        );
      }

      if (process.env.NODE_ENV !== "production") {
        logger.info("Test data seeded successfully");
      }
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        logger.info("Skipping test data seeding", {
          error: error instanceof Error ? error.message : error,
        });
      }
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) return;

    await dbExec(
      this.db,
      `
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
    `,
    );
  }

  // Clock settings operations
  async getClockSettings(): Promise<ClockSettings | null> {
    if (!this.db) return null;

    const row = await dbGet(
      this.db,
      "SELECT * FROM clock_settings WHERE id = 1",
    );
    return row as ClockSettings | null;
  }

  async updateClockSettings(settings: Partial<ClockSettings>): Promise<void> {
    if (!this.db) return;

    await dbRun(
      this.db,
      `
      UPDATE clock_settings
      SET theme = ?, color = ?, font_family = ?, font_size = ?,
          opacity = ?, position_x = ?, position_y = ?,
          work_duration = ?, break_duration = ?, enable_reminder = ?
      WHERE id = 1
    `,
      [
        settings.theme,
        settings.color,
        settings.fontFamily,
        settings.fontSize,
        settings.opacity,
        settings.positionX,
        settings.positionY,
        settings.workDuration,
        settings.breakDuration,
        settings.enableReminder ? 1 : 0,
      ],
    );
  }

  // Statistics operations
  async saveKeyboardStats(count: number): Promise<void> {
    if (!this.db) return;

    const now = new Date();
    const hourTimestamp = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours(),
      0,
      0,
      0,
    ).toISOString();

    // First try to update existing record
    const result = await dbRun(
      this.db,
      `
      UPDATE keyboard_stats
      SET count = count + ?
      WHERE timestamp = ?
    `,
      [count, hourTimestamp],
    );

    // If no rows were updated, insert a new record
    if (result.changes === 0) {
      await dbRun(
        this.db,
        `
        INSERT INTO keyboard_stats (count, timestamp)
        VALUES (?, ?)
      `,
        [count, hourTimestamp],
      );
    }
  }

  async saveMouseClickStats(button: string, count: number): Promise<void> {
    if (!this.db) return;

    const now = new Date();
    const hourTimestamp = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours(),
      0,
      0,
      0,
    ).toISOString();

    // First try to update existing record
    const result = await dbRun(
      this.db,
      `
      UPDATE mouse_click_stats
      SET count = count + ?
      WHERE button = ? AND timestamp = ?
    `,
      [count, button, hourTimestamp],
    );

    // If no rows were updated, insert a new record
    if (result.changes === 0) {
      await dbRun(
        this.db,
        `
        INSERT INTO mouse_click_stats (button, count, timestamp)
        VALUES (?, ?, ?)
      `,
        [button, count, hourTimestamp],
      );
    }
  }

  async saveMouseMoveStats(distance: number): Promise<void> {
    if (!this.db) return;

    const now = new Date();
    const hourTimestamp = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours(),
      0,
      0,
      0,
    ).toISOString();

    // First try to update existing record
    const result = await dbRun(
      this.db,
      `
      UPDATE mouse_move_stats
      SET distance = distance + ?
      WHERE timestamp = ?
    `,
      [distance, hourTimestamp],
    );

    // If no rows were updated, insert a new record
    if (result.changes === 0) {
      await dbRun(
        this.db,
        `
        INSERT INTO mouse_move_stats (distance, timestamp)
        VALUES (?, ?)
      `,
        [distance, hourTimestamp],
      );
    }
  }

  async getKeyboardStats(startDate: Date, endDate: Date): Promise<any[]> {
    if (!this.db) return [];

    return dbAll(
      this.db,
      `
      SELECT timestamp, count
      FROM keyboard_stats
      WHERE timestamp BETWEEN ? AND ?
      ORDER BY timestamp ASC
    `,
      [startDate.toISOString(), endDate.toISOString()],
    );
  }

  async getMouseClickStats(startDate: Date, endDate: Date): Promise<any[]> {
    if (!this.db) return [];

    return dbAll(
      this.db,
      `
      SELECT timestamp, button, count
      FROM mouse_click_stats
      WHERE timestamp BETWEEN ? AND ?
      ORDER BY timestamp ASC
    `,
      [startDate.toISOString(), endDate.toISOString()],
    );
  }

  async getMouseMoveStats(startDate: Date, endDate: Date): Promise<any[]> {
    if (!this.db) return [];

    return dbAll(
      this.db,
      `
      SELECT timestamp, distance
      FROM mouse_move_stats
      WHERE timestamp BETWEEN ? AND ?
      ORDER BY timestamp ASC
    `,
      [startDate.toISOString(), endDate.toISOString()],
    );
  }

  // Plugin data operations
  /**
   * Save or update plugin data
   */
  async savePluginData(
    pluginId: string,
    pluginName: string,
    pluginVersion: string | undefined,
    dataJson: string,
  ): Promise<void> {
    if (!this.db) return;

    const now = new Date().toISOString();

    // First try to update existing record
    const result = await dbRun(
      this.db,
      `
      UPDATE plugin_data
      SET plugin_name = ?, plugin_version = ?, data_json = ?, updated_at = ?
      WHERE plugin_id = ?
    `,
      [pluginName, pluginVersion, dataJson, now, pluginId],
    );

    // If no rows were updated, insert a new record
    if (result.changes === 0) {
      await dbRun(
        this.db,
        `
        INSERT INTO plugin_data (plugin_id, plugin_name, plugin_version, data_json, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
        [pluginId, pluginName, pluginVersion, dataJson, now, now],
      );
    }
  }

  /**
   * Get plugin data
   */
  async getPluginData(
    pluginId: string,
  ): Promise<{
    plugin_id: string;
    plugin_name: string;
    plugin_version: string;
    data_json: string;
  } | null> {
    if (!this.db) return null;

    const row = await dbGet(
      this.db,
      "SELECT * FROM plugin_data WHERE plugin_id = ?",
      [pluginId],
    );
    return row as any;
  }

  /**
   * Get all plugin data
   */
  async getAllPluginData(): Promise<any[]> {
    if (!this.db) return [];

    return dbAll(this.db, "SELECT * FROM plugin_data ORDER BY plugin_name ASC");
  }

  /**
   * Delete plugin data
   */
  async deletePluginData(pluginId: string): Promise<void> {
    if (!this.db) return;

    await dbRun(this.db, "DELETE FROM plugin_data WHERE plugin_id = ?", [
      pluginId,
    ]);
  }

  /**
   * Get plugin list (for backup selection)
   */
  async getPluginList(): Promise<
    Array<{ plugin_id: string; plugin_name: string; plugin_version: string }>
  > {
    if (!this.db) return [];

    const rows = await dbAll(
      this.db,
      "SELECT plugin_id, plugin_name, plugin_version FROM plugin_data ORDER BY plugin_name ASC",
    );
    return rows as Array<{
      plugin_id: string;
      plugin_name: string;
      plugin_version: string;
    }>;
  }

  // Export stats to CSV
  async exportStats(
    data: any[],
  ): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      // Show save dialog
      const result = await dialog.showSaveDialog({
        title: "导出统计数据",
        defaultPath: path.join(
          app.getPath("downloads"),
          `stats_${Date.now()}.csv`,
        ),
        filters: [
          { name: "CSV Files", extensions: ["csv"] },
          { name: "All Files", extensions: ["*"] },
        ],
      });

      if (!result.filePath) {
        return { success: false, error: "用户取消操作" };
      }

      // Generate CSV content
      const headers = ["日期", "键盘次数", "鼠标点击", "移动距离(米)"];
      const rows = data.map((item) => [
        new Date(item.date).toLocaleString("zh-CN"),
        item.keyboard_count || 0,
        item.mouse_click_count || 0,
        ((item.mouse_move_distance || 0) / 1000).toFixed(2),
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n");

      // Write to file
      fs.writeFileSync(result.filePath, "\uFEFF" + csvContent, "utf-8");

      return { success: true, filePath: result.filePath };
    } catch (error) {
      logger.error("Export failed", { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : "导出失败",
      };
    }
  }

  close(): Promise<void> {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close((err) => {
          this.db = null;
          if (err) {
            logger.error("Error closing database", { error: err.message });
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}
