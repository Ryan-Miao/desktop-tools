/**
 * Pomodoro Timer Plugin
 */

export { default } from './PomodoroTimer';
export const pomodoroTimerManifest = {
  id: 'com.desktop-tool.plugin.pomodoro-timer',
  name: '番茄钟',
  description: '番茄工作法计时器，25分钟工作+5分钟休息，提升专注效率',
  icon: '📊',
  version: '1.0.0',
  author: 'Desktop Tool',
  category: '办公效率',
  entry: './PomodoroTimer',
};
