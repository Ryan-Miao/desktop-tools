import React, { useState, useEffect } from 'react';
import { createLogger } from '../../shared/logger';
import PluginWindow from './PluginWindow/PluginWindow';
import './CalculatorPad.css';

const logger = createLogger('CalculatorPad');

interface Calculation {
  id: string;
  expression: string;
  result: number;
  timestamp: string;
}

interface CalculatorPadData {
  history: Calculation[];
}

const CalculatorPad: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [currentInput, setCurrentInput] = useState('');
  const [currentResult, setCurrentResult] = useState<number | null>(null);
  const [history, setHistory] = useState<Calculation[]>([]);

  // 追踪 onClose 调用
  const handleClose = () => {
    onClose();
  };

  // 加载数据
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (!window.electron?.ipcRenderer) return;
      const result = await window.electron.ipcRenderer.invoke('db:get-plugin-data', 'calculator-pad');
      if (result) {
        const data: CalculatorPadData = JSON.parse(result.data_json);
        setHistory(data.history || []);
      }
    } catch (error) {
      logger.error('Failed to load calculator data', { error });
    }
  };

  const saveData = async (newHistory: Calculation[]) => {
    try {
      if (!window.electron?.ipcRenderer) return;
      const data: CalculatorPadData = { history: newHistory };
      await window.electron.ipcRenderer.invoke('db:save-plugin-data',
        'calculator-pad',
        '计算稿纸',
        '1.0.0',
        JSON.stringify(data)
      );
    } catch (error) {
      logger.error('Failed to save calculator data', { error });
    }
  };

  // 实时计算表达式
  useEffect(() => {
    if (!currentInput.trim()) {
      setCurrentResult(null);
      return;
    }

    try {
      // 安全地计算表达式
      const result = Function('"use strict"; return (' + currentInput + ')')();
      if (typeof result === 'number' && !isNaN(result)) {
        setCurrentResult(result);
      } else {
        setCurrentResult(null);
      }
    } catch {
      setCurrentResult(null);
    }
  }, [currentInput]);

  // 按 Enter 键固定结果
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentResult !== null) {
      const newCalc: Calculation = {
        id: Date.now().toString(),
        expression: currentInput,
        result: currentResult,
        timestamp: new Date().toISOString()
      };

      const newHistory = [newCalc, ...history];
      setHistory(newHistory);
      saveData(newHistory);

      // 复制结果到下一行
      setCurrentInput(currentResult.toString());
      setCurrentResult(currentResult);
      e.preventDefault();
    }
  };

  // 删除记录
  const handleDelete = (id: string) => {
    const newHistory = history.filter(item => item.id !== id);
    setHistory(newHistory);
    saveData(newHistory);
  };

  // 格式化时间
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div onClick={(e) => e.stopPropagation()}>
        <PluginWindow
          title="计算稿纸"
          icon="🧮"
          onClose={handleClose}
          className="calculator-modal"
          pluginId="calculator-pad"
          showStandaloneButton={true}
        >
          {/* 当前计算区 */}
          <div className="current-calculation">
            <input
              type="text"
              className="calculation-input"
              placeholder="输入表达式，例如: 2 + 3 * 4"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {currentResult !== null && (
              <div className="current-result">
                = {currentResult.toLocaleString()}
              </div>
            )}
          </div>

          <div className="calculation-tips">
            💡 提示：按 Enter 键固定结果并复制到下一行
          </div>

          {/* 历史记录 */}
          <div className="history-section">
            <h3>历史记录</h3>
            {history.length === 0 ? (
              <div className="empty-state">暂无计算记录</div>
            ) : (
              <div className="history-list">
                {history.map((item) => (
                  <div key={item.id} className="history-item">
                    <div className="history-expression">{item.expression}</div>
                    <div className="history-result">= {item.result.toLocaleString()}</div>
                    <div className="history-time">{formatTime(item.timestamp)}</div>
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(item.id)}
                      title="删除"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </PluginWindow>
      </div>
    </div>
  );
};

export default CalculatorPad;
