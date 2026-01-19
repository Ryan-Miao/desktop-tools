import React, { useState, useEffect, useRef } from 'react';
import { useTodoStore } from '@renderer/components/TodoList/store/useTodoStore';
import { Todo } from '@renderer/components/TodoList/store/useTodoStore';
import DatePicker from '@renderer/components/TodoList/components/Shared/DatePicker';
import styles from './InlineEditor.module.css';

interface InlineEditorProps {
  todo: Todo;
  onSave: (updates: Partial<Todo>) => void;
  onCancel: () => void;
}

function InlineEditor({ todo, onSave, onCancel }: InlineEditorProps) {
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description || '');
  const [priority, setPriority] = useState(todo.priority);
  const [dueDate, setDueDate] = useState(todo.dueDate || '');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const titleRef = useRef<HTMLInputElement>(null);
  const subtaskInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus title on mount
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  // Handle save on Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleSave = () => {
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate || undefined,
    });
  };

  const handleCancel = () => {
    onCancel();
  };

  // Add subtask
  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;

    const addSubTask = useTodoStore.getState().addSubTask;
    addSubTask(todo.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');

    // Keep focus on input
    setTimeout(() => {
      subtaskInputRef.current?.focus();
    }, 0);
  };

  const handleSubtaskKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSubtask();
    }
  };

  // Toggle subtask
  const handleToggleSubtask = (subtaskId: string) => {
    const toggleSubTask = useTodoStore.getState().toggleSubTask;
    toggleSubTask(todo.id, subtaskId);
  };

  // Delete subtask
  const handleDeleteSubtask = (subtaskId: string) => {
    const deleteSubTask = useTodoStore.getState().deleteSubTask;
    deleteSubTask(todo.id, subtaskId);
  };

  return (
    <div className={styles.inlineEditor}>
      {/* Title Input */}
      <input
        ref={titleRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="任务标题"
        className={styles.titleInput}
      />

      {/* Description Input */}
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="添加描述..."
        className={styles.descriptionInput}
        rows={2}
      />

      {/* Options Row */}
      <div className={styles.optionsRow}>
        {/* Priority Select */}
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as 'none' | 'low' | 'medium' | 'high')}
          className={styles.select}
        >
          <option value="none">优先级</option>
          <option value="low">🟢 低</option>
          <option value="medium">🟡 中</option>
          <option value="high">🔴 高</option>
        </select>

        {/* Due Date Input */}
        <DatePicker
          value={dueDate}
          onChange={setDueDate}
          placeholder="📅 到期日期"
        />
      </div>

      {/* Subtasks Section */}
      <div className={styles.subtasksSection}>
        <div className={styles.subtasksHeader}>
          <span className={styles.subtasksTitle}>子任务</span>
          <span className={styles.subtasksCount}>
            {todo.subtasks.filter((st) => st.completed).length}/{todo.subtasks.length}
          </span>
        </div>

        {/* Existing Subtasks */}
        {todo.subtasks.length > 0 && (
          <div className={styles.subtasksList}>
            {todo.subtasks.map((subtask) => (
              <div key={subtask.id} className={styles.subtaskItem}>
                <input
                  type="checkbox"
                  checked={subtask.completed}
                  onChange={() => handleToggleSubtask(subtask.id)}
                  className={styles.subtaskCheckbox}
                />
                <span className={`${styles.subtaskTitle} ${subtask.completed ? styles.completed : ''}`}>
                  {subtask.title}
                </span>
                <button
                  onClick={() => handleDeleteSubtask(subtask.id)}
                  className={styles.subtaskDelete}
                  title="删除子任务"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Subtask Input */}
        <div className={styles.addSubtaskRow}>
          <input
            ref={subtaskInputRef}
            type="text"
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            onKeyDown={handleSubtaskKeyDown}
            placeholder="+ 添加子任务"
            className={styles.addSubtaskInput}
          />
          <button
            onClick={handleAddSubtask}
            className={styles.addSubtaskBtn}
            disabled={!newSubtaskTitle.trim()}
          >
            添加
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={styles.actionsRow}>
        <button onClick={handleCancel} className={styles.cancelBtn}>
          取消
        </button>
        <button onClick={handleSave} className={styles.saveBtn} disabled={!title.trim()}>
          保存
        </button>
      </div>

      {/* Help Text */}
      <div className={styles.helpText}>
        Enter 保存 • Esc 取消
      </div>
    </div>
  );
}

export default InlineEditor;
