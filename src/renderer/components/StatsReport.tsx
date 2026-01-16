import React, { useState, useEffect, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import './StatsReport.css';

// 注册 Chart.js 组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Stats {
  date: string;
  keyboard_count: number;
  mouse_click_count: number;
  mouse_move_distance: number;
}

interface StatsReportProps {
  onClose?: () => void;
}

const StatsReport: React.FC<StatsReportProps> = ({ onClose }) => {
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | 'today'>('7days');
  const [groupBy, setGroupBy] = useState<'hour' | 'day' | 'week'>('day');
  const [statsData, setStatsData] = useState<Stats[]>([]);
  const [loading, setLoading] = useState(false);

  // 加载统计数据
  const loadStats = useCallback(async () => {
    if (!window.electron?.ipcRenderer) {
      return;
    }

    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();

      switch (timeRange) {
        case '7days':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30days':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
      }

      const data = await window.electron.ipcRenderer.invoke(
        'db:get-stats',
        startDate.toISOString(),
        endDate.toISOString()
      );

      // 根据分组选项聚合数据
      const aggregatedData = aggregateData(data, groupBy);
      setStatsData(aggregatedData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  }, [timeRange, groupBy]);

  // 初始加载统计数据
  useEffect(() => {
    loadStats();
  }, []); // 只在组件挂载时加载一次

  // 监听统计数据更新（使用防抖避免频繁刷新）
  useEffect(() => {
    if (!window.electron?.ipcRenderer) {
      return;
    }

    let refreshTimeout: NodeJS.Timeout | null = null;

    const handleStatsUpdate = () => {
      // 清除之前的定时器（防抖）
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }

      // 延迟2秒后再刷新，避免用户正在查看数据时刷新
      refreshTimeout = setTimeout(() => {
        console.log('StatsReport: Stats saved, refreshing data...');
        loadStats();
        refreshTimeout = null;
      }, 2000);
    };

    window.electron.ipcRenderer.on('input-stats:update', handleStatsUpdate);

    return () => {
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
      window.electron?.ipcRenderer.removeAllListeners('input-stats:update');
    };
  }, [loadStats]);

  // 数据聚合
  const aggregateData = (data: Stats[], groupBy: string): Stats[] => {
    if (groupBy === 'day' || groupBy === 'week') {
      // 按日期聚合
      const aggregated = new Map<string, Stats>();

      data.forEach(item => {
        const date = new Date(item.date);
        let key: string;

        if (groupBy === 'day') {
          key = date.toISOString().split('T')[0];
        } else {
          // 按周聚合
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
        }

        const existing = aggregated.get(key);
        if (existing) {
          existing.keyboard_count += item.keyboard_count;
          existing.mouse_click_count += item.mouse_click_count;
          existing.mouse_move_distance += item.mouse_move_distance;
        } else {
          aggregated.set(key, { ...item, date: key });
        }
      });

      return Array.from(aggregated.values()).sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    } else {
      // 按小时聚合（仅用于今日数据）
      return data;
    }
  };

  // 导出 Excel
  const exportToExcel = async () => {
    try {
      const result = await window.electron.ipcRenderer.invoke('db:export-stats', statsData);
      if (result.success) {
        alert(`数据已导出到: ${result.filePath}`);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('导出失败，请检查权限');
    }
  };

  // 准备图表数据
  const prepareChartData = () => {
    const labels = statsData.map(item => {
      const date = new Date(item.date);
      if (groupBy === 'hour') {
        return `${date.getHours()}:00`;
      } else if (groupBy === 'day') {
        return `${date.getMonth() + 1}/${date.getDate()}`;
      } else {
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }
    });

    return {
      labels,
      datasets: [
        {
          label: '键盘次数',
          data: statsData.map(item => item.keyboard_count),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.1,
          fill: true
        },
        {
          label: '鼠标点击',
          data: statsData.map(item => item.mouse_click_count),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          tension: 0.1,
          fill: true
        }
      ]
    };
  };

  const prepareBarChartData = () => {
    const labels = statsData.map(item => {
      const date = new Date(item.date);
      if (groupBy === 'hour') {
        return `${date.getHours()}:00`;
      } else if (groupBy === 'day') {
        return `${date.getMonth() + 1}/${date.getDate()}`;
      } else {
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }
    });

    return {
      labels,
      datasets: [
        {
          label: '移动距离 (米)',
          data: statsData.map(item => (item.mouse_move_distance / 1000).toFixed(2)),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 1
        }
      ]
    };
  };

  // 计算总计
  const totals = statsData.reduce(
    (acc, item) => ({
      keyboard: acc.keyboard + item.keyboard_count,
      mouseClicks: acc.mouseClicks + item.mouse_click_count,
      mouseDistance: acc.mouseDistance + item.mouse_move_distance
    }),
    { keyboard: 0, mouseClicks: 0, mouseDistance: 0 }
  );

  // 获取今日数据
  const todayData = statsData.filter(item => {
    const itemDate = new Date(item.date).toDateString();
    const today = new Date().toDateString();
    return itemDate === today;
  });

  const todayTotal = todayData.reduce(
    (acc, item) => ({
      keyboard: acc.keyboard + item.keyboard_count,
      mouseClicks: acc.mouseClicks + item.mouse_click_count,
      mouseDistance: acc.mouseDistance + item.mouse_move_distance
    }),
    { keyboard: 0, mouseClicks: 0, mouseDistance: 0 }
  );

  // 工作状态评价
  const getWorkComment = (keyboard: number, mouseClicks: number, distance: number) => {
    const score = keyboard * 0.5 + mouseClicks * 1 + distance / 1000;

    if (score < 100) return '😴 今天很悠闲';
    if (score < 500) return '😊 工作节奏适中';
    if (score < 1000) return '💪 工作积极';
    if (score < 2000) return '🔥 工作效率很高';
    if (score < 5000) return '🚀 工作狂人';
    return '⚡ 枕式劳模，注意休息！';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content stats-report" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📊 统计报表</h2>
          {onClose && <button className="close-button" onClick={onClose}>✕</button>}
        </div>

        <div className="modal-body">
          {/* 控制栏 */}
          <div className="report-controls">
            <div className="control-group">
              <label>时间范围：</label>
              <select value={timeRange} onChange={(e) => setTimeRange(e.target.value as any)}>
                <option value="today">今日</option>
                <option value="7days">近7天</option>
                <option value="30days">近30天</option>
              </select>
            </div>

            <div className="control-group">
              <label>分组方式：</label>
              <select value={groupBy} onChange={(e) => setGroupBy(e.target.value as any)}>
                <option value="hour">按小时</option>
                <option value="day">按天</option>
                <option value="week">按周</option>
              </select>
            </div>

            <button
              className="refresh-button"
              onClick={loadStats}
              disabled={loading}
              title="刷新数据"
            >
              🔄 {loading ? '加载中...' : '刷新'}
            </button>

            <button className="export-button" onClick={exportToExcel}>
              📤 导出 Excel
            </button>
          </div>

          {loading ? (
            <div className="loading">加载中...</div>
          ) : (
            <>
              {/* 总览卡片 */}
              <div className="summary-cards">
                <div className="summary-card">
                  <div className="card-icon">⌨️</div>
                  <div className="card-content">
                    <div className="card-label">总键盘次数</div>
                    <div className="card-value">{totals.keyboard.toLocaleString()}</div>
                    {timeRange === 'today' && (
                      <div className="card-comment">今日: {todayTotal.keyboard}</div>
                    )}
                  </div>
                </div>

                <div className="summary-card">
                  <div className="card-icon">🖱️</div>
                  <div className="card-content">
                    <div className="card-label">总鼠标点击</div>
                    <div className="card-value">{totals.mouseClicks.toLocaleString()}</div>
                    {timeRange === 'today' && (
                      <div className="card-comment">今日: {todayTotal.mouseClicks}</div>
                    )}
                  </div>
                </div>

                <div className="summary-card">
                  <div className="card-icon">📏</div>
                  <div className="card-content">
                    <div className="card-label">总移动距离</div>
                    <div className="card-value">{(totals.mouseDistance / 1000).toFixed(2)}m</div>
                    {timeRange === 'today' && (
                      <div className="card-comment">今日: {(todayTotal.mouseDistance / 1000).toFixed(2)}m</div>
                    )}
                  </div>
                </div>

                <div className="summary-card comment-card">
                  <div className="card-icon">💬</div>
                  <div className="card-content">
                    <div className="card-label">工作评价</div>
                    <div className="card-value-comment">
                      {getWorkComment(totals.keyboard, totals.mouseClicks, totals.mouseDistance)}
                    </div>
                  </div>
                </div>
              </div>

              {/* 趋势图 */}
              <div className="chart-section">
                <h3>📈 输入趋势</h3>
                <div className="chart-container">
                  <Line
                    data={prepareChartData()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: true,
                      plugins: {
                        legend: {
                          position: 'top' as const
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* 移动距离柱状图 */}
              <div className="chart-section">
                <h3>📏 鼠标移动距离</h3>
                <div className="chart-container">
                  <Bar
                    data={prepareBarChartData()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: true,
                      plugins: {
                        legend: {
                          position: 'top' as const
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* 详细数据列表 */}
              <div className="data-table-section">
                <h3>📋 详细数据</h3>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>日期</th>
                        <th>键盘次数</th>
                        <th>鼠标点击</th>
                        <th>移动距离</th>
                        <th>评价</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statsData.map((item, index) => (
                        <tr key={index}>
                          <td>{new Date(item.date).toLocaleDateString()}</td>
                          <td>{item.keyboard_count}</td>
                          <td>{item.mouse_click_count}</td>
                          <td>{(item.mouse_move_distance / 1000).toFixed(2)}m</td>
                          <td>{getWorkComment(item.keyboard_count, item.mouse_click_count, item.mouse_move_distance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsReport;
