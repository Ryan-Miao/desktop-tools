/**
 * Code Formatter Plugin
 *
 * Professional code formatter with syntax validation
 * Supports: JSON, XML, SQL, HTML, CSS
 */

import React, { useState, useCallback } from 'react';
import PluginWindow from '../PluginWindow/PluginWindow';
import styles from './CodeFormatter.module.css';

type FormatType = 'json' | 'xml' | 'sql' | 'html' | 'css';

interface FormatConfig {
  id: FormatType;
  name: string;
  icon: string;
  description: string;
  example: string;
}

const FORMAT_CONFIGS: FormatConfig[] = [
  {
    id: 'json',
    name: 'JSON',
    icon: '{ }',
    description: 'JSON 格式化与验证',
    example: '{"name":"value"}',
  },
  {
    id: 'xml',
    name: 'XML',
    icon: '<>',
    description: 'XML 格式化与压缩',
    example: '<root><item>value</item></root>',
  },
  {
    id: 'sql',
    name: 'SQL',
    icon: 'SQL',
    description: 'SQL 关键字大写格式化',
    example: 'select * from users where id=1',
  },
  {
    id: 'html',
    name: 'HTML',
    icon: '🌐',
    description: 'HTML 缩进格式化',
    example: '<div><p>text</p></div>',
  },
  {
    id: 'css',
    name: 'CSS',
    icon: '🎨',
    description: 'CSS 选择器与属性格式化',
    example: '.class{color:red;font-size:14px}',
  },
];

interface CodeFormatterProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

