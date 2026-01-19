/**
 * 插件包卡片组件
 * 显示 npm 插件包信息，支持安装/卸载操作
 */

import React, { useState } from 'react';
import type { NpmPackage } from '../../shared/types/npm';
import './PluginPackageCard.css';

interface PluginPackageCardProps {
  package: NpmPackage;
  isInstalled: boolean;
  isInstalling?: boolean;
  isUninstalling?: boolean;
  version?: string;
  onInstall: (packageName: string, version?: string) => void | Promise<void>;
  onUninstall: (packageName: string) => void | Promise<void>;
  onViewDetails?: (packageName: string) => void;
}

export default function PluginPackageCard({
  package: pkg,
  isInstalled,
  isInstalling = false,
  isUninstalling = false,
  version,
  onInstall,
  onUninstall,
  onViewDetails
}: PluginPackageCardProps) {
  const [error, setError] = useState<string | null>(null);

  const handleInstall = async () => {
    setError(null);
    try {
      await onInstall(pkg.name, version);
    } catch (err) {
      setError(`安装失败: ${(err as Error).message}`);
    }
  };

  const handleUninstall = async () => {
    setError(null);
    try {
      await onUninstall(pkg.name);
    } catch (err) {
      setError(`卸载失败: ${(err as Error).message}`);
    }
  };

  const formatAuthor = (author: NpmPackage['author']): string => {
    if (typeof author === 'string') return author;
    return author?.name || 'Unknown';
  };

  const isLoading = isInstalling || isUninstalling;

  return (
    <div className="plugin-package-card">
      <div className="plugin-package-card__header">
        <div className="plugin-package-card__name">{pkg.name}</div>
        <div className="plugin-package-card__version">{pkg.version}</div>
      </div>

      <div className="plugin-package-card__body">
        <p className="plugin-package-card__description">
          {pkg.description || '暂无描述'}
        </p>

        <div className="plugin-package-card__meta">
          <span className="plugin-package-card__author">
            作者: {formatAuthor(pkg.author)}
          </span>

          {pkg.keywords && pkg.keywords.length > 0 && (
            <div className="plugin-package-card__keywords">
              {pkg.keywords.slice(0, 3).map((keyword, index) => (
                <span key={index} className="plugin-package-card__keyword">
                  {keyword}
                </span>
              ))}
              {pkg.keywords.length > 3 && (
                <span className="plugin-package-card__keyword-more">
                  +{pkg.keywords.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="plugin-package-card__error">
            {error}
          </div>
        )}

        <div className="plugin-package-card__actions">
          {pkg.links?.homepage && (
            <button
              className="plugin-package-card__btn plugin-package-card__btn--secondary"
              onClick={() => window.open(pkg.links!.homepage, '_blank')}
              type="button"
              disabled={isLoading}
            >
              主页
            </button>
          )}

          {pkg.links?.npm && (
            <button
              className="plugin-package-card__btn plugin-package-card__btn--secondary"
              onClick={() => window.open(pkg.links!.npm, '_blank')}
              type="button"
              disabled={isLoading}
            >
              npm
            </button>
          )}

          {isInstalled ? (
            <button
              className="plugin-package-card__btn plugin-package-card__btn--danger"
              onClick={handleUninstall}
              disabled={isLoading || isUninstalling}
              type="button"
            >
              {isUninstalling ? '卸载中...' : '卸载'}
            </button>
          ) : (
            <button
              className="plugin-package-card__btn plugin-package-card__btn--primary"
              onClick={handleInstall}
              disabled={isLoading || isInstalling}
              type="button"
            >
              {isInstalling ? '安装中...' : '安装'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
