/**
 * Animation Generator Plugin
 *
 * CSS关键帧动画生成器
 */

import React, { useState, useEffect } from 'react';
import PluginWindow from '../PluginWindow/PluginWindow';
import styles from './AnimationGenerator.module.css';

interface AnimationGeneratorProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

interface Keyframe {
  percent: number;
  properties: {
    transform?: string;
    opacity?: number;
    backgroundColor?: string;
  };
}

const AnimationGenerator: React.FC<AnimationGeneratorProps> = ({ onClose, onMinimize, onMaximize }) => {
  const [animationName, setAnimationName] = useState<string>('myAnimation');
  const [duration, setDuration] = useState<number>(1);
  const [timing, setTiming] = useState<string>('ease');
  const [delay, setDelay] = useState<number>(0);
  const [iteration, setIteration] = useState<string>('infinite');
  const [keyframes, setKeyframes] = useState<Keyframe[]>([
    { percent: 0, properties: { transform: 'translateX(0)', opacity: 1 } },
    { percent: 50, properties: { transform: 'translateX(100px)', opacity: 0.5 } },
    { percent: 100, properties: { transform: 'translateX(0)', opacity: 1 } }
  ]);

  // 生成CSS代码
  const generateCSS = () => {
    const keyframesCSS = keyframes
      .sort((a, b) => a.percent - b.percent)
      .map(kf => {
        const props = Object.entries(kf.properties)
          .map(([key, value]) => `    ${key}: ${value}`)
          .join(';\n');
        return `  ${kf.percent}% {\n${props}\n  }`;
      })
      .join('\n');

    return `.${animationName} {
  animation: ${animationName} ${duration}s ${timing} ${delay}s ${iteration};
}

@keyframes ${animationName} {
${keyframesCSS}
}`;
  };

  const cssCode = generateCSS();

  // 添加关键帧
  const addKeyframe = () => {
    const newPercent = keyframes.length > 0
      ? Math.min(...keyframes.map(k => k.percent)) + 50
      : 50;

    setKeyframes([
      ...keyframes,
      {
        percent: newPercent,
        properties: {
          transform: 'translateX(0)',
          opacity: 1
        }
      }
    ]);
  };

  // 删除关键帧
  const removeKeyframe = (index: number) => {
    if (keyframes.length <= 2) return;
    setKeyframes(keyframes.filter((_, i) => i !== index));
  };

  // 更新关键帧
  const updateKeyframe = (index: number, field: keyof Keyframe, value: any) => {
    const newKeyframes = [...keyframes];
    if (field === 'properties') {
      newKeyframes[index] = { ...newKeyframes[index], properties: value };
    } else {
      newKeyframes[index] = { ...newKeyframes[index], [field]: value };
    }
    setKeyframes(newKeyframes);
  };

  // 预设动画
  const presets = [
    {
      name: '淡入',
      duration: 1,
      timing: 'ease',
      keyframes: [
        { percent: 0, properties: { opacity: 0 } },
        { percent: 100, properties: { opacity: 1 } }
      ]
    },
    {
      name: '缩放',
      duration: 0.5,
      timing: 'ease',
      keyframes: [
        { percent: 0, properties: { transform: 'scale(0)' } },
        { percent: 100, properties: { transform: 'scale(1)' } }
      ]
    },
    {
      name: '旋转',
      duration: 1,
      timing: 'linear',
      keyframes: [
        { percent: 0, properties: { transform: 'rotate(0deg)' } },
        { percent: 100, properties: { transform: 'rotate(360deg)' } }
      ]
    },
    {
      name: '弹跳',
      duration: 0.5,
      timing: 'ease',
      keyframes: [
        { percent: 0, properties: { transform: 'translateY(0)' } },
        { percent: 50, properties: { transform: 'translateY(-20px)' } },
        { percent: 100, properties: { transform: 'translateY(0)' } }
      ]
    }
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    setDuration(preset.duration);
    setTiming(preset.timing);
    setKeyframes(preset.keyframes);
  };

  return (
    <PluginWindow
      title="CSS动画生成器"
      icon="🎭"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      className="animation-generator-standalone"
      pluginId="animation-generator"
      showStandaloneButton={false}
    >
      <div className={styles.container}>
        {/* 预览 */}
        <div className={styles.previewSection}>
          <div
            className={styles.animatedBox}
            style={{
              animation: `${animationName} ${duration}s ${timing} ${delay}s ${iteration}`
            }}
          >
            预览
          </div>
        </div>

        {/* 动画设置 */}
        <div className={styles.animationSettings}>
          <h3>动画设置</h3>
          <div className={styles.settingsGrid}>
            <div className={styles.setting}>
              <label>名称</label>
              <input
                type="text"
                value={animationName}
                onChange={(e) => setAnimationName(e.target.value.replace(/\s/g, ''))}
                className={styles.input}
              />
            </div>
            <div className={styles.setting}>
              <label>时长: {duration}s</label>
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className={styles.slider}
              />
            </div>
            <div className={styles.setting}>
              <label>缓动</label>
              <select
                value={timing}
                onChange={(e) => setTiming(e.target.value)}
                className={styles.select}
              >
                <option value="ease">ease</option>
                <option value="linear">linear</option>
                <option value="ease-in">ease-in</option>
                <option value="ease-out">ease-out</option>
                <option value="ease-in-out">ease-in-out</option>
              </select>
            </div>
            <div className={styles.setting}>
              <label>延迟: {delay}s</label>
              <input
                type="range"
                min="0"
                max="3"
                step="0.1"
                value={delay}
                onChange={(e) => setDelay(Number(e.target.value))}
                className={styles.slider}
              />
            </div>
            <div className={styles.setting}>
              <label>迭代</label>
              <select
                value={iteration}
                onChange={(e) => setIteration(e.target.value)}
                className={styles.select}
              >
                <option value="infinite">infinite</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
            </div>
          </div>
        </div>

        {/* 关键帧 */}
        <div className={styles.keyframesSection}>
          <div className={styles.keyframesHeader}>
            <h3>关键帧</h3>
            <button onClick={addKeyframe} className={styles.addButton}>
              ➕ 添加
            </button>
          </div>
          <div className={styles.keyframesList}>
            {keyframes.map((keyframe, index) => (
              <div key={index} className={styles.keyframeCard}>
                <div className={styles.keyframeHeader}>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={keyframe.percent}
                    onChange={(e) => updateKeyframe(index, 'percent', Number(e.target.value))}
                    className={styles.percentInput}
                  />
                  <span>%</span>
                  {keyframes.length > 2 && (
                    <button
                      onClick={() => removeKeyframe(index)}
                      className={styles.removeButton}
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div className={styles.keyframeControls}>
                  <div className={styles.control}>
                    <label>transform</label>
                    <input
                      type="text"
                      value={keyframe.properties.transform || ''}
                      onChange={(e) => updateKeyframe(index, 'properties', {
                        ...keyframe.properties,
                        transform: e.target.value
                      })}
                      className={styles.propertyInput}
                    />
                  </div>
                  <div className={styles.control}>
                    <label>opacity</label>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={keyframe.properties.opacity || 1}
                      onChange={(e) => updateKeyframe(index, 'properties', {
                        ...keyframe.properties,
                        opacity: Number(e.target.value)
                      })}
                      className={styles.propertyInput}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 预设 */}
        <div className={styles.presets}>
          <h3>预设动画</h3>
          <div className={styles.presetGrid}>
            {presets.map((preset, index) => (
              <button
                key={index}
                onClick={() => applyPreset(preset)}
                className={styles.presetButton}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* CSS代码 */}
        <div className={styles.codeSection}>
          <h3>CSS代码</h3>
          <div className={styles.codeBlock}>
            <pre>{cssCode}</pre>
            <button
              onClick={() => navigator.clipboard.writeText(cssCode)}
              className={styles.copyButton}
            >
              📋 复制
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ${animationName} {
          ${keyframes
            .sort((a, b) => a.percent - b.percent)
            .map(
              kf => `${kf.percent}% { ${Object.entries(kf.properties)
                .map(([key, value]) => `${key}: ${value}`)
                .join('; ')} }`
            )
            .join('\n  ')}
        }
      `}</style>
    </PluginWindow>
  );
};

export default AnimationGenerator;
