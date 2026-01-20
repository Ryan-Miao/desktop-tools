/**
 * Kanban Board Plugin
 */

export { default } from './KanbanBoard';
export const kanbanBoardManifest = {
  id: 'com.desktop-tool.plugin.kanban-board',
  name: '任务看板',
  description: '拖拽式任务管理工具，支持看板视图、标签和优先级',
  icon: '📋',
  version: '1.0.0',
  author: 'Desktop Tool',
  category: '办公效率',
  entry: './KanbanBoard',
};
