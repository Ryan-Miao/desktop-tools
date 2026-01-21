/**
 * Ruler Plugin
 *
 * Screen measurement tool with pixel-level precision
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import PluginWindow from "../PluginWindow/PluginWindow";
import styles from "./Ruler.module.css";

interface Point {
  x: number;
  y: number;
}

interface RulerProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

const Ruler: React.FC<RulerProps> = ({ onClose, onMinimize, onMaximize }) => {
  const [isHorizontal, setIsHorizontal] = useState(true);
  const [length, setLength] = useState(300);
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [mousePos, setMousePos] = useState<Point>({ x: 0, y: 0 });
  const rulerRef = useRef<HTMLDivElement>(null);

  // Update mouse position for magnifier
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    if (showMagnifier) {
      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }
    return undefined;
  }, [showMagnifier]);

  // Calculate distance between two points
  const calculateDistance = useCallback((p1: Point, p2: Point): number => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // Toggle orientation
  const toggleOrientation = useCallback(() => {
    setIsHorizontal((prev) => !prev);
  }, []);

  // Increase length
  const increaseLength = useCallback(() => {
    setLength((prev) => Math.min(prev + 50, 2000));
  }, []);

  // Decrease length
  const decreaseLength = useCallback(() => {
    setLength((prev) => Math.max(prev - 50, 100));
  }, []);

  // Reset to default
  const resetLength = useCallback(() => {
    setLength(300);
  }, []);

  // Generate ruler marks
  const generateMarks = useCallback(() => {
    const marks = [];
    const majorInterval = 100; // Every 100px
    const mediumInterval = 50; // Every 50px
    const minorInterval = 10; // Every 10px

    for (let i = 0; i <= length; i += minorInterval) {
      let markType: "major" | "medium" | "minor" = "minor";
      if (i % majorInterval === 0) {
        markType = "major";
      } else if (i % mediumInterval === 0) {
        markType = "medium";
      }

      marks.push({ position: i, type: markType });
    }

    return marks;
  }, [length]);

  const marks = generateMarks();

  // Copy length to clipboard
  const copyLength = useCallback(() => {
    navigator.clipboard.writeText(`${length}px`);
    announceToScreenReader(`已复制标尺长度: ${length}px`);
  }, [length]);

  return (
    <PluginWindow
      title="屏幕标尺"
      icon="📏"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      className="ruler-standalone"
      pluginId="ruler"
      showStandaloneButton={false}
    >
      <div className={styles.ruler}>
        {/* Controls */}
        <div className={styles.controls}>
          <div className={styles.controlGroup}>
            <label>方向</label>
            <div className={styles.buttonGroup}>
              <button
                onClick={() => setIsHorizontal(true)}
                className={`${styles.controlButton} ${isHorizontal ? styles.active : ""}`}
                aria-label="水平方向"
                aria-pressed={isHorizontal}
              >
                ↔️ 水平
              </button>
              <button
                onClick={() => setIsHorizontal(false)}
                className={`${styles.controlButton} ${!isHorizontal ? styles.active : ""}`}
                aria-label="垂直方向"
                aria-pressed={!isHorizontal}
              >
                ↕️ 垂直
              </button>
            </div>
          </div>

          <div className={styles.controlGroup}>
            <label>长度: {length}px</label>
            <div className={styles.buttonGroup}>
              <button
                onClick={decreaseLength}
                className={styles.controlButton}
                aria-label="减少长度"
                disabled={length <= 100}
              >
                ➖
              </button>
              <button
                onClick={resetLength}
                className={styles.controlButton}
                aria-label="重置长度"
              >
                🔄
              </button>
              <button
                onClick={increaseLength}
                className={styles.controlButton}
                aria-label="增加长度"
                disabled={length >= 2000}
              >
                ➕
              </button>
            </div>
          </div>

          <div className={styles.controlGroup}>
            <label>工具</label>
            <div className={styles.buttonGroup}>
              <button
                onClick={() => setShowMagnifier(!showMagnifier)}
                className={`${styles.controlButton} ${showMagnifier ? styles.active : ""}`}
                aria-label="切换放大镜"
                aria-pressed={showMagnifier}
              >
                🔍 放大镜
              </button>
              <button
                onClick={copyLength}
                className={styles.controlButton}
                aria-label={`复制长度 ${length}px`}
              >
                📋 复制
              </button>
            </div>
          </div>
        </div>

        {/* Ruler Display */}
        <div className={styles.rulerContainer}>
          <div
            ref={rulerRef}
            className={`${styles.rulerDisplay} ${isHorizontal ? styles.horizontal : styles.vertical}`}
            style={
              isHorizontal
                ? { width: `${length}px` }
                : { height: `${length}px` }
            }
          >
            {/* Marks */}
            <div className={styles.marksContainer}>
              {marks.map((mark) => (
                <div
                  key={mark.position}
                  className={`${styles.mark} ${styles[mark.type]}`}
                  style={
                    isHorizontal
                      ? { left: `${mark.position}px` }
                      : { top: `${mark.position}px` }
                  }
                >
                  {mark.type === "major" && (
                    <span className={styles.markLabel}>{mark.position}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Zero indicator */}
            <div className={styles.zeroIndicator}>0</div>
          </div>

          {/* Reference Grid */}
          <div className={styles.referenceGrid}>
            <div className={styles.gridInfo}>
              <div className={styles.gridItem}>
                <span className={styles.gridLabel}>方向</span>
                <span className={styles.gridValue}>
                  {isHorizontal ? "水平" : "垂直"}
                </span>
              </div>
              <div className={styles.gridItem}>
                <span className={styles.gridLabel}>长度</span>
                <span className={styles.gridValue}>{length}px</span>
              </div>
              <div className={styles.gridItem}>
                <span className={styles.gridLabel}>刻度</span>
                <span className={styles.gridValue}>10px</span>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className={styles.instructions}>
          <h3>使用说明</h3>
          <ul>
            <li>点击"水平"或"垂直"切换标尺方向</li>
            <li>使用➕➖按钮调整标尺长度（100px - 2000px）</li>
            <li>启用"放大镜"查看屏幕细节</li>
            <li>主刻度间隔100px，中刻度50px，小刻度10px</li>
            <li>点击"复制"按钮复制当前长度</li>
          </ul>
        </div>

        {/* Magnifier */}
        {showMagnifier && (
          <div
            className={styles.magnifier}
            style={{
              left: `${mousePos.x + 15}px`,
              top: `${mousePos.y + 15}px`,
            }}
          >
            <div className={styles.magnifierContent}>
              <div className={styles.magnifierGrid}>
                {/* 5x5 grid for pixel precision */}
                {Array.from({ length: 25 }).map((_, i) => (
                  <div key={i} className={styles.pixel}>
                    {i}
                  </div>
                ))}
              </div>
              <div className={styles.magnifierInfo}>
                <span>X: {mousePos.x}</span>
                <span>Y: {mousePos.y}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </PluginWindow>
  );
};

// Screen reader announcement helper
function announceToScreenReader(message: string) {
  const announcement = document.createElement("div");
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", "polite");
  announcement.className = "sr-only";
  announcement.style.position = "absolute";
  announcement.style.left = "-10000px";
  announcement.style.width = "1px";
  announcement.style.height = "1px";
  announcement.style.overflow = "hidden";
  announcement.textContent = message;
  document.body.appendChild(announcement);
  setTimeout(() => document.body.removeChild(announcement), 1000);
}

export default Ruler;