const CodeFormatter: React.FC<CodeFormatterProps> = ({ onClose, onMinimize, onMaximize }) => {
  const [formatType, setFormatType] = useState<FormatType>('json');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const currentConfig = FORMAT_CONFIGS.find(config => config.id === formatType)!;

  // Format JSON
  const formatJSON = useCallback((code: string): string => {
    try {
      const parsed = JSON.parse(code);
      setIsValid(true);
      setError('');
      return JSON.stringify(parsed, null, 2);
    } catch (err) {
      setIsValid(false);
      setError(err instanceof Error ? err.message : 'Invalid JSON');
      throw err;
    }
  }, []);

  // Format XML
  const formatXML = useCallback((code: string): string => {
    try {
      // Remove extra whitespace
      let formatted = code.trim();

      // Add proper indentation
      let indent = 0;
      const tab = '  ';
      formatted = formatted.replace(/>\s*</g, '>\n<');

      const lines = formatted.split('\n');
      const formattedLines = lines.map(line => {
        const trimmed = line.trim();
        if (trimmed.match(/^<\/\w/)) {
          indent = Math.max(0, indent - 1);
        }
        const result = tab.repeat(indent) + trimmed;
        if (trimmed.match(/^<\w[^>]*[^/]>$/)) {
          indent++;
        }
        return result;
      });

      setIsValid(true);
      setError('');
      return formattedLines.join('\n');
    } catch (err) {
      setIsValid(false);
      setError(err instanceof Error ? err.message : 'Invalid XML');
      throw err;
    }
  }, []);

  // Format SQL
  const formatSQL = useCallback((code: string): string => {
    try {
      const sqlKeywords = [
        'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER',
        'ON', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'ORDER', 'BY', 'GROUP',
        'HAVING', 'LIMIT', 'OFFSET', 'INSERT', 'INTO', 'VALUES', 'UPDATE',
        'SET', 'DELETE', 'CREATE', 'TABLE', 'DROP', 'ALTER', 'ADD', 'COLUMN',
        'UNION', 'DISTINCT', 'AS', 'ASC', 'DESC', 'CASE', 'WHEN', 'THEN',
        'ELSE', 'END', 'EXISTS', 'BETWEEN', 'IS', 'NULL',
      ];

      let formatted = code;

      // Capitalize SQL keywords
      sqlKeywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        formatted = formatted.replace(regex, keyword);
      });

      // Add line breaks before major keywords
      const majorKeywords = [
        'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN',
        'INNER JOIN', 'ORDER BY', 'GROUP BY', 'HAVING', 'LIMIT',
        'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
        'CREATE TABLE', 'DROP TABLE', 'UNION',
      ];

      majorKeywords.forEach(keyword => {
        const regex = new RegExp(`\\s+${keyword}`, 'gi');
        formatted = formatted.replace(regex, `\n  ${keyword}`);
      });

      setIsValid(true);
      setError('');
      return formatted.trim();
    } catch (err) {
      setIsValid(false);
      setError(err instanceof Error ? err.message : 'Invalid SQL');
      throw err;
    }
  }, []);

  // Format HTML
  const formatHTML = useCallback((code: string): string => {
    try {
      let formatted = code.trim();
      let indent = 0;
      const tab = '  ';

      // Add newlines between tags
      formatted = formatted.replace(/>\s*</g, '>\n<');

      const lines = formatted.split('\n');
      const formattedLines = lines.map(line => {
        const trimmed = line.trim();
        if (!trimmed) return '';

        // Decrease indent for closing tags
        if (trimmed.match(/^<\/\w/)) {
          indent = Math.max(0, indent - 1);
        }

        const result = tab.repeat(indent) + trimmed;

        // Increase indent for opening tags
        if (trimmed.match(/^<\w[^>]*[^/]>$/)) {
          indent++;
        }

        return result;
      }).filter(line => line !== '');

      setIsValid(true);
      setError('');
      return formattedLines.join('\n');
    } catch (err) {
      setIsValid(false);
      setError(err instanceof Error ? err.message : 'Invalid HTML');
      throw err;
    }
  }, []);

  // Format CSS
  const formatCSS = useCallback((code: string): string => {
    try {
      let formatted = code.trim();

      // Remove extra spaces
      formatted = formatted.replace(/\s*{\s*/g, ' {\n  ');
      formatted = formatted.replace(/;\s*/g, ';\n  ');
      formatted = formatted.replace(/\s*}\s*/g, '\n}\n');

      // Add newline between rules
      formatted = formatted.replace(/}\n/g, '}\n\n');

      setIsValid(true);
      setError('');
      return formatted.trim();
    } catch (err) {
      setIsValid(false);
      setError(err instanceof Error ? err.message : 'Invalid CSS');
      throw err;
    }
  }, []);

  // Handle format button click
  const handleFormat = useCallback(() => {
    if (!input.trim()) {
      setError('请输入代码');
      setIsValid(false);
      return;
    }

    setError('');
    setIsValid(null);

    try {
      let formatted = '';
      switch (formatType) {
        case 'json':
          formatted = formatJSON(input);
          break;
        case 'xml':
          formatted = formatXML(input);
          break;
        case 'sql':
          formatted = formatSQL(input);
          break;
        case 'html':
          formatted = formatHTML(input);
          break;
        case 'css':
          formatted = formatCSS(input);
          break;
        default:
          formatted = input;
      }
      setOutput(formatted);
    } catch (err) {
      // Error already set in format functions
    }
  }, [input, formatType, formatJSON, formatXML, formatSQL, formatHTML, formatCSS]);

  // Compress code (remove whitespace)
  const handleCompress = useCallback(() => {
    if (!input.trim()) {
      setError('请输入代码');
      return;
    }

    try {
      let compressed = input;
      // Remove all line breaks and extra spaces
      compressed = compressed.replace(/\s+/g, ' ');
      compressed = compressed.replace(/\s*([{}:;,=<>])\s*/g, '$1');
      compressed = compressed.trim();

      setOutput(compressed);
      setIsValid(true);
      setError('');
    } catch (err) {
      setIsValid(false);
      setError(err instanceof Error ? err.message : '压缩失败');
    }
  }, [input]);

  // Copy to clipboard
  const handleCopy = useCallback(() => {
    if (!output) return;

    navigator.clipboard.writeText(output);
    announceToScreenReader('已复制格式化后的代码');
  }, [output]);

  // Clear all
  const handleClear = useCallback(() => {
    setInput('');
    setOutput('');
    setError('');
    setIsValid(null);
  }, []);

  // Load example
  const handleLoadExample = useCallback(() => {
    setInput(currentConfig.example);
    setOutput('');
    setError('');
    setIsValid(null);
  }, [currentConfig]);

  return (
    <PluginWindow
      title="代码格式化工具"
      icon="✨"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      className="code-formatter-standalone"
      pluginId="code-formatter"
      showStandaloneButton={false}
    >
      <div className={styles.codeFormatter}>
        {/* Format Type Selector */}
        <div className={styles.formatSelector}>
          <label>选择格式类型</label>
          <div className={styles.formatButtons} role="group" aria-label="代码格式类型">
            {FORMAT_CONFIGS.map(config => (
              <button
                key={config.id}
                onClick={() => setFormatType(config.id)}
                className={`${styles.formatButton} ${formatType === config.id ? styles.active : ''}`}
                aria-label={`切换到${config.name}格式化`}
                aria-pressed={formatType === config.id}
              >
                <span className={styles.formatIcon}>{config.icon}</span>
                <span className={styles.formatName}>{config.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Format Info */}
        <div className={styles.formatInfo}>
          <h3>{currentConfig.icon} {currentConfig.name}</h3>
          <p>{currentConfig.description}</p>
        </div>

        {/* Input Section */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <label htmlFor="code-input">输入代码</label>
            <button
              onClick={handleLoadExample}
              className={styles.textButton}
              aria-label="加载示例代码"
            >
              加载示例
            </button>
          </div>
          <textarea
            id="code-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={styles.textarea}
            placeholder={`在此输入${currentConfig.name}代码...`}
            aria-label="代码输入框"
            spellCheck={false}
          />
        </div>

        {/* Action Buttons */}
        <div className={styles.actions}>
          <button
            onClick={handleFormat}
            className={styles.primaryButton}
            aria-label="格式化代码"
          >
            ✨ 格式化
          </button>
          <button
            onClick={handleCompress}
            className={styles.secondaryButton}
            aria-label="压缩代码"
          >
            🗜️ 压缩
          </button>
          <button
            onClick={handleCopy}
            className={styles.secondaryButton}
            disabled={!output}
            aria-label="复制结果"
          >
            📋 复制
          </button>
          <button
            onClick={handleClear}
            className={styles.textButton}
            aria-label="清空所有内容"
          >
            🗑️ 清空
          </button>
        </div>

        {/* Validation Status */}
        {isValid !== null && (
          <div
            className={`${styles.validation} ${isValid ? styles.success : styles.error}`}
            role="alert"
            aria-live="polite"
          >
            {isValid ? (
              <span>✅ 代码格式正确</span>
            ) : (
              <span>❌ {error}</span>
            )}
          </div>
        )}

        {/* Output Section */}
        {output && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <label htmlFor="code-output">格式化结果</label>
              <span className={styles.lineCount}>
                {output.split('\n').length} 行
              </span>
            </div>
            <textarea
              id="code-output"
              value={output}
              readOnly
              className={styles.textarea}
              aria-label="格式化结果"
              spellCheck={false}
            />
          </div>
        )}
      </div>
    </PluginWindow>
  );
};

// Screen reader announcement helper
function announceToScreenReader(message: string) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.className = 'sr-only';
  announcement.style.position = 'absolute';
  announcement.style.left = '-10000px';
  announcement.style.width = '1px';
  announcement.style.height = '1px';
  announcement.style.overflow = 'hidden';
  announcement.textContent = message;
  document.body.appendChild(announcement);
  setTimeout(() => document.body.removeChild(announcement), 1000);
}

export default CodeFormatter;
