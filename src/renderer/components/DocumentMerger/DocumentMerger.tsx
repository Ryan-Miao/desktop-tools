/**
 * Document Merger Plugin
 *
 * 合并多个文本文件
 */

import React, { useState, useCallback } from 'react';
import PluginWindow from '../PluginWindow/PluginWindow';
import styles from './DocumentMerger.module.css';

interface DocumentMergerProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

interface FileItem {
  id: string;
  file: File;
  content: string;
}

const DocumentMerger: React.FC<DocumentMergerProps> = ({ onClose, onMinimize, onMaximize }) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [separator, setSeparator] = useState<string>('\\n\\n---\\n\\n');
  const [customSeparator, setCustomSeparator] = useState<string>('\\n\\n---\\n\\n');
  const [separatorType, setSeparatorType] = useState<'none' | 'newline' | 'custom'>('custom');
  const [mergedContent, setMergedContent] = useState<string>('');

  // 处理文件选择
  const handleFileSelect = useCallback(async (selectedFiles: FileList) => {
    const fileArray = Array.from(selectedFiles);

    for (const file of fileArray) {
      const content = await file.text();
      const newFile: FileItem = {
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        content
      };
      setFiles(prev => [...prev, newFile]);
    }
  }, []);

  // 删除文件
  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  // 移动文件位置
  const moveFile = useCallback((index: number, direction: 'up' | 'down') => {
    setFiles(prev => {
      const newFiles = [...prev];
      if (direction === 'up' && index > 0) {
        [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
      } else if (direction === 'down' && index < newFiles.length - 1) {
        [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
      }
      return newFiles;
    });
  }, []);

  // 合并文件
  const mergeFiles = useCallback(() => {
    if (files.length === 0) return;

    let sep = '';
    switch (separatorType) {
      case 'none':
        sep = '';
        break;
      case 'newline':
        sep = '\\n\\n';
        break;
      case 'custom':
        sep = customSeparator
          .replace('\\n', '\n')
          .replace('\\t', '\t')
          .replace('\\r', '\r');
        break;
    }

    const merged = files.map(f => f.content).join(sep);
    setMergedContent(merged);
  }, [files, separatorType, customSeparator]);

  // 清空
  const clear = useCallback(() => {
    setFiles([]);
    setMergedContent('');
  }, []);

  // 下载合并后的文件
  const downloadMerged = useCallback(() => {
    if (!mergedContent) return;

    const blob = new Blob([mergedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `merged-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [mergedContent]);

  // 获取实际分隔符预览
  const getSeparatorPreview = () => {
    switch (separatorType) {
      case 'none':
        return '(无分隔符)';
      case 'newline':
        return '(双换行)';
      case 'custom':
        return customSeparator
          .replace('\\n', '↵')
          .replace('\\t', '⇥')
          .replace('\\r', '←');
    }
  };

  return (
    <PluginWindow
      title="文档合并"
      icon="📄"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      className="document-merger-standalone"
      pluginId="document-merger"
      showStandaloneButton={false}
    >
      <div className={styles.container}>
        {/* 文件选择 */}
        <div className={styles.fileSection}>
          <h3>添加文件</h3>
          <label className={styles.fileLabel}>
            <input
              type="file"
              multiple
              onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
              className={styles.fileInput}
            />
            <span>📁 选择文件</span>
          </label>
        </div>

        {/* 文件列表 */}
        {files.length > 0 && (
          <div className={styles.fileList}>
            <div className={styles.listHeader}>
              <h3>文件列表 ({files.length})</h3>
              <button onClick={clear} className={styles.clearButton}>
                清空
              </button>
            </div>
            <div className={styles.list}>
              {files.map((fileItem, index) => (
                <div key={fileItem.id} className={styles.fileItem}>
                  <span className={styles.fileIcon}>📄</span>
                  <span className={styles.fileName}>{fileItem.file.name}</span>
                  <span className={styles.fileSize}>
                    {(fileItem.file.size / 1024).toFixed(2)} KB
                  </span>
                  <div className={styles.fileActions}>
                    <button
                      onClick={() => moveFile(index, 'up')}
                      disabled={index === 0}
                      className={styles.moveButton}
                      title="上移"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveFile(index, 'down')}
                      disabled={index === files.length - 1}
                      className={styles.moveButton}
                      title="下移"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => removeFile(fileItem.id)}
                      className={styles.removeButton}
                      title="删除"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 分隔符设置 */}
        {files.length > 0 && (
          <div className={styles.separatorSection}>
            <h3>分隔符设置</h3>
            <div className={styles.separatorOptions}>
              <label className={styles.separatorOption}>
                <input
                  type="radio"
                  value="none"
                  checked={separatorType === 'none'}
                  onChange={(e) => setSeparatorType(e.target.value as any)}
                />
                无分隔符
              </label>
              <label className={styles.separatorOption}>
                <input
                  type="radio"
                  value="newline"
                  checked={separatorType === 'newline'}
                  onChange={(e) => setSeparatorType(e.target.value as any)}
                />
                双换行
              </label>
              <label className={styles.separatorOption}>
                <input
                  type="radio"
                  value="custom"
                  checked={separatorType === 'custom'}
                  onChange={(e) => setSeparatorType(e.target.value as any)}
                />
                自定义
              </label>
            </div>
            {separatorType === 'custom' && (
              <input
                type="text"
                value={customSeparator}
                onChange={(e) => setCustomSeparator(e.target.value)}
                placeholder="\\n\\n---\\n\\n"
                className={styles.separatorInput}
              />
            )}
            <div className={styles.separatorPreview}>
              预览: {getSeparatorPreview()}
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        {files.length > 0 && (
          <div className={styles.actions}>
            <button onClick={mergeFiles} className={styles.mergeButton}>
              🔗 合并文件
            </button>
          </div>
        )}

        {/* 合并结果 */}
        {mergedContent && (
          <div className={styles.result}>
            <div className={styles.resultHeader}>
              <h3>合并结果</h3>
              <button onClick={downloadMerged} className={styles.downloadButton}>
                📥 下载
              </button>
            </div>
            <div className={styles.preview}>
              <pre>{mergedContent}</pre>
            </div>
          </div>
        )}
      </div>
    </PluginWindow>
  );
};

export default DocumentMerger;
