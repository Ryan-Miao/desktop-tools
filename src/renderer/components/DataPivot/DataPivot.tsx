/**
 * Data Pivot Plugin
 *
 * CSV/JSON数据分析和可视化
 */

import React, { useState } from "react";
import PluginWindow from "../PluginWindow/PluginWindow";
import styles from "./DataPivot.module.css";

interface DataPivotProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

interface DataRow {
  [key: string]: string | number;
}

const DataPivot: React.FC<DataPivotProps> = ({
  onClose,
  onMinimize,
  onMaximize,
}) => {
  const [data, setData] = useState<DataRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [_selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [pivotColumn, setPivotColumn] = useState<string>("");
  const [valueColumn, setValueColumn] = useState<string>("");
  const [aggregateFunction, setAggregateFunction] = useState<
    "count" | "sum" | "avg"
  >("count");
  const [pivotResult, setPivotResult] = useState<{ [key: string]: number }>({});

  // 处理文件上传
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;

      if (file.name.endsWith(".json")) {
        try {
          const jsonData = JSON.parse(content);
          const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];
          processData(dataArray);
        } catch (err) {
          alert("JSON格式错误");
        }
      } else {
        // CSV处理
        const lines = content.trim().split("\n");
        if (lines.length < 2) return;

        const headers = lines[0]!.split(",").map((h) => h.trim());
        const rows = lines.slice(1).map((line) => {
          const values = line.split(",");
          const row: DataRow = {};
          headers.forEach((header, index) => {
            row[header] = values[index]?.trim() || "";
          });
          return row;
        });

        setColumns(headers);
        setData(rows);
      }
    };

    reader.readAsText(file);
  };

  // 处理数据
  const processData = (dataArray: any[]) => {
    if (dataArray.length === 0) return;

    const cols = Object.keys(dataArray[0]);
    setColumns(cols);
    setData(dataArray);
  };

  // 生成透视表
  const generatePivot = () => {
    if (!pivotColumn || !valueColumn) return;

    const result: { [key: string]: number[] } = {};

    data.forEach((row) => {
      const key = String(row[pivotColumn]);
      const value = parseFloat(String(row[valueColumn])) || 0;

      if (!result[key]) {
        result[key] = [];
      }
      result[key].push(value);
    });

    const aggregated: { [key: string]: number } = {};

    Object.entries(result).forEach(([key, values]) => {
      switch (aggregateFunction) {
        case "count":
          aggregated[key] = values.length;
          break;
        case "sum":
          aggregated[key] = values.reduce((a, b) => a + b, 0);
          break;
        case "avg":
          aggregated[key] = values.reduce((a, b) => a + b, 0) / values.length;
          break;
      }
    });

    setPivotResult(aggregated);
  };

  // 导出数据
  const exportData = () => {
    const csv = [
      columns.join(","),
      ...data.map((row) => columns.map((col) => row[col]).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // 清空数据
  const clearData = () => {
    if (confirm("确定要清空数据吗？")) {
      setData([]);
      setColumns([]);
      setSelectedColumns([]);
      setPivotColumn("");
      setValueColumn("");
      setPivotResult({});
    }
  };

  return (
    <PluginWindow
      title="数据透视"
      icon="📊"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      className="data-pivot-standalone"
      pluginId="data-pivot"
      showStandaloneButton={false}
    >
      <div className={styles.container}>
        {/* 文件上传 */}
        <div className={styles.uploadSection}>
          <h3>导入数据</h3>
          <label className={styles.uploadLabel}>
            <input
              type="file"
              accept=".csv,.json"
              onChange={handleFileUpload}
              className={styles.fileInput}
            />
            <span>📁 选择CSV或JSON文件</span>
          </label>
          <div className={styles.uploadInfo}>
            支持 CSV 和 JSON 格式，第一行为列名
          </div>
        </div>

        {/* 数据预览 */}
        {data.length > 0 && (
          <div className={styles.dataSection}>
            <div className={styles.sectionHeader}>
              <h3>数据预览 ({data.length} 行)</h3>
              <div className={styles.sectionActions}>
                <button onClick={exportData} className={styles.exportButton}>
                  📥 导出
                </button>
                <button onClick={clearData} className={styles.clearButton}>
                  清空
                </button>
              </div>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    {columns.map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 10).map((row, index) => (
                    <tr key={index}>
                      {columns.map((col) => (
                        <td key={col}>{String(row[col])}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.length > 10 && (
                <div className={styles.moreInfo}>
                  还有 {data.length - 10} 行数据...
                </div>
              )}
            </div>
          </div>
        )}

        {/* 透视分析 */}
        {columns.length > 0 && (
          <div className={styles.pivotSection}>
            <h3>透视分析</h3>
            <div className={styles.pivotControls}>
              <div className={styles.controlGroup}>
                <label>分组列</label>
                <select
                  value={pivotColumn}
                  onChange={(e) => setPivotColumn(e.target.value)}
                  className={styles.select}
                >
                  <option value="">选择列</option>
                  {columns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.controlGroup}>
                <label>数值列</label>
                <select
                  value={valueColumn}
                  onChange={(e) => setValueColumn(e.target.value)}
                  className={styles.select}
                >
                  <option value="">选择列</option>
                  {columns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.controlGroup}>
                <label>聚合方式</label>
                <select
                  value={aggregateFunction}
                  onChange={(e) => setAggregateFunction(e.target.value as any)}
                  className={styles.select}
                >
                  <option value="count">计数</option>
                  <option value="sum">求和</option>
                  <option value="avg">平均</option>
                </select>
              </div>
              <button onClick={generatePivot} className={styles.generateButton}>
                📊 生成透视表
              </button>
            </div>
          </div>
        )}

        {/* 透视结果 */}
        {Object.keys(pivotResult).length > 0 && (
          <div className={styles.resultSection}>
            <h3>透视结果</h3>
            <div className={styles.resultList}>
              {Object.entries(pivotResult)
                .sort((a, b) => b[1] - a[1])
                .map(([key, value]) => (
                  <div key={key} className={styles.resultItem}>
                    <span className={styles.resultKey}>{key}</span>
                    <span className={styles.resultValue}>
                      {typeof value === "number" ? value.toFixed(2) : value}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 统计信息 */}
        {data.length > 0 && (
          <div className={styles.statsSection}>
            <h3>统计信息</h3>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>总行数</span>
                <span className={styles.statValue}>{data.length}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>列数</span>
                <span className={styles.statValue}>{columns.length}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </PluginWindow>
  );
};

export default DataPivot;
