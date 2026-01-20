/**
 * Stopwatch/Timer Plugin
 *
 * Multi-functional time tracking tool
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import PluginWindow from '../PluginWindow/PluginWindow';
import styles from './Stopwatch.module.css';

type Mode = 'stopwatch' | 'timer' | 'interval';

interface Interval {
  id: string;
  duration: number;
  remaining: number;
  isActive: boolean;
}

interface StopwatchProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

const Stopwatch: React.FC<StopwatchProps> = ({ onClose, onMinimize, onMaximize }) => {
  const [mode, setMode] = useState<Mode>('stopwatch');

  // Stopwatch state
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);

  // Timer state
  const [timerDuration, setTimerDuration] = useState(5 * 60); // 5 minutes default
  const [timerRemaining, setTimerRemaining] = useState(5 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerInputMinutes, setTimerInputMinutes] = useState('5');
  const [timerInputSeconds, setTimerInputSeconds] = useState('0');

  // Interval timer state
  const [intervals, setIntervals] = useState<Interval[]>([]);
  const [currentIntervalIndex, setCurrentIntervalIndex] = useState<number>(-1);

  const stopwatchRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Create audio for alarm
  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,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');

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Play alarm sound
  const playAlarm = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);
    }
  }, []);

  // Format time
  const formatTime = useCallback((seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, []);

  // Stopwatch functions
  const startStopwatch = useCallback(() => {
    setStopwatchRunning(true);
  }, []);

  const pauseStopwatch = useCallback(() => {
    setStopwatchRunning(false);
  }, []);

  const resetStopwatch = useCallback(() => {
    setStopwatchRunning(false);
    setStopwatchTime(0);
    setLaps([]);
  }, []);

  const addLap = useCallback(() => {
    if (stopwatchTime > 0) {
      setLaps(prev => [stopwatchTime, ...prev]);
    }
  }, [stopwatchTime]);

  // Timer functions
  const startTimer = useCallback(() => {
    if (timerRemaining > 0) {
      setTimerRunning(true);
    }
  }, [timerRemaining]);

  const pauseTimer = useCallback(() => {
    setTimerRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    setTimerRunning(false);
    const totalSeconds =
      parseInt(timerInputMinutes) * 60 + parseInt(timerInputSeconds);
    setTimerDuration(totalSeconds);
    setTimerRemaining(totalSeconds);
  }, [timerInputMinutes, timerInputSeconds]);

  // Stopwatch effect
  useEffect(() => {
    if (stopwatchRunning) {
      stopwatchRef.current = window.setInterval(() => {
        setStopwatchTime(prev => prev + 1);
      }, 1000);
    } else {
      if (stopwatchRef.current) {
        clearInterval(stopwatchRef.current);
        stopwatchRef.current = null;
      }
    }

    return () => {
      if (stopwatchRef.current) {
        clearInterval(stopwatchRef.current);
      }
    };
  }, [stopwatchRunning]);

  // Timer effect
  useEffect(() => {
    if (timerRunning && timerRemaining > 0) {
      timerRef.current = window.setInterval(() => {
        setTimerRemaining(prev => {
          if (prev <= 1) {
            setTimerRunning(false);
            playAlarm();
            announceToScreenReader('计时器结束');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerRunning, timerRemaining, playAlarm]);

  return (
    <PluginWindow
      title="秒表/计时器"
      icon="⏱️"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      className="stopwatch-standalone"
      pluginId="stopwatch"
      showStandaloneButton={false}
    >
      <div className={styles.stopwatch}>
        {/* Mode Selector */}
        <div className={styles.modeSelector}>
          <button
            onClick={() => setMode('stopwatch')}
            className={`${styles.modeButton} ${mode === 'stopwatch' ? styles.active : ''}`}
            aria-label="秒表模式"
            aria-pressed={mode === 'stopwatch'}
          >
            ⏱️ 秒表
          </button>
          <button
            onClick={() => setMode('timer')}
            className={`${styles.modeButton} ${mode === 'timer' ? styles.active : ''}`}
            aria-label="计时器模式"
            aria-pressed={mode === 'timer'}
          >
            ⏰ 计时器
          </button>
        </div>

        {/* Stopwatch Mode */}
        {mode === 'stopwatch' && (
          <div className={styles.modeContent}>
            <div className={styles.timeDisplay}>{formatTime(stopwatchTime)}</div>

            <div className={styles.controls}>
              {!stopwatchRunning ? (
                <button
                  onClick={startStopwatch}
                  className={styles.startButton}
                  aria-label="开始秒表"
                >
                  ▶️ 开始
                </button>
              ) : (
                <button
                  onClick={pauseStopwatch}
                  className={styles.pauseButton}
                  aria-label="暂停秒表"
                >
                  ⏸️ 暂停
                </button>
              )}
              <button
                onClick={addLap}
                className={styles.lapButton}
                disabled={!stopwatchRunning && stopwatchTime === 0}
                aria-label="记录计次"
              >
                🏁 计次
              </button>
              <button
                onClick={resetStopwatch}
                className={styles.resetButton}
                aria-label="重置秒表"
              >
                🔄 重置
              </button>
            </div>

            {laps.length > 0 && (
              <div className={styles.laps}>
                <h3>计次记录</h3>
                <div className={styles.lapsList}>
                  {laps.map((lap, index) => (
                    <div key={index} className={styles.lapItem}>
                      <span className={styles.lapNumber}>
                        #{laps.length - index}
                      </span>
                      <span className={styles.lapTime}>{formatTime(lap)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Timer Mode */}
        {mode === 'timer' && (
          <div className={styles.modeContent}>
            <div
              className={`${styles.timeDisplay} ${
                timerRemaining === 0 ? styles.timeUp : ''
              }`}
            >
              {formatTime(timerRemaining)}
            </div>

            {!timerRunning && timerRemaining === timerDuration && (
              <div className={styles.timerInput}>
                <div className={styles.inputGroup}>
                  <label>分钟</label>
                  <input
                    type="number"
                    min="0"
                    max="999"
                    value={timerInputMinutes}
                    onChange={e => setTimerInputMinutes(e.target.value)}
                    className={styles.input}
                  />
                </div>
                <span className={styles.separator}>:</span>
                <div className={styles.inputGroup}>
                  <label>秒</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={timerInputSeconds}
                    onChange={e => setTimerInputSeconds(e.target.value)}
                    className={styles.input}
                  />
                </div>
              </div>
            )}

            <div className={styles.controls}>
              {!timerRunning && timerRemaining > 0 ? (
                <button
                  onClick={startTimer}
                  className={styles.startButton}
                  aria-label="开始计时"
                >
                  ▶️ 开始
                </button>
              ) : timerRunning ? (
                <button
                  onClick={pauseTimer}
                  className={styles.pauseButton}
                  aria-label="暂停计时"
                >
                  ⏸️ 暂停
                </button>
              ) : (
                <button
                  onClick={resetTimer}
                  className={styles.resetButton}
                  aria-label="重置计时器"
                >
                  🔄 重置
                </button>
              )}
            </div>

            {/* Progress bar */}
            {timerDuration > 0 && (
              <div className={styles.progressContainer}>
                <div
                  className={styles.progressBar}
                  style={{
                    width: `${(timerRemaining / timerDuration) * 100}%`,
                  }}
                />
              </div>
            )}
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

export default Stopwatch;
