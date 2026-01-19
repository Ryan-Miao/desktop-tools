import React, { useState, useEffect, useRef } from 'react';
import { useTodoStore } from '@renderer/components/TodoList/store/useTodoStore';
import { Todo } from '@renderer/components/TodoList/store/useTodoStore';
import DatePicker from '@renderer/components/TodoList/components/Shared/DatePicker';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './TodoEditor.module.css';

interface TodoEditorProps {
  todo?: Todo;
  onSave: (updates: Partial<Todo>) => void;
  onClose: () => void;
}

function TodoEditor({ todo, onSave, onClose }: TodoEditorProps) {
  const [title, setTitle] = useState(todo?.title || '');
  const [description, setDescription] = useState(todo?.description || '');
  const [priority, setPriority] = useState(todo?.priority || 'none');
  const [dueDate, setDueDate] = useState(todo?.dueDate || '');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const subtaskInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus title on mount
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  // Handle save on Ctrl+Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      titleRef.current?.focus();
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate || undefined,
    });
  };

  const handleClose = () => {
    // Check if there are unsaved changes
    const hasChanges =
      title !== (todo?.title || '') ||
      description !== (todo?.description || '') ||
      priority !== (todo?.priority || 'none') ||
      dueDate !== (todo?.dueDate || '');

    if (hasChanges) {
      if (confirm('有未保存的更改，确定要关闭吗？')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  // Add subtask
  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;

    if (todo) {
      const addSubTask = useTodoStore.getState().addSubTask;
      addSubTask(todo.id, newSubtaskTitle.trim());
      setNewSubtaskTitle('');

      // Keep focus on input
      setTimeout(() => {
        subtaskInputRef.current?.focus();
      }, 0);
    }
  };

  const handleSubtaskKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSubtask();
    }
  };

  // Toggle subtask
  const handleToggleSubtask = (subtaskId: string) => {
    if (!todo) return;
    const toggleSubTask = useTodoStore.getState().toggleSubTask;
    toggleSubTask(todo.id, subtaskId);
  };

  // Delete subtask
  const handleDeleteSubtask = (subtaskId: string) => {
    if (!todo) return;
    if (confirm('确定要删除这个子任务吗？')) {
      const deleteSubTask = useTodoStore.getState().deleteSubTask;
      deleteSubTask(todo.id, subtaskId);
    }
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} onKeyDown={handleKeyDown}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>
            {todo ? '编辑任务' : '新建任务'}
          </h2>
          <button
            onClick={handleClose}
            className={styles.closeBtn}
            title="关闭 (Esc)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Title */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              任务标题 <span className={styles.required}>*</span>
            </label>
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入任务标题..."
              className={styles.titleInput}
            />
            {!title.trim() && (
              <span className={styles.error}>请输入任务标题</span>
            )}
          </div>

          {/* Description with Markdown Preview */}
          <div className={styles.fieldGroup}>
            <div className={styles.fieldHeader}>
              <label className={styles.label}>描述</label>
              <button
                type="button"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className={styles.previewToggle}
              >
                {isPreviewMode ? '✏️ 编辑' : '👁️ 预览'}
              </button>
            </div>

            {!isPreviewMode ? (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="添加任务描述... (支持 Markdown 语法)"
                className={styles.descriptionInput}
              />
            ) : (
              <div className={styles.descriptionPreview}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => <p style={{ marginBottom: '0.5em', lineHeight: '1.6' }}>{children}</p>,
                    h1: ({ children }) => <h1 style={{ fontSize: '1.6em', fontWeight: 'bold', marginBottom: '0.5em' }}>{children}</h1>,
                    h2: ({ children }) => <h2 style={{ fontSize: '1.4em', fontWeight: 'bold', marginBottom: '0.5em' }}>{children}</h2>,
                    h3: ({ children }) => <h3 style={{ fontSize: '1.2em', fontWeight: 'bold', marginBottom: '0.5em' }}>{children}</h3>,
                    ul: ({ children }) => <ul style={{ marginLeft: '1.5em', marginBottom: '0.5em' }}>{children}</ul>,
                    ol: ({ children }) => <ol style={{ marginLeft: '1.5em', marginBottom: '0.5em' }}>{children}</ol>,
                    li: ({ children }) => <li style={{ marginBottom: '0.25em' }}>{children}</li>,
                    code: ({ inline, children }) => inline
                      ? <code style={{
                          background: 'rgba(0, 0, 0, 0.05)',
                          padding: '0.2em 0.4em',
                          borderRadius: '3px',
                          fontFamily: 'monospace',
                          fontSize: '0.9em',
                          color: '#e83e8c'
                        }}>{children}</code>
                      : <code style={{
                          display: 'block',
                          background: '#f6f8fa',
                          padding: '1em',
                          borderRadius: '6px',
                          fontFamily: 'monospace',
                          fontSize: '0.85em',
                          overflowX: 'auto',
                          whiteSpace: 'pre-wrap',
                          border: '1px solid #e1e4e8'
                        }}>{children}</code>,
                    blockquote: ({ children }) => <blockquote style={{
                      borderLeft: '4px solid #dfe2e5',
                      paddingLeft: '1em',
                      color: '#6a737d',
                      marginBottom: '0.5em'
                    }}>{children}</blockquote>,
                  }}
                >
                  {description || '*空描述*'}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Options Grid */}
          <div className={styles.optionsGrid}>
            {/* Priority */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>优先级</label>
              <div className={styles.priorityOptions}>
                {(['none', 'low', 'medium', 'high'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`${styles.priorityBtn} ${priority === p ? styles[p] : ''}`}
                  >
                    {p === 'none' && '⚪ 无'}
                    {p === 'low' && '🟢 低'}
                    {p === 'medium' && '🟡 中'}
                    {p === 'high' && '🔴 高'}
                  </button>
                ))}
              </div>
            </div>

            {/* Due Date */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>到期日期</label>
              <DatePicker
                value={dueDate}
                onChange={setDueDate}
                placeholder="选择日期..."
              />
            </div>
          </div>

          {/* Subtasks */}
          {todo && (
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                子任务
                <span className={styles.count}>
                  {todo.subtasks.filter((st) => st.completed).length}/{todo.subtasks.length}
                </span>
              </label>

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
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Subtask */}
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
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.helpText}>
            Ctrl+Enter 保存 • Esc 取消
          </div>
          <div className={styles.actions}>
            <button onClick={handleClose} className={styles.cancelBtn}>
              取消
            </button>
            <button
              onClick={handleSave}
              className={styles.saveBtn}
              disabled={!title.trim()}
            >
              保存任务
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TodoEditor;
