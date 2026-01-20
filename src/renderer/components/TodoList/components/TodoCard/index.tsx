import React, { useState } from 'react';
import { useTodoStore } from '@renderer/components/TodoList/store/useTodoStore';
import { Todo } from '@renderer/components/TodoList/store/useTodoStore';
import styles from './TodoCard.module.css';

interface TodoCardProps {
  todo: Todo;
  onClick: (todoId: string) => void;
  isSelected: boolean;
}

function TodoCard({ todo, onClick, isSelected }: TodoCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleTodo = useTodoStore((state) => state.toggleTodo);
  const toggleSubTask = useTodoStore((state) => state.toggleSubTask);
  const deleteTodo = useTodoStore((state) => state.deleteTodo);

  // Check if overdue
  const isOverdue = () => {
    if (!todo.dueDate || todo.completed) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(todo.dueDate);
    return due < today;
  };

  // Format due date
  const formatDueDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return '今天';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return '明天';
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }
  };

  // Count completed subtasks
  const completedSubtasks = todo.subtasks.filter((st) => st.completed).length;
  const hasSubtasks = todo.subtasks.length > 0;

  // Format relative time for recent activity
  const formatRelativeTime = (timestamp?: string): string => {
    if (!timestamp) return '';

    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays}天前`;

    return time.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  // Get most recent activity
  const getRecentActivity = () => {
    if (!todo.activityHistory || todo.activityHistory.length === 0) {
      return null;
    }

    const sortedActivities = [...todo.activityHistory].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return sortedActivities[0];
  };

  const recentActivity = getRecentActivity();

  // Handle click to view details
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open details if clicking on checkbox, delete button, or expand button
    if ((e.target as HTMLElement).closest('input[type="checkbox"]') ||
        (e.target as HTMLElement).closest('button')) {
      return;
    }
    onClick(todo.id);
  };

  return (
    <div
      className={`${styles.todoCard} ${todo.completed ? styles.completed : ''} ${isOverdue() ? styles.overdue : ''} ${isSelected ? styles.selected : ''}`}
      onClick={handleCardClick}
    >
      {/* Checkbox */}
      <div className={styles.checkbox}>
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={(e) => {
            e.stopPropagation();
            toggleTodo(todo.id);
          }}
        />
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Title */}
        <div className={styles.title}>{todo.title}</div>

        {/* Description */}
        {todo.description && (
          <div className={styles.description}>{todo.description}</div>
        )}

        {/* Subtasks Info */}
        {hasSubtasks && (
          <div className={styles.subtasksInfo}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            <span>{completedSubtasks}/{todo.subtasks.length}</span>
          </div>
        )}

        {/* Recent Activity */}
        {recentActivity && (
          <div className={styles.recentActivity}>
            <span className={styles.activityDot}>•</span>
            <span className={styles.activityText}>
              {recentActivity.description} · {formatRelativeTime(recentActivity.timestamp)}
            </span>
          </div>
        )}

        {/* Expand button for subtasks */}
        {hasSubtasks && (
          <button
            className={styles.expandBtn}
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? '▴' : '▾'}
          </button>
        )}
      </div>

      {/* Right Side: Badges & Actions */}
      <div className={styles.rightSide}>
        {/* Priority Badge */}
        {todo.priority !== 'none' && (
          <div className={`${styles.priorityBadge} ${styles[todo.priority]}`}>
            {todo.priority === 'high' && '🔴'}
            {todo.priority === 'medium' && '🟡'}
            {todo.priority === 'low' && '🟢'}
          </div>
        )}

        {/* Due Date Badge */}
        {todo.dueDate && (
          <div className={`${styles.dueDateBadge} ${isOverdue() ? styles.overdue : ''}`}>
            📅 {formatDueDate(todo.dueDate)}
          </div>
        )}

        {/* Delete Button */}
        <button
          className={styles.deleteBtn}
          onClick={(e) => {
            e.stopPropagation();
            if (confirm('确定要删除这个任务吗？')) {
              deleteTodo(todo.id);
            }
          }}
          title="删除任务"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>

      {/* Expanded Subtasks */}
      {isExpanded && hasSubtasks && (
        <div className={styles.subtasksList}>
          {todo.subtasks.map((subtask) => (
            <div key={subtask.id} className={styles.subtaskItem}>
              <input
                type="checkbox"
                checked={subtask.completed}
                onChange={() => toggleSubTask(todo.id, subtask.id)}
                onClick={(e) => e.stopPropagation()}
              />
              <span className={`${styles.subtaskTitle} ${subtask.completed ? styles.subtaskCompleted : ''}`}>
                {subtask.title}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders
// Only re-render when critical todo properties change
const TodoCardMemo = React.memo(TodoCard, (prevProps, nextProps) => {
  // Return true if props are equal (should not re-render)
  return (
    prevProps.todo.id === nextProps.todo.id &&
    prevProps.todo.title === nextProps.todo.title &&
    prevProps.todo.completed === nextProps.todo.completed &&
    prevProps.todo.priority === nextProps.todo.priority &&
    prevProps.todo.dueDate === nextProps.todo.dueDate &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.todo.activityHistory?.length === nextProps.todo.activityHistory?.length &&
    prevProps.todo.subtasks.length === nextProps.todo.subtasks.length
  );
});

TodoCardMemo.displayName = 'TodoCard';

export default TodoCardMemo;
