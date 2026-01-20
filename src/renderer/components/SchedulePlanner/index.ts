/**
 * Schedule Planner Plugin
 */

export { default } from './SchedulePlanner';
export const schedulePlannerManifest = {
  id: 'com.desktop-tool.plugin.schedule-planner',
  name: '日程安排',
  description: '每日时间规划工具，支持时间段管理和颜色分类',
  icon: '📅',
  version: '1.0.0',
  author: 'Desktop Tool',
  category: '办公效率',
  entry: './SchedulePlanner',
};
