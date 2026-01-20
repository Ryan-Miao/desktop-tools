/**
 * JSON to TypeScript Converter Plugin
 *
 * Converts JSON objects to TypeScript interfaces and types
 */

import React, { useState, useCallback } from 'react';
import PluginWindow from '../PluginWindow/PluginWindow';
import styles from './JsonToTs.module.css';

interface JsonToTsProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

const JsonToTs: React.FC<JsonToTsProps> = ({
  onClose,
  onMinimize,
  onMaximize,
}) => {
  const [jsonInput, setJsonInput] = useState('');
  const [tsOutput, setTsOutput] = useState('');
  const [rootTypeName, setRootTypeName] = useState('RootObject');
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Convert JSON value to TypeScript type
  const getValueType = useCallback((key: string, value: any, typeName: string): string => {
    if (value === null) {
      return 'null';
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return 'any[]';
      }

      // Get the type of the first element
      const firstType = getValueType(key, value[0], `${capitalize(key)}Item`);
      return `${firstType.replace(' | null', '')}[]`;
    }

    const type = typeof value;

    switch (type) {
      case 'string':
        return 'string';
      case 'number':
        return 'number';
      case 'boolean':
        return 'boolean';
      case 'object':
        return generateInterface(value, typeName);
      default:
        return 'any';
    }
  }, []);

  // Generate TypeScript interface from object
  const generateInterface = useCallback((obj: any, interfaceName: string): string => {
    if (!obj || typeof obj !== 'object') {
      return 'any';
    }

    const keys = Object.keys(obj);
    if (keys.length === 0) {
      return 'Record<string, any>';
    }

    let output = `interface ${interfaceName} {\n`;

    keys.forEach(key => {
      const value = obj[key];
      const valueType = getValueType(key, value, capitalize(key));

      // Handle optional fields (null values)
      const optional = value === null ? '?' : '';

      output += `  ${key}${optional}: ${valueType};\n`;
    });

    output += '}';

    return output;
  }, [getValueType]);

  // Capitalize first letter
  const capitalize = useCallback((str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }, []);

  // Convert JSON to TypeScript
  const convertJson = useCallback(() => {
    setError('');
    setTsOutput('');

    if (!jsonInput.trim()) {
      setError('请输入 JSON 数据');
      return;
    }

    try {
      const parsed = JSON.parse(jsonInput);

      if (typeof parsed !== 'object' || parsed === null) {
        setError('JSON 必须是对象或数组');
        return;
      }

      let result = '';

      if (Array.isArray(parsed)) {
        if (parsed.length > 0) {
          const itemInterface = generateInterface(parsed[0], `${rootTypeName}Item`);
          result = `${itemInterface}\n\n`;
          result += `type ${rootTypeName} = ${rootTypeName}Item[];`;
        } else {
          result = `type ${rootTypeName} = any[];`;
        }
      } else {
        result = generateInterface(parsed, rootTypeName);
      }

      setTsOutput(result);
    } catch (err) {
      setError(`无效的 JSON: ${err instanceof Error ? err.message : '未知错误'}`);
    }
  }, [jsonInput, rootTypeName, generateInterface]);

  // Copy to clipboard
  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(tsOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [tsOutput]);

  // Load sample JSON
  const loadSample = useCallback(() => {
    const sample = {
      "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "isActive": true,
        "roles": ["admin", "user"],
        "profile": {
          "age": 30,
          "address": null,
          "preferences": {
            "theme": "dark",
            "notifications": true
          }
        }
      }
    };
    setJsonInput(JSON.stringify(sample, null, 2));
  }, []);

  return (
    <PluginWindow
      title="JSON 转 TypeScript"
      icon="🔄"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      className="json-to-ts-standalone"
      pluginId="json-to-ts"
      showStandaloneButton={false}
    >
      <div className={styles.container}>
        {/* Controls */}
        <div className={styles.controls}>
          <div className={styles.inputGroup}>
            <label htmlFor="rootType" className={styles.label}>根类型名称</label>
            <input
              id="rootType"
              type="text"
              value={rootTypeName}
              onChange={(e) => setRootTypeName(e.target.value)}
              className={styles.input}
              placeholder="RootObject"
            />
          </div>

          <div className={styles.buttonGroup}>
            <button onClick={convertJson} className={styles.convertButton}>
              🔄 转换
            </button>
            <button onClick={loadSample} className={styles.sampleButton}>
              📝 示例
            </button>
            <button
              onClick={() => {
                setJsonInput('');
                setTsOutput('');
                setError('');
              }}
              className={styles.clearButton}
            >
              🗑️ 清空
            </button>
          </div>
        </div>

        {/* Input and Output */}
        <div className={styles.editorContainer}>
          {/* JSON Input */}
          <div className={styles.editorSection}>
            <div className={styles.editorHeader}>
              <h3 className={styles.editorTitle}>JSON 输入</h3>
              <span className={styles.hint}>粘贴或输入 JSON 数据</span>
            </div>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className={styles.textarea}
              placeholder='{"key": "value"}'
              spellCheck={false}
            />
          </div>

          {/* TypeScript Output */}
          <div className={styles.editorSection}>
            <div className={styles.editorHeader}>
              <h3 className={styles.editorTitle}>TypeScript 输出</h3>
              {tsOutput && (
                <button
                  onClick={copyToClipboard}
                  className={styles.copyButton}
                >
                  {copied ? '✓ 已复制' : '📋 复制'}
                </button>
              )}
            </div>
            <textarea
              value={tsOutput}
              readOnly
              className={`${styles.textarea} ${styles.readonly}`}
              placeholder="点击转换按钮生成 TypeScript 类型..."
              spellCheck={false}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className={styles.error}>
            ⚠️ {error}
          </div>
        )}

        {/* Options */}
        <div className={styles.options}>
          <h4 className={styles.optionsTitle}>使用说明</h4>
          <ul className={styles.optionsList}>
            <li>输入有效的 JSON 对象或数组</li>
            <li>点击"转换"按钮生成 TypeScript 类型</li>
            <li>数组会生成元素类型的接口</li>
            <li>可选字段（null 值）会自动添加 ?</li>
            <li>点击"复制"按钮将结果复制到剪贴板</li>
          </ul>
        </div>
      </div>
    </PluginWindow>
  );
};

export default JsonToTs;
