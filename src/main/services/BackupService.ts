import fs from "fs";
import path from "path";
import { app, dialog, BrowserWindow, ipcMain } from "electron";
import { DatabaseService } from "../database";
import { createLogger } from "../../shared/logger";

const logger = createLogger("BackupService");

interface BackupOptions {
  includePlugins?: boolean; // 是否包含插件数据
  pluginIds?: string[]; // 指定要备份的插件ID列表
  includeAppSettings?: boolean; // 是否包含应用设置
  includeDatabase?: boolean; // 是否包含数据库（统计数据等）
}

interface BackupManifest {
  version: string;
  createdAt: string;
  platform: string;
  contents: {
    plugins: string[]; // 包含的插件列表
    appSettings: boolean; // 是否包含应用设置
    database: boolean; // 是否包含数据库
  };
}

export class BackupService {
  private db: DatabaseService;

  constructor(db: DatabaseService) {
    this.db = db;
  }

  /**
   * 创建选择性备份
   */
  async createBackup(
    options: BackupOptions = {},
  ): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      // 显示保存对话框
      const result = await dialog.showSaveDialog({
        title: "创建数据备份",
        defaultPath: path.join(
          app.getPath("downloads"),
          `desktop-tool-backup-${Date.now()}.zip`,
        ),
        filters: [
          { name: "Backup Files", extensions: ["zip"] },
          { name: "All Files", extensions: ["*"] },
        ],
      });

      if (!result.filePath) {
        return { success: false, error: "用户取消操作" };
      }

      // 创建临时目录
      const tempDir = path.join(app.getPath("temp"), `backup-${Date.now()}`);
      fs.mkdirSync(tempDir, { recursive: true });

