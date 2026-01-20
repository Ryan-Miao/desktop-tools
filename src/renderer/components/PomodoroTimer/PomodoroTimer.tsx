/**
 * Pomodoro Timer Plugin
 *
 * 番茄工作法计时器 - 25分钟工作 + 5分钟休息
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import PluginWindow from '../PluginWindow/PluginWindow';
import styles from './PomodoroTimer.module.css';

interface PomodoroTimerProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

interface PomodoroSession {
  type: 'work' | 'break';
  duration: number;
  startTime: number;
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  onClose,
  onMinimize,
  onMaximize,
}) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 音效提醒（使用Web Audio API）
  const playSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = mode === 'work' ? 800 : 600;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (err) {
      console.error('Audio play failed:', err);
    }
  }, [mode]);

  // 计时器逻辑
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // 时间到
            if (mode === 'work') {
              setCompletedPomodoros(prev => prev + 1);
              playSound();
              return 5 * 60; // 5分钟休息
            } else {
              playSound();
              return 25 * 60; // 25分钟工作
            }
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode, playSound]);

  // 格式化时间
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // 开始/暂停
  const toggleTimer = useCallback(() => {
    setIsActive(prev => !prev);
  }, []);

  // 重置
  const reset = useCallback(() => {
    setIsActive(false);
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
  }, [mode]);

  // 跳过
  const skip = useCallback(() => {
    setIsActive(false);
    if (mode === 'work') {
      setMode('break');
      setTimeLeft(5 * 60);
    } else {
      setMode('work');
      setTimeLeft(25 * 60);
    }
  }, [mode]);

  // 手动切换模式
  const switchMode = useCallback((newMode: 'work' | 'break') => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(newMode === 'work' ? 25 * 60 : 5 * 60);
  }, []);

  // 进度百分比
  const progress = useCallback(() => {
    const totalTime = mode === 'work' ? 25 * 60 : 5 * 60;
    return ((totalTime - timeLeft) / totalTime) * 100;
  }, [timeLeft, mode]);

  return (
    <PluginWindow
      title="番茄钟"
      icon="📊"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      className="pomodoro-timer-standalone"
      pluginId="pomodoro-timer"
      showStandaloneButton={false}
    >
      <div className={styles.container}>
        {/* 模式切换 */}
        <div className={styles.modeSwitch}>
          <button
            onClick={() => switchMode('work')}
            className={`${styles.modeButton} ${mode === 'work' ? styles.active : ''}`}
          >
            工作模式
          </button>
          <button
            onClick={() => switchMode('break')}
            className={`${styles.modeButton} ${mode === 'break' ? styles.active : ''}`}
          >
            休息模式
          </button>
        </div>

        {/* 当前任务 */}
        <div className={styles.taskSection}>
          <input
            type="text"
            value={currentTask}
            onChange={(e) => setCurrentTask(e.target.value)}
            placeholder="当前任务（可选）"
            className={styles.taskInput}
          />
        </div>

        {/* 计时器显示 */}
        <div className={styles.timerSection}>
          <div className={styles.timerCircle}>
            <svg className={styles.progressRing} width="280" height="280">
              <circle
                className={styles.progressRingBg}
                cx="140"
                cy="140"
                r="120"
                fill="none"
                strokeWidth="12"
              />
              <circle
                className={styles.progressRingFill}
                cx="140"
                cy="140"
                r="120"
                fill="none"
                strokeWidth="12"
                strokeDasharray={`${2 * Math.PI * 120}`}
                strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress() / 100)}`}
                strokeLinecap="round"
                style={{
                  transform: 'rotate(-90deg)',
                  transformOrigin: '50% 50%',
                  transition: 'stroke-dashoffset 1s linear'
                }}
              />
            </svg>
            <div className={styles.timerContent}>
              <div className={styles.time}>{formatTime(timeLeft)}</div>
              <div className={styles.modeLabel}>
                {mode === 'work' ? '专注时间' : '休息时间'}
              </div>
            </div>
          </div>
        </div>

        {/* 控制按钮 */}
        <div className={styles.controls}>
          <button
            onClick={toggleTimer}
            className={`${styles.controlButton} ${isActive ? styles.active : ''}`}
          >
            {isActive ? '⏸ 暂停' : '▶ 开始'}
          </button>
          <button onClick={reset} className={styles.controlButton}>
            🔄 重置
          </button>
          <button onClick={skip} className={styles.controlButton}>
            ⏭ 跳过
          </button>
        </div>

        {/* 统计信息 */}
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{completedPomodoros}</div>
            <div className={styles.statLabel}>已完成番茄</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{completedPomodoros * 25}</div>
            <div className={styles.statLabel}>专注分钟</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{completedPomodoros * 5}</div>
            <div className={styles.statLabel}>休息分钟</div>
          </div>
        </div>

        {/* 提示信息 */}
        <div className={styles.tips}>
          <p>
            {mode === 'work'
              ? '🍅 保持专注，完成一个番茄钟！'
              : '☕ 休息一下，喝杯水放松一下！'}
          </p>
        </div>
      </div>
    </PluginWindow>
  );
};

export default PomodoroTimer;
