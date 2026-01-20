/**
 * Goal Tracker Plugin
 */

export { default } from './GoalTracker';
export const goalTrackerManifest = {
  id: 'com.desktop-tool.plugin.goal-tracker',
  name: '目标追踪',
  description: '设定和追踪长期目标，支持里程碑管理和进度可视化',
  icon: '🎯',
  version: '1.0.0',
  author: 'Desktop Tool',
  category: '办公效率',
  entry: './GoalTracker',
};
