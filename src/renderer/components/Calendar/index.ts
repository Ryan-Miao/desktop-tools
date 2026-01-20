/**
 * Calendar Plugin
 */

export { default } from './Calendar';
export const calendarManifest = {
  id: 'com.desktop-tool.plugin.calendar',
  name: 'Calendar',
  description: '日程管理工具，支持事件创建、编辑、提醒和月视图显示',
  icon: '📅',
  version: '1.0.0',
  author: 'Desktop Tool',
  category: 'productivity',
  entry: './Calendar',
};
