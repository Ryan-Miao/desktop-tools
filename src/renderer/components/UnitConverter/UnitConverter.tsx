/**
 * Unit Converter Plugin
 *
 * Quick unit conversions for length, weight, temperature, and more
 */

import React, { useState, useMemo } from 'react';
import PluginWindow from '../PluginWindow/PluginWindow';
import styles from './UnitConverter.module.css';

interface ConversionUnit {
  name: string;
  symbol: string;
  toBase: (value: number) => number;
  fromBase: (value: number) => number;
}

interface ConversionCategory {
  id: string;
  name: string;
  icon: string;
  units: ConversionUnit[];
}

const CONVERSION_CATEGORIES: ConversionCategory[] = [
  {
    id: 'length',
    name: '长度',
    icon: '📏',
    units: [
      { name: '毫米', symbol: 'mm', toBase: v => v / 1000, fromBase: v => v * 1000 },
      { name: '厘米', symbol: 'cm', toBase: v => v / 100, fromBase: v => v * 100 },
      { name: '米', symbol: 'm', toBase: v => v, fromBase: v => v },
      { name: '千米', symbol: 'km', toBase: v => v * 1000, fromBase: v => v / 1000 },
      { name: '英寸', symbol: 'in', toBase: v => v * 0.0254, fromBase: v => v / 0.0254 },
      { name: '英尺', symbol: 'ft', toBase: v => v * 0.3048, fromBase: v => v / 0.3048 },
      { name: '码', symbol: 'yd', toBase: v => v * 0.9144, fromBase: v => v / 0.9144 },
      { name: '英里', symbol: 'mi', toBase: v => v * 1609.344, fromBase: v => v / 1609.344 },
    ],
  },
  {
    id: 'weight',
    name: '重量',
    icon: '⚖️',
    units: [
      { name: '毫克', symbol: 'mg', toBase: v => v / 1000000, fromBase: v => v * 1000000 },
      { name: '克', symbol: 'g', toBase: v => v / 1000, fromBase: v => v * 1000 },
      { name: '千克', symbol: 'kg', toBase: v => v, fromBase: v => v },
      { name: '吨', symbol: 't', toBase: v => v * 1000, fromBase: v => v / 1000 },
      { name: '盎司', symbol: 'oz', toBase: v => v * 28.3495, fromBase: v => v / 28.3495 },
      { name: '磅', symbol: 'lb', toBase: v => v * 453.592, fromBase: v => v / 453.592 },
    ],
  },
  {
    id: 'temperature',
    name: '温度',
    icon: '🌡️',
    units: [
      { name: '摄氏度', symbol: '°C', toBase: v => v, fromBase: v => v },
      { name: '华氏度', symbol: '°F', toBase: v => (v - 32) * 5/9, fromBase: v => v * 9/5 + 32 },
      { name: '开尔文', symbol: 'K', toBase: v => v - 273.15, fromBase: v => v + 273.15 },
    ],
  },
  {
    id: 'area',
    name: '面积',
    icon: '📐',
    units: [
      { name: '平方毫米', symbol: 'mm²', toBase: v => v / 1000000, fromBase: v => v * 1000000 },
      { name: '平方厘米', symbol: 'cm²', toBase: v => v / 10000, fromBase: v => v * 10000 },
      { name: '平方米', symbol: 'm²', toBase: v => v, fromBase: v => v },
      { name: '平方千米', symbol: 'km²', toBase: v => v * 1000000, fromBase: v => v / 1000000 },
      { name: '平方英尺', symbol: 'ft²', toBase: v => v * 0.092903, fromBase: v => v / 0.092903 },
      { name: '英亩', symbol: 'ac', toBase: v => v * 4046.86, fromBase: v => v / 4046.86 },
      { name: '公顷', symbol: 'ha', toBase: v => v * 10000, fromBase: v => v / 10000 },
    ],
  },
  {
    id: 'volume',
    name: '体积',
    icon: '🧊',
    units: [
      { name: '毫升', symbol: 'mL', toBase: v => v / 1000, fromBase: v => v * 1000 },
      { name: '升', symbol: 'L', toBase: v => v, fromBase: v => v },
      { name: '立方米', symbol: 'm³', toBase: v => v * 1000, fromBase: v => v / 1000 },
      { name: '加仑', symbol: 'gal', toBase: v => v * 3.78541, fromBase: v => v / 3.78541 },
      { name: '品脱', symbol: 'pt', toBase: v => v * 0.473176, fromBase: v => v / 0.473176 },
      { name: '杯', symbol: 'cup', toBase: v => v * 0.236588, fromBase: v => v / 0.236588 },
    ],
  },
  {
    id: 'data',
    name: '数据',
    icon: '💾',
    units: [
      { name: '字节', symbol: 'B', toBase: v => v, fromBase: v => v },
      { name: '千字节', symbol: 'KB', toBase: v => v * 1024, fromBase: v => v / 1024 },
      { name: '兆字节', symbol: 'MB', toBase: v => v * 1048576, fromBase: v => v / 1048576 },
      { name: '吉字节', symbol: 'GB', toBase: v => v * 1073741824, fromBase: v => v / 1073741824 },
      { name: '太字节', symbol: 'TB', toBase: v => v * 1099511627776, fromBase: v => v / 1099511627776 },
    ],
  },
];

