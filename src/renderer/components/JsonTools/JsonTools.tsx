import React, { useState } from 'react';
import PluginWindow from '../PluginWindow/PluginWindow';
import './JsonTools.css';

interface JsonToolsProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

type ToolMode = 'escape' | 'unescape' | 'csvToJson' | 'jsonToCsv';

const JsonTools: React.FC<JsonToolsProps> = ({
  onClose,
  onMinimize,
  onMaximize,
}) => {
  const [mode, setMode] = useState<ToolMode>('escape');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  // JSON 转义
  const jsonEscape = (str: string): string => {
    return JSON.stringify(str);
  };

  // JSON 反转义
  const jsonUnescape = (str: string): string => {
    try {
      const parsed = JSON.parse(str);
      if (typeof parsed === 'string') {
        return parsed;
      }
      throw new Error('输入不是有效的 JSON 字符串');
    } catch (err) {
      throw new Error('无效的 JSON 字符串: ' + (err as Error).message);
    }
  };

  // CSV 行解析（处理引号）
  const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // 双引号转义
          current += '"';
          i++; // 跳过下一个引号
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());

    return result;
  };

  // CSV 转 JSON
  const csvToJson = (csv: string): string => {
    try {
      const lines = csv.trim().split('\n');
      if (lines.length < 2) {
        throw new Error('CSV 至少需要 2 行（表头 + 数据）');
      }

      const headers = parseCsvLine(lines[0]);
      const result: Record<string, string>[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = parseCsvLine(lines[i]);
        const obj: Record<string, string> = {};

        headers.forEach((header, index) => {
          obj[header] = values[index] || '';
        });

        result.push(obj);
      }

      return JSON.stringify(result, null, 2);
    } catch (err) {
      throw new Error('CSV 解析失败: ' + (err as Error).message);
    }
  };

  // JSON 转 CSV
  const jsonToCsv = (jsonStr: string): string => {
    try {
      const data = JSON.parse(jsonStr);

      if (!Array.isArray(data)) {
        throw new Error('JSON 必须是数组格式');
      }

      if (data.length === 0) {
        throw new Error('JSON 数组不能为空');
      }

      // 获取所有可能的键（合并所有对象的键）
      const headersSet = new Set<string>();
      data.forEach((obj: Record<string, unknown>) => {
        Object.keys(obj).forEach(key => headersSet.add(key));
      });
      const headers = Array.from(headersSet);

      const csvRows: string[] = [];

      // 添加表头
      csvRows.push(headers.join(','));

      // 添加数据行
      for (const obj of data) {
        const values = headers.map(header => {
          const val = obj[header];
          const strVal = val === null || val === undefined ? '' : String(val);

          // 处理包含逗号、引号或换行的值
          if (strVal.includes(',') || strVal.includes('"') || strVal.includes('\n')) {
            return `"${strVal.replace(/"/g, '""')}"`;
          }
          return strVal;
        });
        csvRows.push(values.join(','));
      }

      return csvRows.join('\n');
    } catch (err) {
      throw new Error('JSON 解析失败: ' + (err as Error).message);
    }
  };

  // 执行转换
  const handleConvert = () => {
    setError('');
    setOutput('');

    if (!input.trim()) {
      setError('请输入内容');
      return;
    }

    try {
      let result = '';
      switch (mode) {
        case 'escape':
          result = jsonEscape(input);
          break;
        case 'unescape':
          result = jsonUnescape(input);
          break;
        case 'csvToJson':
          result = csvToJson(input);
          break;
        case 'jsonToCsv':
          result = jsonToCsv(input);
          break;
      }
      setOutput(result);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // 复制到剪贴板
  const handleCopy = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      // 可以添加一个简短的成功提示
      setError(''); // 清除可能的错误
    } catch (err) {
      setError('复制失败: ' + (err as Error).message);
    }
  };

  // 清空输入输出
  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  // 获取当前模式标题
  const getModeTitle = (): string => {
    switch (mode) {
      case 'escape':
        return 'JSON 转义';
      case 'unescape':
        return 'JSON 反转义';
      case 'csvToJson':
        return 'CSV 转 JSON';
      case 'jsonToCsv':
        return 'JSON 转 CSV';
    }
  };

  // 获取当前模式提示
  const getModePlaceholder = (): string => {
    switch (mode) {
      case 'escape':
        return '输入需要转义的字符串...';
      case 'unescape':
        return '输入转义的 JSON 字符串...';
      case 'csvToJson':
        return '输入 CSV 数据（第一行为表头）...';
      case 'jsonToCsv':
        return '输入 JSON 数组...';
    }
  };

  const handleClose = () => {
    handleClear();
    onClose();
  };

  return (
    <PluginWindow
      title="JSON 工具"
      icon="📋"
      onClose={handleClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      className="json-tools-standalone"
      pluginId="json-tools"
      showStandaloneButton={false}
    >
      <div className="json-tools-content">
        {/* 模式选择按钮组 */}
        <div className="json-tools-modes">
          <button
            className={`mode-btn ${mode === 'escape' ? 'active' : ''}`}
            onClick={() => {
              setMode('escape');
              setError('');
            }}
          >
            转义
          </button>
          <button
            className={`mode-btn ${mode === 'unescape' ? 'active' : ''}`}
            onClick={() => {
              setMode('unescape');
              setError('');
            }}
          >
            反转义
          </button>
          <button
            className={`mode-btn ${mode === 'csvToJson' ? 'active' : ''}`}
            onClick={() => {
              setMode('csvToJson');
              setError('');
            }}
          >
            CSV → JSON
          </button>
          <button
            className={`mode-btn ${mode === 'jsonToCsv' ? 'active' : ''}`}
            onClick={() => {
              setMode('jsonToCsv');
              setError('');
            }}
          >
            JSON → CSV
          </button>
        </div>

        {/* 当前模式标题 */}
        <div className="json-tools-current-mode">{getModeTitle()}</div>

        {/* 输入区域 */}
        <div className="json-tools-section">
          <div className="json-tools-label">输入:</div>
          <textarea
            className="json-tools-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={getModePlaceholder()}
            rows={8}
          />

          {/* 操作按钮 */}
          <div className="json-tools-actions">
            <button className="action-btn primary" onClick={handleConvert}>
              转换
            </button>
            <button className="action-btn" onClick={handleClear}>
              清空
            </button>
          </div>
        </div>

        {/* 错误提示 */}
        {error && mode !== 'escape' && mode !== 'unescape' && (
          <div className="json-tools-error">{error}</div>
        )}

        {/* 输出区域 */}
        <div className="json-tools-section">
          <div className="json-tools-label">输出:</div>
          <textarea
            className="json-tools-output"
            value={output}
            readOnly
            rows={8}
            placeholder="转换结果将显示在这里..."
          />

          {/* 输出操作按钮 */}
          <div className="json-tools-actions">
            <button
              className="action-btn primary"
              onClick={handleCopy}
              disabled={!output}
            >
              复制
            </button>
            <button
              className="action-btn"
              onClick={() => setOutput('')}
              disabled={!output}
            >
              清空输出
            </button>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (mode === 'escape' || mode === 'unescape') && (
          <div className="json-tools-error">{error}</div>
        )}
      </div>
    </PluginWindow>
  );
};

export const jsonToolsManifest = {
  id: 'com.desktop-tool.json-tools',
  name: 'JSON 工具',
  version: '1.0.0',
  description: 'JSON 转义、反转义、CSV 转 JSON、JSON 转 CSV',
  author: 'Desktop Tool',
  icon: '📋',
  entry: 'index.ts',
  category: '工具',
};

export default JsonTools;