      try {
        const manifest: BackupManifest = {
          version: app.getVersion(),
          createdAt: new Date().toISOString(),
          platform: process.platform,
          contents: {
            plugins: [],
            appSettings: options.includeAppSettings ?? true,
            database: options.includeDatabase ?? true,
          },
        };

        // 1. 备份插件数据
        if (options.includePlugins !== false) {
          const pluginsDir = path.join(tempDir, "plugins");
          fs.mkdirSync(pluginsDir, { recursive: true });

          // 获取要备份的插件列表
          let pluginList = await this.db.getPluginList();

          // 如果指定了插件ID，只备份这些插件
          if (options.pluginIds && options.pluginIds.length > 0) {
            pluginList = pluginList.filter((p) =>
              options.pluginIds!.includes(p.plugin_id),
            );
          }

          // 导出每个插件的数据
          for (const plugin of pluginList) {
            const pluginData = (await this.db.getPluginData(
              plugin.plugin_id,
            )) as {
              plugin_id: string;
              plugin_name: string;
              plugin_version: string;
              data_json: string;
            } | null;
            if (pluginData) {
              const pluginFile = path.join(
                pluginsDir,
                `${plugin.plugin_id}.json`,
              );
              fs.writeFileSync(
                pluginFile,
                JSON.stringify(
                  {
                    plugin_id: pluginData.plugin_id,
                    plugin_name: pluginData.plugin_name,
                    plugin_version: pluginData.plugin_version,
                    data: JSON.parse(pluginData.data_json),
                    exported_at: new Date().toISOString(),
                  },
                  null,
                  2,
                ),
              );
              manifest.contents.plugins.push(plugin.plugin_id);
            }
          }
        }

        // 2. 备份应用设置（从渲染进程获取）
        if (manifest.contents.appSettings) {
          const appSettings = await this.getAppSettingsFromRenderer();
          if (appSettings) {
            fs.writeFileSync(
              path.join(tempDir, "app-settings.json"),
              JSON.stringify(appSettings, null, 2),
            );
          }
        }

        // 3. 备份数据库（统计数据等）
        if (manifest.contents.database) {
          const dbPath = path.join(app.getPath("userData"), "data.db");
          if (fs.existsSync(dbPath)) {
            fs.copyFileSync(dbPath, path.join(tempDir, "data.db"));
          }
        }

        // 4. 写入 manifest.json
        fs.writeFileSync(
          path.join(tempDir, "manifest.json"),
          JSON.stringify(manifest, null, 2),
        );

        // 5. 创建ZIP文件
        const archiver = require("archiver");
        const output = fs.createWriteStream(result.filePath);
        const archive = archiver("zip", { zlib: { level: 9 } });

        return new Promise((resolve, reject) => {
          output.on("close", () => {
            fs.rmSync(tempDir, { recursive: true, force: true });
            resolve({ success: true, filePath: result.filePath });
          });

          archive.on("error", (err: Error) => {
            fs.rmSync(tempDir, { recursive: true, force: true });
            reject(err);
          });

          archive.pipe(output);
          archive.directory(tempDir, false);
          archive.finalize();
        });
      } catch (error) {
        fs.rmSync(tempDir, { recursive: true, force: true });
        throw error;
      }
    } catch (error) {
      logger.error("Backup failed", { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : "备份失败",
      };
    }
  }

  /**
   * 从渲染进程获取应用设置
   */
  private async getAppSettingsFromRenderer(): Promise<any> {
    return new Promise((resolve) => {
      const windows = BrowserWindow.getAllWindows();
      const mainWindow = windows[0];
      if (mainWindow && !mainWindow.isDestroyed()) {
        // 发送请求到渲染进程获取 localStorage 数据
        mainWindow.webContents.send("backup:request-app-settings");

        // 监听响应（设置超时）
        const timeout = setTimeout(() => resolve(null), 5000);

        const handler = (_event: any, data: any) => {
          clearTimeout(timeout);
          ipcMain.removeListener("backup:app-settings-response", handler);
          resolve(data);
        };

        ipcMain.once("backup:app-settings-response", handler);
      } else {
        resolve(null);
      }
    });
  }

  /**
   * 预览备份文件内容
   */
  async previewBackup(backupPath: string): Promise<{
    success: boolean;
    manifest?: BackupManifest;
    pluginData?: any[];
    error?: string;
  }> {
    const tempDir = path.join(app.getPath("temp"), `preview-${Date.now()}`);

    try {
      fs.mkdirSync(tempDir, { recursive: true });

      // 解压备份文件
      const unzipper = require("unzipper");
      await new Promise<void>((resolve, reject) => {
        fs.createReadStream(backupPath)
          .pipe(unzipper.Extract({ path: tempDir }))
          .on("close", resolve)
          .on("error", reject);
      });

      // 读取 manifest.json
      const manifestPath = path.join(tempDir, "manifest.json");
      if (!fs.existsSync(manifestPath)) {
        // 旧版本备份格式，使用 backup-info.json
        const oldManifestPath = path.join(tempDir, "backup-info.json");
        if (!fs.existsSync(oldManifestPath)) {
          throw new Error("无效的备份文件");
        }
      }

      let manifest: BackupManifest;
      let pluginData: any[] = [];

      if (fs.existsSync(manifestPath)) {
        // 新版本格式
        manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

        // 读取插件数据列表
        const pluginsDir = path.join(tempDir, "plugins");
        if (fs.existsSync(pluginsDir)) {
          const pluginFiles = fs.readdirSync(pluginsDir);
          for (const file of pluginFiles) {
            if (file.endsWith(".json")) {
              const pluginFilePath = path.join(pluginsDir, file);
              const pluginContent = JSON.parse(
                fs.readFileSync(pluginFilePath, "utf-8"),
              );
              pluginData.push({
                id: pluginContent.plugin_id,
                name: pluginContent.plugin_name,
                version: pluginContent.plugin_version,
                hasData: true,
              });
            }
          }
        }
      } else {
        // 旧版本格式，转换
        const oldInfo = JSON.parse(
          fs.readFileSync(path.join(tempDir, "backup-info.json"), "utf-8"),
        );
        manifest = {
          version: oldInfo.version,
          createdAt: oldInfo.createdAt,
          platform: oldInfo.platform,
          contents: {
            plugins: [],
            appSettings: true,
            database: true,
          },
        };
      }

      // 清理临时目录
      fs.rmSync(tempDir, { recursive: true, force: true });

      return { success: true, manifest, pluginData };
    } catch (error) {
      // 清理临时目录
      fs.rmSync(tempDir, { recursive: true, force: true });
      logger.error("Preview backup failed", { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : "预览失败",
      };
    }
  }

  /**
   * 选择性恢复备份
   */
  async restoreBackup(options?: {
    pluginIds?: string[]; // 要恢复的插件ID列表
    includeAppSettings?: boolean; // 是否恢复应用设置
    includeDatabase?: boolean; // 是否恢复数据库
  }): Promise<{ success: boolean; error?: string }> {
    try {
      // 显示打开文件对话框
      const result = await dialog.showOpenDialog({
        title: "选择备份文件",
        filters: [
          { name: "Backup Files", extensions: ["zip"] },
          { name: "All Files", extensions: ["*"] },
        ],
        properties: ["openFile"],
      });

      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, error: "用户取消操作" };
      }

      const backupPath = result.filePaths[0]!;
      const tempDir = path.join(app.getPath("temp"), `restore-${Date.now()}`);
      fs.mkdirSync(tempDir, { recursive: true });

      try {
        // 解压备份文件
        const unzipper = require("unzipper");
        await new Promise<void>((resolve, reject) => {
          fs.createReadStream(backupPath)
            .pipe(unzipper.Extract({ path: tempDir }))
            .on("close", resolve)
            .on("error", reject);
        });

        // 读取 manifest.json
        const manifestPath = path.join(tempDir, "manifest.json");
        let isNewFormat = fs.existsSync(manifestPath);

        let manifest: BackupManifest;
        if (isNewFormat) {
          manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
        } else {
          // 旧版本格式
          const oldInfoPath = path.join(tempDir, "backup-info.json");
          if (!fs.existsSync(oldInfoPath)) {
            throw new Error("无效的备份文件");
          }
          const oldInfo = JSON.parse(fs.readFileSync(oldInfoPath, "utf-8"));
          manifest = {
            version: oldInfo.version,
            createdAt: oldInfo.createdAt,
            platform: oldInfo.platform,
            contents: {
              plugins: [],
              appSettings: true,
              database: true,
            },
          };
        }

        // 显示确认对话框
        const confirmResult = await dialog.showMessageBox({
          type: "warning",
          title: "确认恢复",
          message: `确定要恢复备份吗？`,
          detail: `备份时间: ${new Date(manifest.createdAt).toLocaleString("zh-CN")}\n版本: ${manifest.version}\n\n此操作将覆盖当前选定数据，建议先创建备份。`,
          buttons: ["取消", "确认恢复"],
          defaultId: 0,
          cancelId: 0,
        });

        if (confirmResult.response !== 1) {
          fs.rmSync(tempDir, { recursive: true, force: true });
          return { success: false, error: "用户取消操作" };
        }

        // 恢复插件数据
        if (isNewFormat && options?.pluginIds && options.pluginIds.length > 0) {
          const pluginsDir = path.join(tempDir, "plugins");
          if (fs.existsSync(pluginsDir)) {
            for (const pluginId of options.pluginIds) {
              const pluginFile = path.join(pluginsDir, `${pluginId}.json`);
              if (fs.existsSync(pluginFile)) {
                const pluginContent = JSON.parse(
                  fs.readFileSync(pluginFile, "utf-8"),
                );
                // 保存到数据库
                this.db.savePluginData(
                  pluginContent.plugin_id,
                  pluginContent.plugin_name,
                  pluginContent.plugin_version,
                  JSON.stringify(pluginContent.data),
                );
              }
            }
          }
        }

        // 恢复应用设置
        if (
          isNewFormat &&
          manifest.contents.appSettings &&
          options?.includeAppSettings !== false
        ) {
          const appSettingsPath = path.join(tempDir, "app-settings.json");
          if (fs.existsSync(appSettingsPath)) {
            const appSettings = JSON.parse(
              fs.readFileSync(appSettingsPath, "utf-8"),
            );
            // 发送到渲染进程
            const windows = BrowserWindow.getAllWindows();
            const mainWindow = windows[0];
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send(
                "backup:restore-app-settings",
                appSettings,
              );
            }
          }
        }

        // 恢复数据库
        if (manifest.contents.database && options?.includeDatabase !== false) {
          const dbBackupPath = path.join(tempDir, "data.db");
          if (fs.existsSync(dbBackupPath)) {
            this.db.close();
            const dbPath = path.join(app.getPath("userData"), "data.db");
            fs.copyFileSync(dbBackupPath, dbPath);
            await this.db.initialize();
          }
        }

        // 清理临时目录
        fs.rmSync(tempDir, { recursive: true, force: true });

        return { success: true };
      } catch (error) {
        // 清理临时目录
        fs.rmSync(tempDir, { recursive: true, force: true });
        throw error;
      }
    } catch (error) {
      logger.error("Restore failed", { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : "恢复失败",
      };
    }
  }

  // 自动备份
  setupAutoBackup(intervalHours: number = 24) {
    const intervalMs = intervalHours * 60 * 60 * 1000;

    const doBackup = async () => {
      const backupDir = path.join(app.getPath("userData"), "backups");
      fs.mkdirSync(backupDir, { recursive: true });

      const backupPath = path.join(backupDir, `auto-backup-${Date.now()}.zip`);

      // 简化的备份逻辑（不使用对话框）
      logger.info(`Creating auto backup: ${backupPath}`);
      // 这里可以调用 createBackup 的简化版本
    };

    // 立即执行一次
    doBackup();

    // 定时执行
    setInterval(doBackup, intervalMs);

    // 只保留最近7天的备份
    const cleanOldBackups = () => {
      const backupDir = path.join(app.getPath("userData"), "backups");
      if (!fs.existsSync(backupDir)) return;

      const files = fs.readdirSync(backupDir);
      const now = Date.now();
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

      files.forEach((file) => {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);

        if (now - stats.mtimeMs > sevenDaysMs) {
          fs.unlinkSync(filePath);
          logger.info(`Deleted old backup: ${file}`);
        }
      });
    };

    // 每天清理一次
    setInterval(cleanOldBackups, 24 * 60 * 60 * 1000);
  }
}
