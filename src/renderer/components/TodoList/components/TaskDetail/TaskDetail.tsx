import React, { useEffect, useState } from 'react';
import { useTodoStore } from '@renderer/components/TodoList/store/useTodoStore';
import { Todo } from '@renderer/components/TodoList/store/useTodoStore';
import ActivityTimeline from '../ActivityTimeline';
import TodoEditor from '../TodoEditor';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './TaskDetail.module.css';

interface TaskDetailProps {
  todo: Todo;
  onClose: () => void;
}

function TaskDetail({ todo, onClose }: TaskDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const updateTodo = useTodoStore((state) => state.updateTodo);
  const toggleSubTask = useTodoStore((state) => state.toggleSubTask);
  const deleteTodo = useTodoStore((state) => state.deleteTodo);

  // Handle clicking outside to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

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
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short'
      });
    }
  };

  // Format absolute time
  const formatAbsoluteTime = (timestamp?: string) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Check if overdue
  const isOverdue = () => {
    if (!todo.dueDate || todo.completed) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(todo.dueDate);
    return due < today;
  };

  // Count completed subtasks
  const completedSubtasks = todo.subtasks.filter((st) => st.completed).length;

  // Handle edit button click
  const handleEditClick = () => {
    console.log('Edit button clicked for todo:', todo.id);
    setIsEditing(true);
  };

  if (isEditing) {
    return (
      <TodoEditor
        todo={todo}
        onSave={(updates) => {
          updateTodo(todo.id, updates);
          setIsEditing(false);
        }}
        onClose={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div
      className={styles.container}
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-detail-title"
    >
      {/* Header */}
      <div className={styles.header}>
        <h3 id="task-detail-title" className={styles.headerTitle}>任务详情</h3>
        <div className={styles.headerActions}>
          <button
            className={styles.editBtn}
            onClick={handleEditClick}
            title="编辑任务"
          >
            ✏️ 编辑
          </button>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            title="关闭 (Esc)"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Title */}
        <div className={styles.titleSection}>
          <h2 className={styles.title}>{todo.title}</h2>

          {/* Meta Info */}
          <div className={styles.metaInfo}>
            {/* Priority */}
            {todo.priority !== 'none' && (
              <div className={`${styles.metaItem} ${styles[todo.priority]}`}>
                <span className={styles.metaIcon}>
                  {todo.priority === 'high' && '🔴'}
                  {todo.priority === 'medium' && '🟡'}
                  {todo.priority === 'low' && '🟢'}
                </span>
                <span className={styles.metaText}>
                  {todo.priority === 'high' && '高优先级'}
                  {todo.priority === 'medium' && '中优先级'}
                  {todo.priority === 'low' && '低优先级'}
                </span>
              </div>
            )}

            {/* Due Date */}
            {todo.dueDate && (
              <div className={`${styles.metaItem} ${isOverdue() ? styles.overdue : ''}`}>
                <span className={styles.metaIcon}>📅</span>
                <span className={styles.metaText}>
                  {formatDueDate(todo.dueDate)}
                  {isOverdue() && ' (已逾期)'}
                </span>
              </div>
            )}

            {/* Completion Status */}
            {todo.completed && (
              <div className={`${styles.metaItem} ${styles.completed}`}>
                <span className={styles.metaIcon}>✅</span>
                <span className={styles.metaText}>
                  完成于 {formatAbsoluteTime(todo.completedAt)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {todo.description && (
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>描述</h4>
            <div className={styles.description}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Custom styling for markdown elements
                  p: ({ children }) => <p style={{ marginBottom: '0.5em' }}>{children}</p>,
                  h1: ({ children }) => <h1 style={{ fontSize: '1.5em', fontWeight: 'bold', marginBottom: '0.5em' }}>{children}</h1>,
                  h2: ({ children }) => <h2 style={{ fontSize: '1.3em', fontWeight: 'bold', marginBottom: '0.5em' }}>{children}</h2>,
                  h3: ({ children }) => <h3 style={{ fontSize: '1.1em', fontWeight: 'bold', marginBottom: '0.5em' }}>{children}</h3>,
                  ul: ({ children }) => <ul style={{ marginLeft: '1.5em', marginBottom: '0.5em' }}>{children}</ul>,
                  ol: ({ children }) => <ol style={{ marginLeft: '1.5em', marginBottom: '0.5em' }}>{children}</ol>,
                  li: ({ children }) => <li style={{ marginBottom: '0.25em' }}>{children}</li>,
                  code: ({ inline, children }) => inline
                    ? <code style={{
                        background: 'var(--background)',
                        padding: '0.2em 0.4em',
                        borderRadius: '3px',
                        fontFamily: "'Consolas', 'Monaco', monospace",
                        fontSize: '0.9em'
                      }}>{children}</code>
                    : <code style={{
                        display: 'block',
                        background: 'var(--background)',
                        padding: '1em',
                        borderRadius: 'var(--radius-sm)',
                        fontFamily: "'Consolas', 'Monaco', monospace",
                        fontSize: '0.9em',
                        overflowX: 'auto',
                        whiteSpace: 'pre-wrap'
                      }}>{children}</code>,
                  a: ({ href, children }) => <a href={href} style={{ color: 'var(--primary)', textDecoration: 'underline' }} target="_blank" rel="noopener noreferrer">{children}</a>,
                  blockquote: ({ children }) => <blockquote style={{
                    borderLeft: '3px solid var(--primary)',
                    paddingLeft: '1em',
                    fontStyle: 'italic',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.5em'
                  }}>{children}</blockquote>,
                  hr: () => <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1em 0' }} />,
                  table: ({ children }) => <table style={{
                    borderCollapse: 'collapse',
                    width: '100%',
                    marginBottom: '1em'
                  }}>{children}</table>,
                  th: ({ children }) => <th style={{
                    border: '1px solid var(--border)',
                    padding: '0.5em',
                    background: 'var(--background)',
                    textAlign: 'left'
                  }}>{children}</th>,
                  td: ({ children }) => <td style={{
                    border: '1px solid var(--border)',
                    padding: '0.5em'
                  }}>{children}</td>,
                }}
              >
                {todo.description}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* Subtasks */}
        {todo.subtasks.length > 0 && (
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>
              子任务 ({completedSubtasks}/{todo.subtasks.length})
            </h4>
            <div className={styles.subtasksList}>
              {todo.subtasks.map((subtask) => (
                <div key={subtask.id} className={styles.subtaskItem}>
                  <input
                    type="checkbox"
                    checked={subtask.completed}
                    onChange={() => toggleSubTask(todo.id, subtask.id)}
                    className={styles.subtaskCheckbox}
                  />
                  <span className={`${styles.subtaskTitle} ${subtask.completed ? styles.subtaskCompleted : ''}`}>
                    {subtask.title}
                  </span>
                  {subtask.updatedAt && (
                    <span className={styles.subtaskTime}>
                      {formatAbsoluteTime(subtask.updatedAt)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>时间信息</h4>
          <div className={styles.timestamps}>
            <div className={styles.timestampItem}>
              <span className={styles.timestampLabel}>创建时间:</span>
              <span className={styles.timestampValue}>
                {formatAbsoluteTime(todo.createdAt)}
              </span>
            </div>
            {todo.updatedAt && todo.updatedAt !== todo.createdAt && (
              <div className={styles.timestampItem}>
                <span className={styles.timestampLabel}>最后修改:</span>
                <span className={styles.timestampValue}>
                  {formatAbsoluteTime(todo.updatedAt)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Activity Timeline */}
        {todo.activityHistory && todo.activityHistory.length > 0 && (
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>活动历史</h4>
            <ActivityTimeline activities={todo.activityHistory} maxItems={20} />
          </div>
        )}

        {/* Delete Button */}
        <div className={styles.footer}>
          <button
            className={styles.deleteBtn}
            onClick={() => {
              if (confirm('确定要删除这个任务吗？')) {
                deleteTodo(todo.id);
                onClose();
              }
            }}
          >
            🗑️ 删除任务
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskDetail;
