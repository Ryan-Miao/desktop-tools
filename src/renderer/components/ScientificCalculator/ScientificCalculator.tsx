/**
 * Scientific Calculator Plugin
 *
 * Advanced scientific calculator with history and unit conversions
 */

import React, { useState, useCallback, useEffect } from 'react';
import PluginWindow from '../PluginWindow/PluginWindow';
import styles from './ScientificCalculator.module.css';

type Operator = '+' | '-' | '*' | '/' | '^' | '%';

interface ScientificCalculatorProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

interface HistoryItem {
  expression: string;
  result: string;
  timestamp: number;
}

const ScientificCalculator: React.FC<ScientificCalculatorProps> = ({
  onClose,
  onMinimize,
  onMaximize,
}) => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [memory, setMemory] = useState(0);
  const [angleMode, setAngleMode] = useState<'deg' | 'rad'>('deg');

  // Clear display
  const clear = useCallback(() => {
    setDisplay('0');
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  }, []);

  // Clear last entry
  const clearEntry = useCallback(() => {
    setDisplay('0');
  }, []);

  // Input digit
  const inputDigit = useCallback((digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  }, [display, waitingForOperand]);

  // Input decimal
  const inputDecimal = useCallback(() => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  }, [display, waitingForOperand]);

  // Perform calculation
  const performOperation = useCallback((
    left: number,
    right: number,
    op: Operator
  ): number => {
    switch (op) {
      case '+':
        return left + right;
      case '-':
        return left - right;
      case '*':
        return left * right;
      case '/':
        return right !== 0 ? left / right : 0;
      case '^':
        return Math.pow(left, right);
      case '%':
        return left % right;
      default:
        return right;
    }
  }, []);

  // Handle operator
  const handleOperator = useCallback((op: Operator) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operator) {
      const result = performOperation(previousValue, inputValue, operator);
      setPreviousValue(result);
      setDisplay(String(result));
    }

    setOperator(op);
    setWaitingForOperand(true);
  }, [display, previousValue, operator, performOperation]);

  // Calculate equals
  const equals = useCallback(() => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operator) {
      const result = performOperation(previousValue, inputValue, operator);
      const expression = `${previousValue} ${operator} ${inputValue}`;

      // Add to history
      setHistory(prev => [{
        expression,
        result: String(result),
        timestamp: Date.now(),
      }, ...prev].slice(0, 10));

      setDisplay(String(result));
      setPreviousValue(null);
      setOperator(null);
      setWaitingForOperand(true);
    }
  }, [display, previousValue, operator, performOperation]);

  // Toggle sign
  const toggleSign = useCallback(() => {
    const value = parseFloat(display);
    setDisplay(String(-value));
  }, [display]);

  // Scientific functions
  const sin = useCallback(() => {
    const value = parseFloat(display);
    const radians = angleMode === 'deg' ? (value * Math.PI) / 180 : value;
    setDisplay(String(Math.sin(radians)));
    setWaitingForOperand(true);
  }, [display, angleMode]);

  const cos = useCallback(() => {
    const value = parseFloat(display);
    const radians = angleMode === 'deg' ? (value * Math.PI) / 180 : value;
    setDisplay(String(Math.cos(radians)));
    setWaitingForOperand(true);
  }, [display, angleMode]);

  const tan = useCallback(() => {
    const value = parseFloat(display);
    const radians = angleMode === 'deg' ? (value * Math.PI) / 180 : value;
    setDisplay(String(Math.tan(radians)));
    setWaitingForOperand(true);
  }, [display, angleMode]);

  const sqrt = useCallback(() => {
    const value = parseFloat(display);
    setDisplay(String(Math.sqrt(value)));
    setWaitingForOperand(true);
  }, [display]);

  const square = useCallback(() => {
    const value = parseFloat(display);
    setDisplay(String(Math.pow(value, 2)));
    setWaitingForOperand(true);
  }, [display]);

  const log = useCallback(() => {
    const value = parseFloat(display);
    setDisplay(String(Math.log10(value)));
    setWaitingForOperand(true);
  }, [display]);

  const ln = useCallback(() => {
    const value = parseFloat(display);
    setDisplay(String(Math.log(value)));
    setWaitingForOperand(true);
  }, [display]);

  const factorial = useCallback(() => {
    const value = parseInt(display);
    if (value < 0 || value > 170) {
      setDisplay('Error');
      return;
    }
    let result = 1;
    for (let i = 2; i <= value; i++) {
      result *= i;
    }
    setDisplay(String(result));
    setWaitingForOperand(true);
  }, [display]);

  const pi = useCallback(() => {
    setDisplay(String(Math.PI));
    setWaitingForOperand(true);
  }, []);

  const e = useCallback(() => {
    setDisplay(String(Math.E));
    setWaitingForOperand(true);
  }, []);

  // Memory functions
  const memoryClear = useCallback(() => {
    setMemory(0);
  }, []);

  const memoryRecall = useCallback(() => {
    setDisplay(String(memory));
    setWaitingForOperand(true);
  }, [memory]);

  const memoryAdd = useCallback(() => {
    setMemory(memory + parseFloat(display));
  }, [memory, display]);

  const memorySubtract = useCallback(() => {
    setMemory(memory - parseFloat(display));
  }, [memory, display]);

  // Backspace
  const backspace = useCallback(() => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  }, [display]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;

      if (/[0-9]/.test(key)) {
        inputDigit(key);
      } else if (key === '.') {
        inputDecimal();
      } else if (key === '+') {
        handleOperator('+');
      } else if (key === '-') {
        handleOperator('-');
      } else if (key === '*') {
        handleOperator('*');
      } else if (key === '/') {
        handleOperator('/');
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        equals();
      } else if (key === 'Escape') {
        clear();
      } else if (key === 'Backspace') {
        backspace();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputDigit, inputDecimal, handleOperator, equals, clear, backspace]);

  return (
    <PluginWindow
      title="科学计算器"
      icon="🧮"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      className="scientific-calculator-standalone"
      pluginId="scientific-calculator"
      showStandaloneButton={false}
    >
      <div className={styles.calculator}>
        {/* Display */}
        <div className={styles.display}>
          <div className={styles.previousValue}>
            {previousValue !== null && operator ? `${previousValue} ${operator}` : ''}
          </div>
          <div className={styles.currentValue}>{display}</div>
        </div>

        {/* Mode Toggle */}
        <div className={styles.modeToggle}>
          <button
            onClick={() => setAngleMode(angleMode === 'deg' ? 'rad' : 'deg')}
            className={styles.modeButton}
          >
            {angleMode.toUpperCase()}
          </button>
        </div>

        {/* Scientific Functions */}
        <div className={styles.scientific}>
          <button onClick={sin} className={styles.sciButton}>sin</button>
          <button onClick={cos} className={styles.sciButton}>cos</button>
          <button onClick={tan} className={styles.sciButton}>tan</button>
          <button onClick={log} className={styles.sciButton}>log</button>
          <button onClick={ln} className={styles.sciButton}>ln</button>
          <button onClick={sqrt} className={styles.sciButton}>√</button>
          <button onClick={square} className={styles.sciButton}>x²</button>
          <button onClick={factorial} className={styles.sciButton}>n!</button>
          <button onClick={pi} className={styles.sciButton}>π</button>
          <button onClick={e} className={styles.sciButton}>e</button>
        </div>

        {/* Basic Keypad */}
        <div className={styles.keypad}>
          <button onClick={memoryClear} className={styles.memoryButton}>MC</button>
          <button onClick={memoryRecall} className={styles.memoryButton}>MR</button>
          <button onClick={memoryAdd} className={styles.memoryButton}>M+</button>
          <button onClick={memorySubtract} className={styles.memoryButton}>M-</button>
          <button onClick={clear} className={styles.clearButton}>C</button>
          <button onClick={clearEntry} className={styles.clearButton}>CE</button>

          <button onClick={() => inputDigit('7')} className={styles.digitButton}>7</button>
          <button onClick={() => inputDigit('8')} className={styles.digitButton}>8</button>
          <button onClick={() => inputDigit('9')} className={styles.digitButton}>9</button>
          <button onClick={() => handleOperator('/')} className={styles.operatorButton}>÷</button>
          <button onClick={backspace} className={styles.functionButton}>⌫</button>

          <button onClick={() => inputDigit('4')} className={styles.digitButton}>4</button>
          <button onClick={() => inputDigit('5')} className={styles.digitButton}>5</button>
          <button onClick={() => inputDigit('6')} className={styles.digitButton}>6</button>
          <button onClick={() => handleOperator('*')} className={styles.operatorButton}>×</button>
          <button onClick={() => handleOperator('^')} className={styles.operatorButton}>xʸ</button>

          <button onClick={() => inputDigit('1')} className={styles.digitButton}>1</button>
          <button onClick={() => inputDigit('2')} className={styles.digitButton}>2</button>
          <button onClick={() => inputDigit('3')} className={styles.digitButton}>3</button>
          <button onClick={() => handleOperator('-')} className={styles.operatorButton}>−</button>
          <button onClick={() => handleOperator('%')} className={styles.operatorButton}>mod</button>

          <button onClick={toggleSign} className={styles.functionButton}>±</button>
          <button onClick={() => inputDigit('0')} className={styles.digitButton}>0</button>
          <button onClick={inputDecimal} className={styles.digitButton}>.</button>
          <button onClick={() => handleOperator('+')} className={styles.operatorButton}>+</button>
          <button onClick={equals} className={styles.equalsButton}>=</button>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className={styles.history}>
            <h3>历史记录</h3>
            <div className={styles.historyList}>
              {history.map((item, index) => (
                <div key={index} className={styles.historyItem}>
                  <span className={styles.historyExpression}>{item.expression}</span>
                  <span className={styles.historyResult}>= {item.result}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PluginWindow>
  );
};

export default ScientificCalculator;
