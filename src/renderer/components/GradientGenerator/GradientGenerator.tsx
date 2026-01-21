/**
 * Gradient Generator Plugin
 *
 * CSS渐变代码生成器
 */

import React, { useState, useEffect } from "react";
import PluginWindow from "../PluginWindow/PluginWindow";
import styles from "./GradientGenerator.module.css";

interface GradientGeneratorProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

interface ColorStop {
  id: string;
  color: string;
  position: number;
}

const GradientGenerator: React.FC<GradientGeneratorProps> = ({
  onClose,
  onMinimize,
  onMaximize,
}) => {
  const [gradientType, setGradientType] = useState<"linear" | "radial">(
    "linear",
  );
  const [direction, setDirection] = useState(90);
  const [colorStops, setColorStops] = useState<ColorStop[]>([
    { id: "1", color: "#667eea", position: 0 },
    { id: "2", color: "#764ba2", position: 100 },
  ]);
  const [cssCode, setCssCode] = useState("");

  // 生成CSS代码
  useEffect(() => {
    if (colorStops.length < 2) return;

    const stops = colorStops
      .sort((a, b) => a.position - b.position)
      .map((stop) => `${stop.color} ${stop.position}%`)
      .join(", ");

    let gradient = "";
    if (gradientType === "linear") {
      gradient = `linear-gradient(${direction}deg, ${stops})`;
    } else {
      gradient = `radial-gradient(circle, ${stops})`;
    }

    setCssCode(`background: ${gradient};`);
  }, [gradientType, direction, colorStops]);

  // 添加颜色点
  const addColorStop = () => {
    const newStop: ColorStop = {
      id: Date.now().toString(),
      color:
        "#" +
        Math.floor(Math.random() * 16777215)
          .toString(16)
          .padStart(6, "0"),
      position: 50,
    };
    setColorStops([...colorStops, newStop]);
  };

  // 删除颜色点
  const removeColorStop = (id: string) => {
    if (colorStops.length <= 2) return;
    setColorStops(colorStops.filter((stop) => stop.id !== id));
  };

  // 更新颜色点
  const updateColorStop = (
    id: string,
    field: keyof ColorStop,
    value: string | number,
  ) => {
    setColorStops(
      colorStops.map((stop) =>
        stop.id === id ? { ...stop, [field]: value } : stop,
      ),
    );
  };

  // 复制CSS代码
  const copyCSS = () => {
    navigator.clipboard.writeText(cssCode);
  };

  // 预设渐变
  const presets = [
    { colors: ["#667eea", "#764ba2"], direction: 135, name: "紫蓝" },
    { colors: ["#f093fb", "#f5576c"], direction: 135, name: "粉红" },
    { colors: ["#4facfe", "#00f2fe"], direction: 90, name: "青蓝" },
    { colors: ["#43e97b", "#38f9d7"], direction: 135, name: "绿色" },
    { colors: ["#fa709a", "#fee140"], direction: 135, name: "暖色" },
    { colors: ["#30cfd0", "#330867"], direction: 135, name: "深蓝" },
  ];

  const applyPreset = (preset: (typeof presets)[0]) => {
    setColorStops([
      { id: "1", color: preset.colors[0] ?? "#000000", position: 0 },
      { id: "2", color: preset.colors[1] ?? "#000000", position: 100 },
    ]);
    setDirection(preset.direction);
  };

  return (
    <PluginWindow
      title="渐变生成器"
      icon="🎨"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      className="gradient-generator-standalone"
      pluginId="gradient-generator"
      showStandaloneButton={false}
    >
      <div className={styles.container}>
        {/* 预览 */}
        <div
          className={styles.preview}
          style={{
            background: cssCode.replace("background: ", "").replace(";", ""),
          }}
        />

        {/* 控制面板 */}
        <div className={styles.controls}>
          <div className={styles.controlGroup}>
            <label>渐变类型</label>
            <div className={styles.buttonGroup}>
              <button
                onClick={() => setGradientType("linear")}
                className={`${styles.typeButton} ${gradientType === "linear" ? styles.active : ""}`}
              >
                线性
              </button>
              <button
                onClick={() => setGradientType("radial")}
                className={`${styles.typeButton} ${gradientType === "radial" ? styles.active : ""}`}
              >
                径向
              </button>
            </div>
          </div>

          {gradientType === "linear" && (
            <div className={styles.controlGroup}>
              <label>方向: {direction}°</label>
              <input
                type="range"
                min="0"
                max="360"
                value={direction}
                onChange={(e) => setDirection(Number(e.target.value))}
                className={styles.slider}
              />
            </div>
          )}

          <div className={styles.controlGroup}>
            <label>颜色点</label>
            <div className={styles.colorStops}>
              {colorStops.map((stop, _index) => (
                <div key={stop.id} className={styles.colorStopRow}>
                  <input
                    type="color"
                    value={stop.color}
                    onChange={(e) =>
                      updateColorStop(stop.id, "color", e.target.value)
                    }
                    className={styles.colorPicker}
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={stop.position}
                    onChange={(e) =>
                      updateColorStop(
                        stop.id,
                        "position",
                        Number(e.target.value),
                      )
                    }
                    className={styles.positionInput}
                  />
                  <span className={styles.percentSign}>%</span>
                  {colorStops.length > 2 && (
                    <button
                      onClick={() => removeColorStop(stop.id)}
                      className={styles.removeButton}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button onClick={addColorStop} className={styles.addButton}>
                ➕ 添加颜色点
              </button>
            </div>
          </div>
        </div>

        {/* 预设 */}
        <div className={styles.presets}>
          <h3>预设渐变</h3>
          <div className={styles.presetGrid}>
            {presets.map((preset, index) => (
              <div
                key={index}
                className={styles.presetItem}
                style={{
                  background: `linear-gradient(${preset.direction}deg, ${preset.colors[0]}, ${preset.colors[1]})`,
                }}
                onClick={() => applyPreset(preset)}
                title={preset.name}
              />
            ))}
          </div>
        </div>

        {/* CSS代码 */}
        <div className={styles.codeSection}>
          <h3>CSS代码</h3>
          <div className={styles.codeBlock}>
            <code>{cssCode}</code>
            <button onClick={copyCSS} className={styles.copyButton}>
              📋 复制
            </button>
          </div>
        </div>
      </div>
    </PluginWindow>
  );
};

export default GradientGenerator;
