import React from 'react';
import { createLogger } from '../../shared/logger';
import { PluginManifest } from '../../shared/types/plugin';
import PluginWindow from './PluginWindow/PluginWindow';
import TodoListComponent from './TodoList/index';

const logger = createLogger('TodoList');

export const todoListManifest: PluginManifest = {
  id: 'todo-list',
  name: '滴答清单',
  version: '2.0.0',
  description: 'TickTick风格的待办清单应用',
  author: 'Claude',
  icon: '✅',
  entry: 'todo-list',
  permissions: [],
};

interface TodoListProps {
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

function TodoList({ onClose, onMinimize, onMaximize }: TodoListProps) {
  return (
    <PluginWindow
      title="滴答清单"
      onClose={onClose || (() => {})}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
    >
      <TodoListComponent />
    </PluginWindow>
  );
}

export default TodoList;
