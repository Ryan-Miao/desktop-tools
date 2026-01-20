/**
 * File Hash Plugin
 *
 * 计算文件哈希值（MD5/SHA-1/SHA-256）
 */

import React, { useState, useCallback } from 'react';
import PluginWindow from '../PluginWindow/PluginWindow';
import styles from './FileHash.module.css';

interface FileHashProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

interface HashResult {
  file: File;
  md5?: string;
  sha1?: string;
  sha256?: string;
}

const FileHash: React.FC<FileHashProps> = ({ onClose, onMinimize, onMaximize }) => {
  const [hashes, setHashes] = useState<HashResult[]>([]);
  const [algorithm, setAlgorithm] = useState<'SHA-256' | 'SHA-1' | 'MD5'>('SHA-256');
  const [dragActive, setDragActive] = useState(false);

  // 计算哈希
  const calculateHash = useCallback(async (file: File, algo: 'SHA-256' | 'SHA-1' | 'MD5'): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest(algo, buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }, []);

  // 处理文件
  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      const result: HashResult = { file };

      if (algorithm === 'MD5') {
        result.md5 = await calculateHash(file, 'MD5');
      } else if (algorithm === 'SHA-1') {
        result.sha1 = await calculateHash(file, 'SHA-1');
      } else {
        result.sha256 = await calculateHash(file, 'SHA-256');
      }

      setHashes(prev => [result, ...prev.slice(0, 9)]);
    }
  }, [algorithm, calculateHash]);

  // 拖拽处理
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  // 文件选择
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  // 复制哈希
  const copyHash = useCallback((hash: string) => {
    navigator.clipboard.writeText(hash);
  }, []);

  return (
    <PluginWindow
      title="文件哈希"
      icon="📦"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      className="file-hash-standalone"
      pluginId="file-hash"
      showStandaloneButton={false}
    >
      <div className={styles.container}>
        {/* 算法选择 */}
        <div className={styles.algorithmSelect}>
          <label>算法:</label>
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value as 'SHA-256' | 'SHA-1' | 'MD5')}
            className={styles.select}
          >
            <option value="SHA-256">SHA-256 (推荐)</option>
            <option value="SHA-1">SHA-1</option>
            <option value="MD5">MD5</option>
          </select>
        </div>

        {/* 拖拽区域 */}
        <div
          className={`${styles.dropZone} ${dragActive ? styles.active : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className={styles.dropIcon}>📁</div>
          <p>拖拽文件到此处，或</p>
          <label className={styles.fileInputLabel}>
            点击选择文件
            <input
              type="file"
              onChange={handleFileSelect}
              className={styles.fileInput}
              multiple
            />
          </label>
        </div>

        {/* 结果列表 */}
        {hashes.length > 0 && (
          <div className={styles.results}>
            <h3>计算结果</h3>
            {hashes.map((result, index) => (
              <div key={index} className={styles.resultCard}>
                <div className={styles.fileInfo}>
                  <div className={styles.fileName}>{result.file.name}</div>
                  <div className={styles.fileSize}>
                    {(result.file.size / 1024).toFixed(2)} KB
                  </div>
                </div>
                <div className={styles.hashValue}>
                  {algorithm === 'MD5' && result.md5 && (
                    <div className={styles.hashRow}>
                      <span className={styles.hashLabel}>MD5:</span>
                      <code className={styles.hashCode}>{result.md5}</code>
                      <button
                        onClick={() => copyHash(result.md5!)}
                        className={styles.copyButton}
                      >
                        📋
                      </button>
                    </div>
                  )}
                  {algorithm === 'SHA-1' && result.sha1 && (
                    <div className={styles.hashRow}>
                      <span className={styles.hashLabel}>SHA-1:</span>
                      <code className={styles.hashCode}>{result.sha1}</code>
                      <button
                        onClick={() => copyHash(result.sha1!)}
                        className={styles.copyButton}
                      >
                        📋
                      </button>
                    </div>
                  )}
                  {algorithm === 'SHA-256' && result.sha256 && (
                    <div className={styles.hashRow}>
                      <span className={styles.hashLabel}>SHA-256:</span>
                      <code className={styles.hashCode}>{result.sha256}</code>
                      <button
                        onClick={() => copyHash(result.sha256!)}
                        className={styles.copyButton}
                      >
                        📋
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PluginWindow>
  );
};

export default FileHash;
