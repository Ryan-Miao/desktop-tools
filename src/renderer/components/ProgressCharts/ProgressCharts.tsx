/**
 * Progress Charts Plugin
 *
 * Create and visualize progress with beautiful charts
 */

import React, { useState, useCallback, useMemo } from 'react';
import PluginWindow from '../PluginWindow/PluginWindow';
import styles from './ProgressCharts.module.css';

type ChartType = 'bar' | 'progress-ring' | 'progress-bar' | 'stat-card';

interface ProgressChartsProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

interface DataPoint {
  label: string;
  value: number;
  color: string;
}

const defaultColors = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f59e0b', '#10b981', '#3b82f6', '#06b6d4'
];

const ProgressCharts: React.FC<ProgressChartsProps> = ({
  onClose,
  onMinimize,
  onMaximize,
}) => {
  const [chartType, setChartType] = useState<ChartType>('progress-bar');
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([
    { label: '完成', value: 75, color: defaultColors[0] },
    { label: '进行中', value: 50, color: defaultColors[1] },
    { label: '待开始', value: 25, color: defaultColors[2] },
  ]);
  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState('50');
  const [newColor, setNewColor] = useState(defaultColors[3]);

  // Add new data point
  const addDataPoint = useCallback(() => {
    if (!newLabel.trim()) return;
    const value = Math.min(100, Math.max(0, parseInt(newValue) || 0));
    setDataPoints([...dataPoints, { label: newLabel, value, color: newColor }]);
    setNewLabel('');
    setNewValue('50');
    setNewColor(defaultColors[dataPoints.length % defaultColors.length]);
  }, [newLabel, newValue, newColor, dataPoints]);

  // Remove data point
  const removeDataPoint = useCallback((index: number) => {
    setDataPoints(dataPoints.filter((_, i) => i !== index));
  }, [dataPoints]);

  // Calculate circumference for circle progress
  const circumference = 2 * Math.PI * 45; // radius = 45

  // Render bar chart
  const renderBarChart = useCallback(() => {
    const maxValue = Math.max(...dataPoints.map(d => d.value), 100);

    return (
      <div className={styles.barChart}>
        {dataPoints.map((point, index) => (
          <div key={index} className={styles.barItem}>
            <div className={styles.barLabel}>{point.label}</div>
            <div className={styles.barTrack}>
              <div
                className={styles.barFill}
                style={{
                  width: `${(point.value / maxValue) * 100}%`,
                  backgroundColor: point.color
                }}
              >
                <span className={styles.barValue}>{point.value}%</span>
              </div>
            </div>
            <button
              onClick={() => removeDataPoint(index)}
              className={styles.removeButton}
              aria-label="Remove"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    );
  }, [dataPoints, removeDataPoint]);

  // Render progress rings
  const renderProgressRings = useCallback(() => {
    return (
      <div className={styles.ringsContainer}>
        {dataPoints.map((point, index) => {
          const offset = circumference - (point.value / 100) * circumference;

          return (
            <div key={index} className={styles.ringItem}>
              <svg className={styles.ringSvg} width="150" height="150">
                <circle
                  className={styles.ringTrack}
                  cx="75"
                  cy="75"
                  r="45"
                  fill="none"
                  strokeWidth="10"
                />
                <circle
                  className={styles.ringProgress}
                  cx="75"
                  cy="75"
                  r="45"
                  fill="none"
                  strokeWidth="10"
                  stroke={point.color}
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  style={{
                    transform: 'rotate(-90deg)',
                    transformOrigin: '50% 50%',
                    transition: 'stroke-dashoffset 0.5s ease'
                  }}
                />
                <text
                  x="75"
                  y="75"
                  className={styles.ringText}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {point.value}%
                </text>
              </svg>
              <div className={styles.ringLabel}>{point.label}</div>
              <button
                onClick={() => removeDataPoint(index)}
                className={styles.removeButton}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    );
  }, [dataPoints, circumference, removeDataPoint]);

  // Render horizontal progress bars
  const renderProgressBars = useCallback(() => {
    return (
      <div className={styles.progressBarsContainer}>
        {dataPoints.map((point, index) => (
          <div key={index} className={styles.progressBarCard}>
            <div className={styles.progressBarHeader}>
              <span className={styles.progressBarLabel}>{point.label}</span>
              <span className={styles.progressBarValue}>{point.value}%</span>
            </div>
            <div className={styles.progressBarTrack}>
              <div
                className={styles.progressBarFill}
                style={{
                  width: `${point.value}%`,
                  backgroundColor: point.color
                }}
              />
            </div>
            <button
              onClick={() => removeDataPoint(index)}
              className={styles.removeButton}
            >
              删除
            </button>
          </div>
        ))}
      </div>
    );
  }, [dataPoints, removeDataPoint]);

  // Render stat cards
  const renderStatCards = useCallback(() => {
    return (
      <div className={styles.statCardsContainer}>
        {dataPoints.map((point, index) => (
          <div
            key={index}
            className={styles.statCard}
            style={{ borderTop: `4px solid ${point.color}` }}
          >
            <div className={styles.statValue} style={{ color: point.color }}>
              {point.value}%
            </div>
            <div className={styles.statLabel}>{point.label}</div>
            <button
              onClick={() => removeDataPoint(index)}
              className={styles.removeButton}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    );
  }, [dataPoints, removeDataPoint]);

  // Render current chart
  const renderChart = useCallback(() => {
    switch (chartType) {
      case 'bar':
        return renderBarChart();
      case 'progress-ring':
        return renderProgressRings();
      case 'progress-bar':
        return renderProgressBars();
      case 'stat-card':
        return renderStatCards();
      default:
        return renderProgressBars();
    }
  }, [chartType, renderBarChart, renderProgressRings, renderProgressBars, renderStatCards]);

  const averageValue = useMemo(() => {
    if (dataPoints.length === 0) return 0;
    const sum = dataPoints.reduce((acc, point) => acc + point.value, 0);
    return Math.round(sum / dataPoints.length);
  }, [dataPoints]);

  return (
    <PluginWindow
      title="进度图表"
      icon="📊"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      className="progress-charts-standalone"
      pluginId="progress-charts"
      showStandaloneButton={false}
    >
      <div className={styles.container}>
        {/* Stats Summary */}
        <div className={styles.summary}>
          <div className={styles.summaryItem}>
            <div className={styles.summaryLabel}>数据点</div>
            <div className={styles.summaryValue}>{dataPoints.length}</div>
          </div>
          <div className={styles.summaryItem}>
            <div className={styles.summaryLabel}>平均值</div>
            <div className={styles.summaryValue}>{averageValue}%</div>
          </div>
          <div className={styles.summaryItem}>
            <div className={styles.summaryLabel}>最高值</div>
            <div className={styles.summaryValue}>
              {Math.max(...dataPoints.map(d => d.value), 0)}%
            </div>
          </div>
        </div>

        {/* Chart Type Selector */}
        <div className={styles.chartTypeSelector}>
          <button
            onClick={() => setChartType('progress-bar')}
            className={`${styles.typeButton} ${chartType === 'progress-bar' ? styles.active : ''}`}
          >
            进度条
          </button>
          <button
            onClick={() => setChartType('progress-ring')}
            className={`${styles.typeButton} ${chartType === 'progress-ring' ? styles.active : ''}`}
          >
            环形图
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`${styles.typeButton} ${chartType === 'bar' ? styles.active : ''}`}
          >
            柱状图
          </button>
          <button
            onClick={() => setChartType('stat-card')}
            className={`${styles.typeButton} ${chartType === 'stat-card' ? styles.active : ''}`}
          >
            卡片
          </button>
        </div>

        {/* Chart Display */}
        <div className={styles.chartDisplay}>
          {dataPoints.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📊</div>
              <p>添加数据点以创建图表</p>
            </div>
          ) : (
            renderChart()
          )}
        </div>

        {/* Add Data Point */}
        <div className={styles.addDataSection}>
          <h3 className={styles.sectionTitle}>添加数据点</h3>
          <div className={styles.addDataRow}>
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="标签名称"
              className={styles.input}
            />
            <input
              type="number"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="值 (0-100)"
              min="0"
              max="100"
              className={styles.input}
            />
            <input
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className={styles.colorPicker}
            />
            <button onClick={addDataPoint} className={styles.addButton}>
              + 添加
            </button>
          </div>
        </div>
      </div>
    </PluginWindow>
  );
};

export default ProgressCharts;
