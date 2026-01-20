/**
 * Kanban Board Plugin
 *
 * 拖拽式任务管理工具，支持看板视图
 */

import React, { useState, useCallback, useEffect } from 'react';
import PluginWindow from '../PluginWindow/PluginWindow';
import styles from './KanbanBoard.module.css';

interface KanbanBoardProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

interface Task {
  id: string;
  title: string;
  description: string;
  column: 'todo' | 'doing' | 'done';
  priority: 'low' | 'medium' | 'high';
  tags: string[];
}

interface Column {
  id: 'todo' | 'doing' | 'done';
  title: string;
  tasks: Task[];
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  onClose,
  onMinimize,
  onMaximize,
}) => {
  const [columns, setColumns] = useState<Column[]>([
    { id: 'todo', title: '待办', tasks: [] },
    { id: 'doing', title: '进行中', tasks: [] },
    { id: 'done', title: '已完成', tasks: [] },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    tags: '',
  });
  const [draggedTask, setDraggedTask] = useState<{ taskId: string; sourceColumn: 'todo' | 'doing' | 'done' } | null>(null);

  // 从 localStorage 加载数据
  useEffect(() => {
    const saved = localStorage.getItem('kanban-board-data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setColumns(parsed);
      } catch (err) {
        console.error('Failed to load kanban data:', err);
      }
    }
  }, []);

  // 保存到 localStorage
  useEffect(() => {
    localStorage.setItem('kanban-board-data', JSON.stringify(columns));
  }, [columns]);

  // 添加任务
  const addTask = useCallback(() => {
    if (!newTask.title.trim()) return;

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      column: 'todo',
      priority: newTask.priority,
      tags: newTask.tags ? newTask.tags.split(',').map(t => t.trim()).filter(t => t) : [],
    };

    setColumns(prev => prev.map(col => {
      if (col.id === 'todo') {
        return { ...col, tasks: [...col.tasks, task] };
      }
      return col;
    }));

    setNewTask({ title: '', description: '', priority: 'medium', tags: '' });
    setShowModal(false);
  }, [newTask]);

  // 删除任务
  const deleteTask = useCallback((columnId: 'todo' | 'doing' | 'done', taskId: string) => {
    setColumns(prev => prev.map(col => {
      if (col.id === columnId) {
        return { ...col, tasks: col.tasks.filter(t => t.id !== taskId) };
      }
      return col;
    }));
  }, []);

  // 拖拽开始
  const handleDragStart = useCallback((e: React.DragEvent, taskId: string, columnId: 'todo' | 'doing' | 'done') => {
    setDraggedTask({ taskId, sourceColumn: columnId });
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  // 拖拽结束
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  // 放置任务
  const handleDrop = useCallback((e: React.DragEvent, targetColumnId: 'todo' | 'doing' | 'done') => {
    e.preventDefault();
    if (!draggedTask) return;

    const { taskId, sourceColumn } = draggedTask;

    // 找到任务
    let movedTask: Task | null = null;
    const sourceColumns = columns.map(col => {
      if (col.id === sourceColumn) {
        const task = col.tasks.find(t => t.id === taskId);
        if (task) {
          movedTask = { ...task, column: targetColumnId };
          return { ...col, tasks: col.tasks.filter(t => t.id !== taskId) };
        }
      }
      return col;
    });

    if (!movedTask) return;

    // 添加到目标列
    const targetColumns = sourceColumns.map(col => {
      if (col.id === targetColumnId) {
        return { ...col, tasks: [...col.tasks, movedTask!] };
      }
      return col;
    });

    setColumns(targetColumns);
    setDraggedTask(null);
  }, [draggedTask, columns]);

  // 获取优先级颜色
  const getPriorityColor = useCallback((priority: Task['priority']) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
    }
  }, []);

  return (
    <PluginWindow
      title="任务看板"
      icon="📋"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      className="kanban-board-standalone"
      pluginId="kanban-board"
      showStandaloneButton={false}
    >
      <div className={styles.container}>
        {/* 添加任务按钮 */}
        <div className={styles.header}>
          <button onClick={() => setShowModal(true)} className={styles.addButton}>
            + 添加任务
          </button>
        </div>

        {/* 看板列 */}
        <div className={styles.board}>
          {columns.map(column => (
            <div
              key={column.id}
              className={styles.column}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className={styles.columnHeader}>
                <h3 className={styles.columnTitle}>{column.title}</h3>
                <span className={styles.taskCount}>{column.tasks.length}</span>
              </div>

              <div className={styles.taskList}>
                {column.tasks.map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id, column.id)}
                    className={styles.task}
                  >
                    <div
                      className={styles.priorityBar}
                      style={{ backgroundColor: getPriorityColor(task.priority) }}
                    />

                    <div className={styles.taskContent}>
                      <h4 className={styles.taskTitle}>{task.title}</h4>
                      {task.description && (
                        <p className={styles.taskDescription}>{task.description}</p>
                      )}
                      {task.tags.length > 0 && (
                        <div className={styles.taskTags}>
                          {task.tags.map((tag, index) => (
                            <span key={index} className={styles.tag}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => deleteTask(column.id, task.id)}
                      className={styles.deleteButton}
                      aria-label="删除任务"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 添加任务模态框 */}
        {showModal && (
          <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>新建任务</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className={styles.modalClose}
                >
                  ×
                </button>
              </div>

              <div className={styles.form}>
                <div className={styles.formGroup}>
                  <label>任务标题 *</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="输入任务标题"
                    className={styles.input}
                    autoFocus
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>描述</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="输入任务描述（可选）"
                    className={styles.textarea}
                    rows={3}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>优先级</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'low' | 'medium' | 'high' })}
                    className={styles.select}
                  >
                    <option value="low">低</option>
                    <option value="medium">中</option>
                    <option value="high">高</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>标签（用逗号分隔）</label>
                  <input
                    type="text"
                    value={newTask.tags}
                    onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })}
                    placeholder="例如: 前端, 紧急, Bug"
                    className={styles.input}
                  />
                </div>

                <div className={styles.formActions}>
                  <button
                    onClick={() => setShowModal(false)}
                    className={styles.cancelButton}
                  >
                    取消
                  </button>
                  <button onClick={addTask} className={styles.submitButton}>
                    创建任务
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PluginWindow>
  );
};

export default KanbanBoard;
