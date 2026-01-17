import React, { useState, useEffect } from 'react';
import PluginWindow from '../../src/renderer/components/PluginWindow/PluginWindow';
import './JSONFormatter.css';

interface JSONFormatterProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

type Mode = 'format' | 'minify' | 'escape' | 'unescape' | 'validate';

const JSONFormatter: React.FC<JSONFormatterProps> = ({
  onClose,
  onMinimize,
  onMaximize
}) => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<Mode>('format');
  const [error, setError] = useState<string | null>(null);
  const [indentSize, setIndentSize] = useState(2);
  const [stats, setStats] = useState({ chars: 0, lines: 0, size: 0 });

  useEffect(() => {
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, indentSize);
      setStats({
        chars: formatted.length,
        lines: formatted.split('\n').length,
        size: new Blob([formatted]).size
      });
    } catch {
      setStats({ chars: input.length, lines: input.split('\n').length, size: 0 });
    }
  }, [input, indentSize]);

  const processJSON = () => {
    setError(null);
    setOutput('');

    try {
      const parsed = JSON.parse(input);
      let result = '';

      switch (mode) {
        case 'format':
          result = JSON.stringify(parsed, null, indentSize);
          break;
        case 'minify':
          result = JSON.stringify(parsed);
          break;
        case 'escape':
          result = JSON.stringify(parsed)
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"');
          break;
        case 'unescape':
          // 移除转义字符
          const unescaped = input.replace(/\\\\/g, '\\').replace(/\\"/g, '"');
          result = JSON.stringify(JSON.parse(unescaped), null, indentSize);
          break;
        case 'validate':
          result = '✅ JSON 格式正确！';
          break;
      }

      setOutput(result);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '未知错误';
      setError(errorMsg);
      setOutput(`❌ JSON 解析错误:\n${errorMsg}`);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      // 可以添加复制成功提示
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  const loadSample = () => {
    const sample = {
      "name": "JSON Formatter",
      "version": "1.0.0",
      "features": ["格式化", "压缩", "转义", "验证"],
      "config": {
        "indent": 2,
        "theme": "dark"
      },
      "active": true
    };
    setInput(JSON.stringify(sample));
  };

  const ModeButton: React.FC<{ mode: Mode; label: string; icon: string }> = ({ mode: m, label, icon }) => (
    <button
      className={`mode-btn ${mode === m ? 'active' : ''}`}
      onClick={() => setMode(m)}
      title={label}
    >
      <span className="mode-icon">{icon}</span>
      <span className="mode-label">{label}</span>
    </button>
  );

  return (
    <PluginWindow
      title="JSON 格式化工具"
      icon="📝"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      className="json-formatter-standalone"
      pluginId="json-formatter"
      showStandaloneButton={false}
    >
      <div className="json-formatter-container">
        {/* 工具栏 */}
        <div className="toolbar">
          <div className="mode-selector">
            <ModeButton mode="format" label="格式化" icon="✨" />
            <ModeButton mode="minify" label="压缩" icon="📦" />
            <ModeButton mode="escape" label="转义" icon="🔒" />
            <ModeButton mode="unescape" label="反转义" icon="🔓" />
            <ModeButton mode="validate" label="验证" icon="✅" />
          </div>

          <div className="toolbar-actions">
            <div className="indent-control">
              <label>缩进:</label>
              <select
                value={indentSize}
                onChange={(e) => setIndentSize(Number(e.target.value))}
                disabled={mode !== 'format'}
              >
                <option value={2}>2 空格</option>
                <option value={4}>4 空格</option>
                <option value={0}>无缩进</option>
              </select>
            </div>
          </div>
        </div>

        {/* 主要内容区 */}
        <div className="editor-container">
          {/* 输入区域 */}
          <div className="editor-panel input-panel">
            <div className="panel-header">
              <h3>输入</h3>
              <div className="panel-actions">
                <button onClick={loadSample} className="icon-btn" title="加载示例">
                  📋
                </button>
                <button onClick={clearAll} className="icon-btn" title="清空">
                  🗑️
                </button>
              </div>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="在此粘贴或输入 JSON..."
              className="editor-textarea"
              spellCheck={false}
            />
            <div className="panel-footer">
              <span className="stats">
                字符: {stats.chars} | 行数: {stats.lines}
              </span>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="action-buttons">
            <button onClick={processJSON} className="process-btn">
              <span className="btn-icon">⚡</span>
              <span>处理</span>
            </button>
            {output && (
              <button onClick={copyToClipboard} className="copy-btn">
                <span className="btn-icon">📋</span>
                <span>复制</span>
              </button>
            )}
          </div>

          {/* 输出区域 */}
          <div className="editor-panel output-panel">
            <div className="panel-header">
              <h3>输出</h3>
              {output && !error && (
                <div className="panel-actions">
                  <button onClick={copyToClipboard} className="icon-btn" title="复制结果">
                    📋
                  </button>
                </div>
              )}
            </div>
            <textarea
              value={output}
              readOnly
              placeholder="处理结果将显示在这里..."
              className={`editor-textarea ${error ? 'error' : 'success'}`}
              spellCheck={false}
            />
            {error && (
              <div className="error-hint">
                💡 提示: 检查 JSON 语法是否正确
              </div>
            )}
          </div>
        </div>

        {/* 状态栏 */}
        <div className="status-bar">
          <div className="status-left">
            <span className={`status-indicator ${error ? 'error' : output ? 'success' : ''}`}>
              {error ? '⚠️' : output ? '✓' : '○'}
            </span>
            <span className="status-text">
              {error ? '解析错误' : output ? '处理完成' : '等待输入'}
            </span>
          </div>
          <div className="status-right">
            {mode === 'format' && `缩进: ${indentSize} 空格`}
            {mode === 'minify' && '压缩模式'}
            {mode === 'escape' && '转义模式'}
            {mode === 'unescape' && '反转义模式'}
            {mode === 'validate' && '验证模式'}
          </div>
        </div>
      </div>
    </PluginWindow>
  );
};

export default JSONFormatter;
