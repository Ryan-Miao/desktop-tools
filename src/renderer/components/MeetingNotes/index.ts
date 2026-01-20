/**
 * Meeting Notes Plugin
 */

export { default } from './MeetingNotes';
export const meetingNotesManifest = {
  id: 'com.desktop-tool.plugin.meeting-notes',
  name: '会议记录',
  description: '结构化会议记录工具，支持议程、参会人员和行动项管理',
  icon: '🗒️',
  version: '1.0.0',
  author: 'Desktop Tool',
  category: '办公效率',
  entry: './MeetingNotes',
};
