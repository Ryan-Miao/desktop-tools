/**
 * FileStorageService Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fileStorageService } from "@renderer/services/FileStorageService";

describe("FileStorageService", () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
  });

  afterEach(() => {
    delete (window as any).electron;
    localStorage.clear();
  });

  describe("savePluginData", () => {
    it("should save plugin data successfully via IPC", async () => {
      const mockInvoke = vi.fn().mockResolvedValue({ success: true });
      (window as any).electron = { ipcRenderer: { invoke: mockInvoke } };

      const result = await fileStorageService.savePluginData("plugin-1", {
        data: "test",
      });

      expect(result).toBe(true);
      expect(mockInvoke).toHaveBeenCalledWith("file-storage:save", "plugin-1", {
        data: "test",
      });
    });

    it("should return false when save fails", async () => {
      const mockInvoke = vi.fn().mockResolvedValue({
        success: false,
        error: "Save failed",
      });
      (window as any).electron = { ipcRenderer: { invoke: mockInvoke } };

      const result = await fileStorageService.savePluginData("plugin-1", {
        data: "test",
      });

      expect(result).toBe(false);
    });

    it("should fallback to localStorage when IPC not available", async () => {
      delete (window as any).electron;

      const result = await fileStorageService.savePluginData("plugin-1", {
        data: "test",
      });

      expect(result).toBe(false);
      expect(localStorage.getItem("plugin-1-file-backup")).toBe(
        JSON.stringify({ data: "test" }),
      );
    });

    it("should handle errors gracefully", async () => {
      const mockInvoke = vi.fn().mockRejectedValue(new Error("IPC error"));
      (window as any).electron = { ipcRenderer: { invoke: mockInvoke } };

      const result = await fileStorageService.savePluginData("plugin-1", {
        data: "test",
      });

      expect(result).toBe(false);
    });
  });

  describe("loadPluginData", () => {
    it("should load plugin data successfully via IPC", async () => {
      const testData = { data: "test" };
      const mockInvoke = vi
        .fn()
        .mockResolvedValue({ success: true, data: testData });
      (window as any).electron = { ipcRenderer: { invoke: mockInvoke } };

      const result = await fileStorageService.loadPluginData("plugin-1");

      expect(result).toEqual(testData);
      expect(mockInvoke).toHaveBeenCalledWith("file-storage:load", "plugin-1");
    });

    it("should return null when data not found", async () => {
      const mockInvoke = vi.fn().mockResolvedValue({ success: false });
      (window as any).electron = { ipcRenderer: { invoke: mockInvoke } };

      const result = await fileStorageService.loadPluginData("plugin-1");

      expect(result).toBeNull();
    });

    it("should fallback to localStorage when IPC not available", async () => {
      delete (window as any).electron;
      localStorage.setItem(
        "plugin-1-file-backup",
        JSON.stringify({ data: "fallback" }),
      );

      const result = await fileStorageService.loadPluginData("plugin-1");

      expect(result).toEqual({ data: "fallback" });
    });

    it("should return null when no backup in localStorage", async () => {
      delete (window as any).electron;

      const result = await fileStorageService.loadPluginData("plugin-1");

      expect(result).toBeNull();
    });

    it("should handle errors gracefully", async () => {
      const mockInvoke = vi.fn().mockRejectedValue(new Error("IPC error"));
      (window as any).electron = { ipcRenderer: { invoke: mockInvoke } };

      const result = await fileStorageService.loadPluginData("plugin-1");

      expect(result).toBeNull();
    });
  });

  describe("deletePluginData", () => {
    it("should delete plugin data successfully", async () => {
      const mockInvoke = vi.fn().mockResolvedValue({ success: true });
      (window as any).electron = { ipcRenderer: { invoke: mockInvoke } };

      const result = await fileStorageService.deletePluginData("plugin-1");

      expect(result).toBe(true);
      expect(mockInvoke).toHaveBeenCalledWith(
        "file-storage:delete",
        "plugin-1",
      );
    });

    it("should return false when IPC not available", async () => {
      delete (window as any).electron;

      const result = await fileStorageService.deletePluginData("plugin-1");

      expect(result).toBe(false);
    });

    it("should return false when delete fails", async () => {
      const mockInvoke = vi.fn().mockResolvedValue({
        success: false,
        error: "Delete failed",
      });
      (window as any).electron = { ipcRenderer: { invoke: mockInvoke } };

      const result = await fileStorageService.deletePluginData("plugin-1");

      expect(result).toBe(false);
    });
  });

  describe("hasPluginData", () => {
    it("should check if plugin data exists", async () => {
      const mockInvoke = vi.fn().mockResolvedValue(true);
      (window as any).electron = { ipcRenderer: { invoke: mockInvoke } };

      const result = await fileStorageService.hasPluginData("plugin-1");

      expect(result).toBe(true);
      expect(mockInvoke).toHaveBeenCalledWith(
        "file-storage:exists",
        "plugin-1",
      );
    });

    it("should return false when IPC not available", async () => {
      delete (window as any).electron;

      const result = await fileStorageService.hasPluginData("plugin-1");

      expect(result).toBe(false);
    });
  });

  describe("getAllPluginDataFiles", () => {
    it("should get all plugin data files", async () => {
      const mockFiles = [
        {
          pluginId: "plugin-1",
          filePath: "/path/to/file1.json",
          size: 1024,
          modifiedAt: new Date(),
        },
        {
          pluginId: "plugin-2",
          filePath: "/path/to/file2.json",
          size: 2048,
          modifiedAt: new Date(),
        },
      ];
      const mockInvoke = vi.fn().mockResolvedValue(mockFiles);
      (window as any).electron = { ipcRenderer: { invoke: mockInvoke } };

      const result = await fileStorageService.getAllPluginDataFiles();

      expect(result).toEqual(mockFiles);
      expect(mockInvoke).toHaveBeenCalledWith("file-storage:list");
    });

    it("should return empty array when IPC not available", async () => {
      delete (window as any).electron;

      const result = await fileStorageService.getAllPluginDataFiles();

      expect(result).toEqual([]);
    });
  });

  describe("exportPluginData", () => {
    it("should export plugin data with default path", async () => {
      const mockInvoke = vi.fn().mockResolvedValue({ success: true });
      (window as any).electron = { ipcRenderer: { invoke: mockInvoke } };

      const result = await fileStorageService.exportPluginData("plugin-1");

      expect(result).toBe(true);
      expect(mockInvoke).toHaveBeenCalledWith(
        "file-storage:export",
        "plugin-1",
        expect.stringMatching(/plugin-1-\d+\.json/),
      );
    });

    it("should export plugin data with custom path", async () => {
      const mockInvoke = vi.fn().mockResolvedValue({ success: true });
      (window as any).electron = { ipcRenderer: { invoke: mockInvoke } };

      const result = await fileStorageService.exportPluginData(
        "plugin-1",
        "/custom/path.json",
      );

      expect(result).toBe(true);
      expect(mockInvoke).toHaveBeenCalledWith(
        "file-storage:export",
        "plugin-1",
        "/custom/path.json",
      );
    });

    it("should return false when export fails", async () => {
      const mockInvoke = vi.fn().mockResolvedValue({
        success: false,
        error: "Export failed",
      });
      (window as any).electron = { ipcRenderer: { invoke: mockInvoke } };

      const result = await fileStorageService.exportPluginData("plugin-1");

      expect(result).toBe(false);
    });
  });

  describe("importPluginData", () => {
    it("should import plugin data successfully", async () => {
      const mockInvoke = vi.fn().mockResolvedValue({ success: true });
      (window as any).electron = { ipcRenderer: { invoke: mockInvoke } };

      const result = await fileStorageService.importPluginData(
        "plugin-1",
        "/import/path.json",
      );

      expect(result).toBe(true);
      expect(mockInvoke).toHaveBeenCalledWith(
        "file-storage:import",
        "plugin-1",
        "/import/path.json",
      );
    });

    it("should return false when import fails", async () => {
      const mockInvoke = vi.fn().mockResolvedValue({
        success: false,
        error: "Import failed",
      });
      (window as any).electron = { ipcRenderer: { invoke: mockInvoke } };

      const result = await fileStorageService.importPluginData(
        "plugin-1",
        "/import/path.json",
      );

      expect(result).toBe(false);
    });
  });

  describe("getDataDirectory", () => {
    it("should get data directory path", async () => {
      const mockPath = "/path/to/data";
      const mockInvoke = vi.fn().mockResolvedValue(mockPath);
      (window as any).electron = { ipcRenderer: { invoke: mockInvoke } };

      const result = await fileStorageService.getDataDirectory();

      expect(result).toBe(mockPath);
      expect(mockInvoke).toHaveBeenCalledWith("file-storage:get-directory");
    });

    it("should return empty string when IPC not available", async () => {
      delete (window as any).electron;

      const result = await fileStorageService.getDataDirectory();

      expect(result).toBe("");
    });
  });

  describe("openDataDirectory", () => {
    it("should open data directory successfully", async () => {
      const mockInvoke = vi.fn().mockResolvedValue({ success: true });
      (window as any).electron = { ipcRenderer: { invoke: mockInvoke } };

      const result = await fileStorageService.openDataDirectory();

      expect(result).toBe(true);
      expect(mockInvoke).toHaveBeenCalledWith("file-storage:open-directory");
    });

    it("should return false when open fails", async () => {
      const mockInvoke = vi.fn().mockResolvedValue({ success: false });
      (window as any).electron = { ipcRenderer: { invoke: mockInvoke } };

      const result = await fileStorageService.openDataDirectory();

      expect(result).toBe(false);
    });

    it("should return false when IPC not available", async () => {
      delete (window as any).electron;

      const result = await fileStorageService.openDataDirectory();

      expect(result).toBe(false);
    });

    it("should handle errors gracefully", async () => {
      const mockInvoke = vi.fn().mockRejectedValue(new Error("Open error"));
      (window as any).electron = { ipcRenderer: { invoke: mockInvoke } };

      const result = await fileStorageService.openDataDirectory();

      expect(result).toBe(false);
    });
  });

  describe("migrateFromLocalStorage", () => {
    it("should migrate data from localStorage successfully", async () => {
      const testData = { data: "test" };
      localStorage.setItem("old-key", JSON.stringify(testData));
      const mockInvoke = vi.fn().mockResolvedValue({ success: true });
      (window as any).electron = { ipcRenderer: { invoke: mockInvoke } };

      const result = await fileStorageService.migrateFromLocalStorage(
        "plugin-1",
        "old-key",
      );

      expect(result.success).toBe(true);
      expect(localStorage.getItem("old-key-migrated-backup")).toBe(
        JSON.stringify(testData),
      );
    });

    it("should return error when no data in localStorage", async () => {
      const result = await fileStorageService.migrateFromLocalStorage(
        "plugin-1",
        "old-key",
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("No data found in localStorage");
    });

    it("should return error when save fails", async () => {
      localStorage.setItem("old-key", JSON.stringify({ data: "test" }));
      const mockInvoke = vi
        .fn()
        .mockResolvedValue({ success: false, error: "Save failed" });
      (window as any).electron = { ipcRenderer: { invoke: mockInvoke } };

      const result = await fileStorageService.migrateFromLocalStorage(
        "plugin-1",
        "old-key",
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to save to file storage");
    });

    it("should handle JSON parse errors", async () => {
      localStorage.setItem("old-key", "invalid json");

      const result = await fileStorageService.migrateFromLocalStorage(
        "plugin-1",
        "old-key",
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("edge cases", () => {
    it("should handle undefined data gracefully", async () => {
      const mockInvoke = vi
        .fn()
        .mockResolvedValue({ success: true, data: undefined });
      (window as any).electron = { ipcRenderer: { invoke: mockInvoke } };

      const result = await fileStorageService.loadPluginData("plugin-1");

      expect(result).toBeNull();
    });

    it("should handle empty string data", async () => {
      const mockInvoke = vi.fn().mockResolvedValue({ success: true, data: "" });
      (window as any).electron = { ipcRenderer: { invoke: mockInvoke } };

      const result = await fileStorageService.loadPluginData("plugin-1");

      // Service has `result.data || null`, so empty string becomes null
      expect(result).toBeNull();
    });
  });
});
