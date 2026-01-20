/**
 * JSON Diff Plugin
 *
 * 比较两个JSON对象的差异
 */

import React, { useState } from 'react';
import PluginWindow from '../PluginWindow/PluginWindow';
import styles from './JsonDiff.module.css';

interface JsonDiffProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

interface DiffResult {
  path: string;
  type: 'added' | 'removed' | 'changed' | 'unchanged';
  oldValue?: any;
  newValue?: any;
}

const JsonDiff: React.FC<JsonDiffProps> = ({ onClose, onMinimize, onMaximize }) => {
  const [json1, setJson1] = useState<string>('{\n  "name": "张三",\n  "age": 25,\n  "city": "北京"\n}');
  const [json2, setJson2] = useState<string>('{\n  "name": "张三",\n  "age": 26,\n  "email": "zhangsan@example.com"\n}');
  const [diffs, setDiffs] = useState<DiffResult[]>([]);
  const [error, setError] = useState<string>('');

  // 计算差异
  const calculateDiff = () => {
    setError('');
    setDiffs([]);

    try {
      const obj1 = JSON.parse(json1);
      const obj2 = JSON.parse(json2);
      const results: DiffResult[] = [];

      // 递归比较对象
      const compareObjects = (o1: any, o2: any, path: string = '') => {
        const allKeys = new Set([...Object.keys(o1 || {}), ...Object.keys(o2 || {})]);

        allKeys.forEach(key => {
          const currentPath = path ? `${path}.${key}` : key;
          const val1 = o1?.[key];
          const val2 = o2?.[key];

          // 检查是否新增
          if (!(key in o1) && key in o2) {
            results.push({
              path: currentPath,
              type: 'added',
              newValue: val2
            });
          }
          // 检查是否删除
          else if (key in o1 && !(key in o2)) {
            results.push({
              path: currentPath,
              type: 'removed',
              oldValue: val1
            });
          }
          // 检查是否修改
          else if (JSON.stringify(val1) !== JSON.stringify(val2)) {
            if (typeof val1 === 'object' && typeof val2 === 'object' && val1 !== null && val2 !== null) {
              // 递归比较嵌套对象
              compareObjects(val1, val2, currentPath);
            } else {
              results.push({
                path: currentPath,
                type: 'changed',
                oldValue: val1,
                newValue: val2
              });
            }
          }
        });
      };

      compareObjects(obj1, obj2);
      setDiffs(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'JSON格式错误');
    }
  };

  // 格式化JSON
  const formatJson = (input: string, setter: (val: string) => void) => {
    try {
      const parsed = JSON.parse(input);
      setter(JSON.stringify(parsed, null, 2));
    } catch (err) {
      setError('JSON格式错误，无法格式化');
    }
  };

  // 清空
  const clear = () => {
    setJson1('');
    setJson2('');
    setDiffs([]);
    setError('');
  };

  // 获取差异类型样式
  const getDiffTypeClass = (type: string) => {
    switch (type) {
      case 'added':
        return styles.diffAdded;
      case 'removed':
        return styles.diffRemoved;
      case 'changed':
        return styles.diffChanged;
      default:
        return styles.diffUnchanged;
    }
  };

  // 获取差异类型标签
  const getDiffTypeLabel = (type: string) => {
    switch (type) {
      case 'added':
        return '➕ 新增';
      case 'removed':
        return '➖ 删除';
      case 'changed':
        return '🔄 修改';
      default:
        return '✓ 相同';
    }
  };

  return (
    <PluginWindow
      title="JSON差异比较"
      icon="🔄"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      className="json-diff-standalone"
      pluginId="json-diff"
      showStandaloneButton={false}
    >
      <div className={styles.container}>
        {/* 输入区域 */}
        <div className={styles.inputs}>
          <div className={styles.inputPanel}>
            <div className={styles.panelHeader}>
              <h3>原始 JSON</h3>
              <button
                onClick={() => formatJson(json1, setJson1)}
                className={styles.formatButton}
              >
                格式化
              </button>
            </div>
            <textarea
              value={json1}
              onChange={(e) => setJson1(e.target.value)}
              className={styles.textarea}
              placeholder="粘贴第一个JSON对象..."
              spellCheck={false}
            />
          </div>

          <div className={styles.inputPanel}>
            <div className={styles.panelHeader}>
              <h3>新 JSON</h3>
              <button
                onClick={() => formatJson(json2, setJson2)}
                className={styles.formatButton}
              >
                格式化
              </button>
            </div>
            <textarea
              value={json2}
              onChange={(e) => setJson2(e.target.value)}
              className={styles.textarea}
              placeholder="粘贴第二个JSON对象..."
              spellCheck={false}
            />
          </div>
        </div>

        {/* 操作按钮 */}
        <div className={styles.actions}>
          <button onClick={calculateDiff} className={styles.compareButton}>
            🔍 比较差异
          </button>
          <button onClick={clear} className={styles.clearButton}>
            清空
          </button>
        </div>

        {/* 错误信息 */}
        {error && (
          <div className={styles.error}>
            ❌ {error}
          </div>
        )}

        {/* 差异结果 */}
        {diffs.length > 0 && (
          <div className={styles.results}>
            <div className={styles.resultsHeader}>
              <h3>差异结果</h3>
              <span className={styles.diffCount}>
                共 {diffs.length} 处差异
              </span>
            </div>
            <div className={styles.diffList}>
              {diffs.map((diff, index) => (
                <div key={index} className={`${styles.diffItem} ${getDiffTypeClass(diff.type)}`}>
                  <div className={styles.diffHeader}>
                    <span className={styles.diffType}>
                      {getDiffTypeLabel(diff.type)}
                    </span>
                    <code className={styles.diffPath}>{diff.path}</code>
                  </div>
                  <div className={styles.diffValues}>
                    {diff.oldValue !== undefined && (
                      <div className={styles.diffValue}>
                        <span className={styles.valueLabel}>旧值:</span>
                        <code className={styles.valueCode}>
                          {typeof diff.oldValue === 'object'
                            ? JSON.stringify(diff.oldValue)
                            : String(diff.oldValue)}
                        </code>
                      </div>
                    )}
                    {diff.newValue !== undefined && (
                      <div className={styles.diffValue}>
                        <span className={styles.valueLabel}>新值:</span>
                        <code className={styles.valueCode}>
                          {typeof diff.newValue === 'object'
                            ? JSON.stringify(diff.newValue)
                            : String(diff.newValue)}
                        </code>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PluginWindow>
  );
};

export default JsonDiff;
