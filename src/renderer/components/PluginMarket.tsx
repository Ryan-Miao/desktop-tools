/**
 * 插件市场组件
 * 提供搜索、浏览、安装 npm 插件的界面
 */

import React, { useState, useEffect, useCallback } from "react";
import SearchBox from "./SearchBox";
import PluginPackageCard from "./PluginPackageCard";
import Toast from "./Toast/Toast";
import { npmService } from "../services/NpmService";
import { remotePluginLoader } from "../services/RemotePluginLoader";
import { storageService } from "../services/StorageService";
import { pluginRegistry } from "../services/PluginRegistry";
import { createLogger } from "../../shared/logger";
import type { NpmPackage } from "../../shared/types/npm";
import "./PluginMarket.css";

const logger = createLogger("PluginMarket");

interface PluginMarketProps {
  onPluginInstalled?: (pluginId: string) => void;
  onPluginUninstalled?: (pluginId: string) => void;
}

export default function PluginMarket({
  onPluginInstalled,
  onPluginUninstalled,
}: PluginMarketProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<NpmPackage[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [directPackageName, setDirectPackageName] = useState("");
  const [isInstallingDirect, setIsInstallingDirect] = useState(false);

  const [installedPackages, setInstalledPackages] = useState<Set<string>>(
    new Set(),
  );
  const [installingPackages, setInstallingPackages] = useState<Set<string>>(
    new Set(),
  );
  const [uninstallingPackages, setUninstallingPackages] = useState<Set<string>>(
    new Set(),
  );

  // Toast notification state
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info" | "warning";
    duration?: number;
  } | null>(null);

  // 加载已安装的插件列表
  useEffect(() => {
    const loadInstalledPlugins = () => {
      try {
        const installed = storageService.getInstalledRemotePlugins();
        const packageNames = new Set(installed.map((p) => p.packageName));
        setInstalledPackages(packageNames);
        logger.info("Loaded installed plugins", { count: packageNames.size });
      } catch (error) {
        logger.error("Failed to load installed plugins", { error });
      }
    };

    loadInstalledPlugins();

    // 监听插件注册/注销事件
    const handleRegistered = (pluginId: string) => {
      const info = pluginRegistry.getPluginInfo(pluginId);
      if (info?.packageName) {
        setInstalledPackages((prev) => new Set(prev).add(info.packageName!));
      }
    };

    const handleUnregistered = (pluginId: string) => {
      const installed = storageService.getInstalledRemotePlugins();
      const packageNames = new Set(installed.map((p) => p.packageName));
      setInstalledPackages(packageNames);
    };

    pluginRegistry.on("registered", handleRegistered);
    pluginRegistry.on("unregistered", handleUnregistered);

    return () => {
      pluginRegistry.off("registered", handleRegistered);
      pluginRegistry.off("unregistered", handleUnregistered);
    };
  }, []);

  // 搜索插件
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      logger.info(`Searching plugins: ${searchQuery}`);
      const results = await npmService.search(searchQuery);
      setSearchResults(results);
      logger.info(`Search completed: ${results.length} results`);
    } catch (error) {
      logger.error("Search failed", { error });
      setSearchError(`搜索失败: ${(error as Error).message}`);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  // 安装插件
  const handleInstall = useCallback(
    async (packageName: string, version?: string) => {
      setInstallingPackages((prev) => new Set(prev).add(packageName));
      setSearchError(null);

      try {
        logger.info(`Installing plugin: ${packageName}@${version || "latest"}`);
        await remotePluginLoader.installPlugin(packageName, version);

        // 更新已安装列表
        setInstalledPackages((prev) => new Set(prev).add(packageName));

        // 显示成功提示
        setToast({
          message: `插件 "${packageName}" 安装成功！`,
          type: "success",
          duration: 3000,
        });

        logger.info(`Plugin installed: ${packageName}`);
        onPluginInstalled?.(packageName);
      } catch (error) {
        logger.error("Installation failed", { error, packageName });

        // 显示错误提示
        setToast({
          message: `安装 "${packageName}" 失败: ${(error as Error).message}`,
          type: "error",
          duration: 5000,
        });

        setSearchError(
          `安装 "${packageName}" 失败: ${(error as Error).message}`,
        );
      } finally {
        setInstallingPackages((prev) => {
          const next = new Set(prev);
          next.delete(packageName);
          return next;
        });
      }
    },
    [onPluginInstalled],
  );

  // 卸载插件
  const handleUninstall = useCallback(
    async (packageName: string) => {
      setUninstallingPackages((prev) => new Set(prev).add(packageName));
      setSearchError(null);

      try {
        logger.info(`Uninstalling plugin: ${packageName}`);

        // 获取插件 ID
        const plugin = pluginRegistry.getPluginByPackageName(packageName);
        if (!plugin) {
          throw new Error("Plugin not found in registry");
        }

        // 卸载
        remotePluginLoader.uninstallPlugin(plugin.pluginId);

        // 更新已安装列表
        setInstalledPackages((prev) => {
          const next = new Set(prev);
          next.delete(packageName);
          return next;
        });

        // 显示成功提示
        setToast({
          message: `插件 "${packageName}" 已卸载`,
          type: "success",
          duration: 3000,
        });

        logger.info(`Plugin uninstalled: ${packageName}`);
        onPluginUninstalled?.(plugin.pluginId);
      } catch (error) {
        logger.error("Uninstallation failed", { error, packageName });

        // 显示错误提示
        setToast({
          message: `卸载 "${packageName}" 失败: ${(error as Error).message}`,
          type: "error",
          duration: 5000,
        });

        setSearchError(
          `卸载 "${packageName}" 失败: ${(error as Error).message}`,
        );
      } finally {
        setUninstallingPackages((prev) => {
          const next = new Set(prev);
          next.delete(packageName);
          return next;
        });
      }
    },
    [onPluginUninstalled],
  );

  // 直接安装插件（通过包名）
  const handleDirectInstall = useCallback(async () => {
    if (!directPackageName.trim()) {
      setSearchError("请输入包名");
      return;
    }

    setIsInstallingDirect(true);
    setSearchError(null);

    try {
      logger.info(`Direct installing plugin: ${directPackageName}`);
      await remotePluginLoader.installPlugin(directPackageName.trim());
      setDirectPackageName("");

      // 显示成功提示
      setToast({
        message: `插件 "${directPackageName}" 安装成功！`,
        type: "success",
        duration: 3000,
      });

      logger.info(`Plugin installed: ${directPackageName}`);
    } catch (error) {
      logger.error("Direct installation failed", {
        error,
        packageName: directPackageName,
      });

      // 显示错误提示
      setToast({
        message: `安装 "${directPackageName}" 失败: ${(error as Error).message}`,
        type: "error",
        duration: 5000,
      });

      setSearchError(
        `安装 "${directPackageName}" 失败: ${(error as Error).message}`,
      );
    } finally {
      setIsInstallingDirect(false);
    }
  }, [directPackageName]);

  // 搜索热门插件（使用关键词）
  const handleSearchPopular = useCallback(() => {
    setSearchQuery("desktop-tool-plugin");
  }, []);

  return (
    <div className="plugin-market">
      <div className="plugin-market__header">
        <h2 className="plugin-market__title">插件市场</h2>
        <p className="plugin-market__subtitle">从 npm 仓库搜索和安装社区插件</p>
      </div>

      <div className="plugin-market__search">
        <SearchBox
          value={searchQuery}
          onChange={setSearchQuery}
          onEnter={handleSearch}
          placeholder="搜索 npm 插件..."
        />
        <button
          className="plugin-market__search-btn"
          onClick={handleSearch}
          disabled={isSearching || !searchQuery.trim()}
          type="button"
        >
          {isSearching ? "搜索中..." : "搜索"}
        </button>
      </div>

      <div className="plugin-market__direct-install">
        <h4 className="plugin-market__direct-title">或直接输入包名安装:</h4>
        <div className="plugin-market__direct-input-group">
          <input
            type="text"
            className="plugin-market__direct-input"
            placeholder="例如: desktop-tool-pl-qrcode"
            value={directPackageName}
            onChange={(e) => setDirectPackageName(e.target.value)}
            disabled={isInstallingDirect}
          />
          <button
            className="plugin-market__direct-btn"
            onClick={handleDirectInstall}
            disabled={isInstallingDirect || !directPackageName.trim()}
            type="button"
          >
            {isInstallingDirect ? "安装中..." : "安装"}
          </button>
        </div>
        <p className="plugin-market__direct-hint">
          💡 提示: 新发布的插件可能需要等待 5-10
          分钟才能被搜索到，但可以直接通过包名安装
        </p>
      </div>

      {!searchQuery && (
        <div className="plugin-market__quick-actions">
          <button
            className="plugin-market__quick-btn"
            onClick={handleSearchPopular}
            type="button"
          >
            🔍 浏览所有桌面工具插件
          </button>
        </div>
      )}

      {searchError && <div className="plugin-market__error">{searchError}</div>}

      {isSearching && (
        <div className="plugin-market__loading">
          <div className="plugin-market__spinner" />
          <p>正在搜索插件...</p>
        </div>
      )}

      {!isSearching && searchResults.length > 0 && (
        <div className="plugin-market__results-header">
          <h3>搜索结果 ({searchResults.length})</h3>
          <button
            className="plugin-market__clear-btn"
            onClick={() => {
              setSearchResults([]);
              setSearchQuery("");
              setSearchError(null);
            }}
            type="button"
          >
            清除
          </button>
        </div>
      )}

      {!isSearching &&
        searchResults.length === 0 &&
        searchQuery &&
        !searchError && (
          <div className="plugin-market__empty">
            <p>未找到匹配的插件</p>
            <p className="plugin-market__empty-hint">
              提示: 搜索 "desktop-tool-plugin" 可以浏览所有桌面工具插件
            </p>
          </div>
        )}

      <div className="plugin-market__results">
        {searchResults.map((pkg) => (
          <PluginPackageCard
            key={pkg.name}
            package={pkg}
            isInstalled={installedPackages.has(pkg.name)}
            isInstalling={installingPackages.has(pkg.name)}
            isUninstalling={uninstallingPackages.has(pkg.name)}
            onInstall={handleInstall}
            onUninstall={handleUninstall}
          />
        ))}
      </div>

      {!searchQuery && !isSearching && (
        <div className="plugin-market__info">
          <h3>关于插件市场</h3>
          <ul>
            <li>所有插件都来自 npm 仓库</li>
            <li>安装后可以离线使用</li>
            <li>插件需要包含 "desktop-tool-plugin" 关键词</li>
            <li>建议只安装可信来源的插件</li>
          </ul>
        </div>
      )}

      {/* Toast 通知 */}
      {toast && (
        <div className="plugin-market__toast-container">
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => setToast(null)}
          />
        </div>
      )}
    </div>
  );
}
