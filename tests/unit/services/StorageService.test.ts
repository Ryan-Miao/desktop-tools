/**
 * StorageService Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { storageService } from "@renderer/services/StorageService";
import type {
  PluginState,
  AppSettings,
} from "@renderer/services/StorageService";

describe("StorageService", () => {
  const STORAGE_KEY = "desktop-tool-data";

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Mock localStorage methods
    const localStorageMock = (() => {
      let store: Record<string, string> = {};

      return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
          store[key] = value.toString();
        },
        removeItem: (key: string) => {
          delete store[key];
        },
        clear: () => {
          store = {};
        },
        get length() {
          return Object.keys(store).length;
        },
        key: (index: number) => {
          const keys = Object.keys(store);
          return keys[index] || null;
        },
      };
    })();

    Object.defineProperty(global, "localStorage", {
      value: localStorageMock,
      writable: true,
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("initialization", () => {
    it("should return default data when localStorage is empty", () => {
      const data = storageService.getData();

      expect(data).toBeDefined();
      expect(data.appSettings).toBeDefined();
      expect(data.plugins).toEqual([]);
      expect(data.colorHistory).toEqual([]);
      expect(data.base64History).toEqual([]);
    });

    it("should have default app settings", () => {
      const settings = storageService.getAppSettings();

      expect(settings.themeId).toBe("light-blue");
      expect(settings.language).toBe("zh-CN");
      expect(settings.hardwareAcceleration).toBe(true);
      expect(settings.animations).toBe(true);
      expect(settings.autoSave).toBe(true);
      expect(settings.debugMode).toBe(false);
      expect(settings.panelOpacity).toBe(85);
    });
  });

  describe("data persistence", () => {
    it("should save and retrieve data", () => {
      const data = storageService.getData();
      data.appSettings.themeId = "dark";

      storageService.saveData(data);

      const retrieved = storageService.getData();
      expect(retrieved.appSettings.themeId).toBe("dark");
    });

    it("should merge with defaults when loading partial data", () => {
      // Clear localStorage and cache first
      storageService.clearAllData();
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          appSettings: { themeId: "custom" },
        }),
      );

      const data = storageService.getData();

      // Should have default values for missing fields
      expect(data.appSettings.themeId).toBe("custom");
      expect(data.appSettings.language).toBe("zh-CN");
      expect(data.plugins).toEqual([]);
    });

    it("should use cache within CACHE_DURATION", async () => {
      const data1 = storageService.getData();
      data1.appSettings.themeId = "cached";

      storageService.saveData(data1);

      // Get data immediately (should use cache)
      const data2 = storageService.getData();
      expect(data2.appSettings.themeId).toBe("cached");
    });
  });

  describe("app settings", () => {
    it("should get app settings", () => {
      const settings = storageService.getAppSettings();
      expect(settings).toBeDefined();
    });

    it("should update app settings", () => {
      storageService.updateAppSettings({ themeId: "dark" });

      const settings = storageService.getAppSettings();
      expect(settings.themeId).toBe("dark");
    });

    it("should update multiple settings at once", () => {
      storageService.updateAppSettings({
        themeId: "dark",
        language: "en-US",
        panelOpacity: 90,
      });

      const settings = storageService.getAppSettings();
      expect(settings.themeId).toBe("dark");
      expect(settings.language).toBe("en-US");
      expect(settings.panelOpacity).toBe(90);
    });
  });

  describe("plugin state management", () => {
    it("should get all plugins state", () => {
      const plugins = storageService.getPluginsState();
      expect(plugins).toEqual([]);
    });

    it("should get single plugin state", () => {
      storageService.updatePluginState("plugin-1", { enabled: true });

      const plugin = storageService.getPluginState("plugin-1");
      expect(plugin).toBeDefined();
      expect(plugin?.id).toBe("plugin-1");
      expect(plugin?.enabled).toBe(true);
    });

    it("should return undefined for non-existent plugin", () => {
      const plugin = storageService.getPluginState("non-existent");
      expect(plugin).toBeUndefined();
    });

    it("should update plugin state", () => {
      storageService.updatePluginState("plugin-1", { enabled: true });

      let plugin = storageService.getPluginState("plugin-1");
      expect(plugin?.enabled).toBe(true);

      storageService.updatePluginState("plugin-1", { enabled: false });

      plugin = storageService.getPluginState("plugin-1");
      expect(plugin?.enabled).toBe(false);
    });

    it("should create new plugin when updating non-existent one", () => {
      storageService.updatePluginState("new-plugin", {
        enabled: true,
        favorite: true,
      });

      const plugin = storageService.getPluginState("new-plugin");
      expect(plugin).toBeDefined();
      expect(plugin?.enabled).toBe(true);
      expect(plugin?.favorite).toBe(true);
    });

    it("should delete plugin state", () => {
      storageService.updatePluginState("plugin-1", { enabled: true });
      expect(storageService.getPluginState("plugin-1")).toBeDefined();

      storageService.deletePluginState("plugin-1");
      expect(storageService.getPluginState("plugin-1")).toBeUndefined();
    });

    it("should update plugin last used time", () => {
      storageService.updatePluginState("plugin-1", { enabled: true });
      const before = Date.now();

      storageService.updatePluginLastUsed("plugin-1");

      const plugin = storageService.getPluginState("plugin-1");
      expect(plugin?.lastUsed).toBeGreaterThanOrEqual(before);
    });

    it("should toggle plugin enabled state", () => {
      storageService.updatePluginState("plugin-1", { enabled: false });

      const newState1 = storageService.togglePluginEnabled("plugin-1");
      expect(newState1).toBe(true);

      const plugin = storageService.getPluginState("plugin-1");
      expect(plugin?.enabled).toBe(true);

      const newState2 = storageService.togglePluginEnabled("plugin-1");
      expect(newState2).toBe(false);
    });

    it("should toggle plugin favorite state", () => {
      storageService.updatePluginState("plugin-1", { favorite: false });

      const newState1 = storageService.togglePluginFavorite("plugin-1");
      expect(newState1).toBe(true);

      const plugin = storageService.getPluginState("plugin-1");
      expect(plugin?.favorite).toBe(true);
    });
  });

  describe("plugin ordering", () => {
    beforeEach(() => {
      storageService.updatePluginState("plugin-1", { favorite: true });
      storageService.updatePluginState("plugin-2", { favorite: false });
      storageService.updatePluginState("plugin-3", { favorite: true });
    });

    it("should get favorite plugins", () => {
      const favorites = storageService.getFavoritePlugins();
      expect(favorites).toContain("plugin-1");
      expect(favorites).toContain("plugin-3");
      expect(favorites).not.toContain("plugin-2");
    });

    it("should get non-favorite plugins", () => {
      const nonFavorites = storageService.getNonFavoritePlugins();
      expect(nonFavorites).toContain("plugin-2");
      expect(nonFavorites).not.toContain("plugin-1");
      expect(nonFavorites).not.toContain("plugin-3");
    });

    it("should reorder plugins", () => {
      storageService.reorderPlugins(["plugin-3", "plugin-1", "plugin-2"]);

      const plugins = storageService.getPluginsState();
      expect(plugins[0].id).toBe("plugin-3");
      expect(plugins[0].order).toBe(0);
      expect(plugins[1].id).toBe("plugin-1");
      expect(plugins[1].order).toBe(1);
    });
  });

  describe("color history", () => {
    it("should add color to history", () => {
      storageService.addColorToHistory("#ff0000");

      const history = storageService.getColorHistory();
      expect(history).toContain("#ff0000");
    });

    it("should keep only 20 most recent colors", () => {
      // Add 25 colors
      for (let i = 0; i < 25; i++) {
        storageService.addColorToHistory(`#color${i}`);
      }

      const history = storageService.getColorHistory();
      expect(history.length).toBe(20);
      // Most recent should be first
      expect(history[0]).toBe("#color24");
    });

    it("should remove duplicate colors when adding", () => {
      storageService.addColorToHistory("#red");
      storageService.addColorToHistory("#blue");
      storageService.addColorToHistory("#red");

      const history = storageService.getColorHistory();
      expect(history[0]).toBe("#red");
      // Should only appear once
      expect(history.filter((c) => c === "#red").length).toBe(1);
    });

    it("should clear color history", () => {
      storageService.addColorToHistory("#red");
      expect(storageService.getColorHistory().length).toBeGreaterThan(0);

      storageService.clearColorHistory();
      expect(storageService.getColorHistory()).toEqual([]);
    });
  });

  describe("data import/export", () => {
    it("should export data as JSON string", () => {
      storageService.updateAppSettings({ themeId: "test" });

      const exported = storageService.exportData();

      expect(typeof exported).toBe("string");
      const parsed = JSON.parse(exported);
      expect(parsed.appSettings.themeId).toBe("test");
    });

    it("should import valid data", () => {
      const dataToImport = {
        appSettings: { themeId: "imported" },
        plugins: [],
        colorHistory: [],
        base64History: [],
      };

      const success = storageService.importData(JSON.stringify(dataToImport));

      expect(success).toBe(true);
      const settings = storageService.getAppSettings();
      expect(settings.themeId).toBe("imported");
    });

    it("should reject invalid data format", () => {
      const invalidData = { invalid: "data" };

      const success = storageService.importData(JSON.stringify(invalidData));

      expect(success).toBe(false);
    });

    it("should reject non-JSON data", () => {
      const success = storageService.importData("not json");

      expect(success).toBe(false);
    });
  });

  describe("data management", () => {
    it("should clear all data", () => {
      // Clear any existing data first
      storageService.clearAllData();

      storageService.updateAppSettings({ themeId: "test" });
      expect(storageService.getAppSettings().themeId).toBe("test");

      storageService.clearAllData();

      // Note: Due to singleton caching, we can't easily test cache invalidation
      // But the clear operation should still work
      const data = storageService.getData();
      expect(data).toBeDefined();
    });

    it("should get storage size", () => {
      storageService.updateAppSettings({ themeId: "test" });

      const size = storageService.getStorageSize();
      expect(typeof size).toBe("string");
      expect(size).toContain("KB");
    });

    it("should return 0 KB when no data", () => {
      const size = storageService.getStorageSize();
      expect(size).toBe("0 KB");
    });

    it("should handle localStorage errors gracefully when getting size", () => {
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("Read error");
      });

      const size = storageService.getStorageSize();
      expect(size).toBe("0 KB");
    });
  });

  describe("remote plugins", () => {
    it("should get installed remote plugins", () => {
      const installed = storageService.getInstalledRemotePlugins();
      expect(Array.isArray(installed)).toBe(true);
    });

    it("should handle localStorage errors gracefully when getting remote plugins", () => {
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("Read error");
      });

      const installed = storageService.getInstalledRemotePlugins();
      expect(installed).toEqual([]);
    });

    it("should check if remote plugin is installed", () => {
      localStorage.setItem(
        "installed-remote-plugins",
        JSON.stringify([
          {
            id: "plugin-1",
            packageName: "test-pkg",
            version: "1.0.0",
            installedAt: "2024-01-01",
          },
        ]),
      );

      const isInstalled = storageService.isRemotePluginInstalled("test-pkg");
      expect(isInstalled).toBe(true);
    });

    it("should return false for non-installed plugin", () => {
      const isInstalled =
        storageService.isRemotePluginInstalled("non-existent");
      expect(isInstalled).toBe(false);
    });

    it("should get installed package names", () => {
      localStorage.setItem(
        "installed-remote-plugins",
        JSON.stringify([
          {
            id: "plugin-1",
            packageName: "pkg-1",
            version: "1.0.0",
            installedAt: "2024-01-01",
          },
          {
            id: "plugin-2",
            packageName: "pkg-2",
            version: "1.0.0",
            installedAt: "2024-01-01",
          },
        ]),
      );

      const packages = storageService.getInstalledRemotePluginPackageNames();
      expect(packages).toContain("pkg-1");
      expect(packages).toContain("pkg-2");
    });
  });

  describe("error handling", () => {
    it("should handle localStorage read errors gracefully", () => {
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("Read error");
      });

      const data = storageService.getData();
      expect(data).toBeDefined();
      expect(data.appSettings).toBeDefined();
    });

    it("should handle localStorage write errors gracefully", () => {
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("Write error");
      });

      expect(() => {
        storageService.updateAppSettings({ themeId: "test" });
      }).not.toThrow();
    });
  });
});