interface UnitConverterProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

const UnitConverter: React.FC<UnitConverterProps> = ({ onClose, onMinimize, onMaximize }) => {
  const [activeCategory, setActiveCategory] = useState(CONVERSION_CATEGORIES[0]);
  const [fromValue, setFromValue] = useState('1');
  const [fromUnitIndex, setFromUnitIndex] = useState(0);
  const [toUnitIndex, setToUnitIndex] = useState(1);

  const currentUnits = activeCategory.units;
  const fromUnit = currentUnits[fromUnitIndex];
  const toUnit = currentUnits[toUnitIndex];

  // Calculate converted value
  const convertedValue = useMemo(() => {
    const value = parseFloat(fromValue) || 0;
    const baseValue = fromUnit.toBase(value);
    const result = toUnit.fromBase(baseValue);

    // Format result
    if (result === 0) return '0';
    if (Math.abs(result) < 0.000001 || Math.abs(result) > 999999) {
      return result.toExponential(6);
    }
    return parseFloat(result.toPrecision(10)).toString();
  }, [fromValue, fromUnit, toUnit]);

  // Swap units
  const handleSwap = () => {
    setFromUnitIndex(toUnitIndex);
    setToUnitIndex(fromUnitIndex);
  };

  // Copy result to clipboard
  const copyResult = () => {
    navigator.clipboard.writeText(convertedValue);
    announceToScreenReader(`已复制转换结果: ${convertedValue}`);
  };

  return (
    <PluginWindow
      title="单位转换器"
      icon="💱"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      className="unit-converter-standalone"
      pluginId="unit-converter"
      showStandaloneButton={false}
    >
      <div className={styles.unitConverter}>
        {/* Category Selection */}
        <div className={styles.categories}>
          {CONVERSION_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setActiveCategory(category);
                setFromUnitIndex(0);
                setToUnitIndex(1);
              }}
              className={`${styles.categoryButton} ${
                activeCategory.id === category.id ? styles.active : ''
              }`}
              aria-label={`选择${category.name}转换`}
            >
              <span className={styles.categoryIcon}>{category.icon}</span>
              <span className={styles.categoryName}>{category.name}</span>
            </button>
          ))}
        </div>

        {/* Conversion Area */}
        <div className={styles.conversionArea}>
          {/* From */}
          <div className={styles.conversionGroup}>
            <label>从</label>
            <input
              type="number"
              value={fromValue}
              onChange={(e) => setFromValue(e.target.value)}
              className={styles.valueInput}
              placeholder="输入数值"
              aria-label="输入要转换的数值"
            />
            <select
              value={fromUnitIndex}
              onChange={(e) => setFromUnitIndex(parseInt(e.target.value))}
              className={styles.unitSelect}
              aria-label="选择源单位"
            >
              {currentUnits.map((unit, index) => (
                <option key={unit.symbol} value={index}>
                  {unit.name} ({unit.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            className={styles.swapButton}
            aria-label="交换单位"
          >
            ⇅
          </button>

          {/* To */}
          <div className={styles.conversionGroup}>
            <label>到</label>
            <input
              type="text"
              value={convertedValue}
              readOnly
              className={styles.resultInput}
              aria-label="转换结果"
            />
            <select
              value={toUnitIndex}
              onChange={(e) => setToUnitIndex(parseInt(e.target.value))}
              className={styles.unitSelect}
              aria-label="选择目标单位"
            >
              {currentUnits.map((unit, index) => (
                <option key={unit.symbol} value={index}>
                  {unit.name} ({unit.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Copy Button */}
        <div className={styles.actions}>
          <button
            onClick={copyResult}
            className={styles.copyButton}
            aria-label="复制转换结果"
          >
            📋 复制结果
          </button>
        </div>

        {/* Quick Reference Table */}
        <div className={styles.referenceTable}>
          <h3>常用转换参考</h3>
          <div className={styles.tableContent}>
            {activeCategory.id === 'length' && (
              <table>
                <tbody>
                  <tr>
                    <td>1 英寸</td>
                    <td>= 2.54 厘米</td>
                  </tr>
                  <tr>
                    <td>1 英尺</td>
                    <td>= 30.48 厘米</td>
                  </tr>
                  <tr>
                    <td>1 码</td>
                    <td>= 0.9144 米</td>
                  </tr>
                  <tr>
                    <td>1 英里</td>
                    <td>= 1.609 千米</td>
                  </tr>
                </tbody>
              </table>
            )}
            {activeCategory.id === 'weight' && (
              <table>
                <tbody>
                  <tr>
                    <td>1 千克</td>
                    <td>= 1000 克</td>
                  </tr>
                  <tr>
                    <td>1 磅</td>
                    <td>= 0.4536 千克</td>
                  </tr>
                  <tr>
                    <td>1 盎司</td>
                    <td>= 28.35 克</td>
                  </tr>
                  <tr>
                    <td>1 吨</td>
                    <td>= 1000 千克</td>
                  </tr>
                </tbody>
              </table>
            )}
            {activeCategory.id === 'temperature' && (
              <table>
                <tbody>
                  <tr>
                    <td>0°C</td>
                    <td>= 32°F (冰点)</td>
                  </tr>
                  <tr>
                    <td>100°C</td>
                    <td>= 212°F (沸点)</td>
                  </tr>
                  <tr>
                    <td>37°C</td>
                    <td>= 98.6°F (体温)</td>
                  </tr>
                  <tr>
                    <td>-40°C</td>
                    <td>= -40°F</td>
                  </tr>
                </tbody>
              </table>
            )}
            {activeCategory.id === 'area' && (
              <table>
                <tbody>
                  <tr>
                    <td>1 平方米</td>
                    <td>= 10.76 平方英尺</td>
                  </tr>
                  <tr>
                    <td>1 英亩</td>
                    <td>= 4046.86 平方米</td>
                  </tr>
                  <tr>
                    <td>1 公顷</td>
                    <td>= 10000 平方米</td>
                  </tr>
                  <tr>
                    <td>1 平方千米</td>
                    <td>= 247.1 英亩</td>
                  </tr>
                </tbody>
              </table>
            )}
            {activeCategory.id === 'volume' && (
              <table>
                <tbody>
                  <tr>
                    <td>1 升</td>
                    <td>= 1000 毫升</td>
                  </tr>
                  <tr>
                    <td>1 加仑</td>
                    <td>= 3.785 升</td>
                  </tr>
                  <tr>
                    <td>1 杯</td>
                    <td>= 236.6 毫升</td>
                  </tr>
                  <tr>
                    <td>1 品脱</td>
                    <td>= 473.2 毫升</td>
                  </tr>
                </tbody>
              </table>
            )}
            {activeCategory.id === 'data' && (
              <table>
                <tbody>
                  <tr>
                    <td>1 字节</td>
                    <td>= 8 位</td>
                  </tr>
                  <tr>
                    <td>1 KB</td>
                    <td>= 1024 字节</td>
                  </tr>
                  <tr>
                    <td>1 MB</td>
                    <td>= 1024 KB</td>
                  </tr>
                  <tr>
                    <td>1 GB</td>
                    <td>= 1024 MB</td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </div>
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

export default UnitConverter;
