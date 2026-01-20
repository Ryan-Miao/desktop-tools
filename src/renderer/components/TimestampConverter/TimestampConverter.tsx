/**
 * Timestamp Converter Plugin
 *
 * Unix时间戳与日期时间相互转换
 */

import React, { useState, useEffect } from 'react';
import PluginWindow from '../PluginWindow/PluginWindow';
import styles from './TimestampConverter.module.css';

interface TimestampConverterProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

const TimestampConverter: React.FC<TimestampConverterProps> = ({ onClose, onMinimize, onMaximize }) => {
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(Math.floor(Date.now() / 1000));
  const [timestampInput, setTimestampInput] = useState<string>('');
  const [dateTimeInput, setDateTimeInput] = useState<string>('');
  const [convertedResults, setConvertedResults] = useState<{
    fromTimestamp?: string;
    fromDateTime?: number;
  }>({});

  // 更新当前时间戳
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimestamp(Math.floor(Date.now() / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 时间戳转日期时间
  const convertTimestamp = () => {
    const timestamp = parseInt(timestampInput.trim());
    if (isNaN(timestamp)) return;

    const date = new Date(timestamp * 1000);
    const result = date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    setConvertedResults({ fromDateTime: undefined, fromTimestamp: result });
  };

  // 日期时间转时间戳
  const convertDateTime = () => {
    if (!dateTimeInput) return;

    const date = new Date(dateTimeInput);
    if (isNaN(date.getTime())) return;

    const timestamp = Math.floor(date.getTime() / 1000);
    setConvertedResults({ fromTimestamp: undefined, fromDateTime: timestamp });
  };

  // 复制到剪贴板
  const copyToClipboard = (text: string | number) => {
    navigator.clipboard.writeText(String(text));
  };

  // 使用当前时间
  const useCurrentTime = () => {
    setTimestampInput(String(currentTimestamp));
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    setDateTimeInput(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}`);
  };

  return (
    <PluginWindow
      title="时间戳转换"
      icon="⏱️"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      className="timestamp-converter-standalone"
      pluginId="timestamp-converter"
      showStandaloneButton={false}
    >
      <div className={styles.container}>
        {/* 当前时间戳 */}
        <div className={styles.currentTimestamp}>
          <div className={styles.currentTimeLabel}>当前时间戳</div>
          <div className={styles.currentTimeValue}>{currentTimestamp}</div>
          <button
            onClick={() => copyToClipboard(currentTimestamp)}
            className={styles.copyButton}
          >
            📋 复制
          </button>
        </div>

        {/* 时间戳转日期时间 */}
        <div className={styles.converter}>
          <h3>时间戳 → 日期时间</h3>
          <div className={styles.inputGroup}>
            <input
              type="text"
              value={timestampInput}
              onChange={(e) => setTimestampInput(e.target.value)}
              placeholder="输入时间戳，如：1609459200"
              className={styles.input}
            />
            <button onClick={convertTimestamp} className={styles.convertButton}>
              转换 →
            </button>
          </div>
          {convertedResults.fromTimestamp && (
            <div className={styles.result}>
              <div className={styles.resultValue}>{convertedResults.fromTimestamp}</div>
              <button
                onClick={() => copyToClipboard(convertedResults.fromTimestamp!)}
                className={styles.copySmallButton}
              >
                📋
              </button>
            </div>
          )}
        </div>

        {/* 日期时间转时间戳 */}
        <div className={styles.converter}>
          <h3>日期时间 → 时间戳</h3>
          <div className={styles.inputGroup}>
            <input
              type="datetime-local"
              value={dateTimeInput}
              onChange={(e) => setDateTimeInput(e.target.value)}
              className={styles.input}
            />
            <button onClick={convertDateTime} className={styles.convertButton}>
              转换 →
            </button>
          </div>
          {convertedResults.fromDateTime !== undefined && (
            <div className={styles.result}>
              <div className={styles.resultValue}>{convertedResults.fromDateTime}</div>
              <button
                onClick={() => copyToClipboard(convertedResults.fromDateTime!)}
                className={styles.copySmallButton}
              >
                📋
              </button>
            </div>
          )}
        </div>

        {/* 快捷操作 */}
        <div className={styles.quickActions}>
          <button onClick={useCurrentTime} className={styles.quickButton}>
            🕐 使用当前时间
          </button>
        </div>

        {/* 说明 */}
        <div className={styles.info}>
          <p>💡 Unix时间戳是从1970-01-01 00:00:00 UTC开始的秒数</p>
        </div>
      </div>
    </PluginWindow>
  );
};

export default TimestampConverter;
