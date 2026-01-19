import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useTodoStore } from '@renderer/components/TodoList/store/useTodoStore';
import { parseNaturalLanguageInput, getParsedPreview } from '@renderer/components/TodoList/utils/naturalLanguageParser';
import DatePicker from '@renderer/components/TodoList/components/Shared/DatePicker';
import styles from './QuickAdd.module.css';

function QuickAdd() {
  const [input, setInput] = useState<string>('');
  const [priority, setPriority] = useState<'none' | 'low' | 'medium' | 'high'>('none');
  const [dueDate, setDueDate] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentView = useTodoStore((state) => state.currentView);
  const addTodo = useTodoStore((state) => state.addTodo);

  // Parse input for natural language
  const parsedPreview = getParsedPreview(input);

  const handleAddTodo = useCallback(() => {
    const inputValue = input; // Capture current input value
    console.log('[QuickAdd] handleAddTodo called:', { inputValue, priority, dueDate, currentView });

    if (!inputValue.trim()) {
      console.log('[QuickAdd] Input is empty, returning');
      return;
    }

    // Parse natural language at the moment of adding
    const parsedData = parseNaturalLanguageInput(inputValue);
    console.log('[QuickAdd] Parsed data:', parsedData);

    // Use natural language parsed data, falling back to manual selections
    const finalPriority = parsedData?.priority || priority;
    const finalDueDate = parsedData?.dueDate || dueDate || undefined;

    // Map category to listId (default to list-inbox)
    let finalListId = 'list-inbox'; // Default to inbox list

    if (parsedData?.category) {
      // Try to find a list with matching name
      const lists = useTodoStore.getState().lists;
      const matchingList = lists.find((l) => l.name === parsedData.category);
      if (matchingList) {
        finalListId = matchingList.id;
      }
    } else if (currentView !== 'inbox' && currentView !== 'today' && currentView !== 'week') {
      // If current view is a custom list, add to that list
      finalListId = currentView;
    }

    const todoData = {
      title: parsedData?.text || inputValue.trim(),
      completed: false,
      priority: finalPriority,
      listId: finalListId,
      dueDate: finalDueDate,
    };

    console.log('[QuickAdd] Adding todo:', todoData);
    addTodo(todoData);

    setInput('');
    setPriority('none');
    setDueDate('');

    // Keep focus on input for quick entry
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }, [input, priority, dueDate, currentView, addTodo]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTodo();
    }
  }, [handleAddTodo]);

  // Auto-show advanced options if user is manually setting options
  useEffect(() => {
    if (priority !== 'none' || dueDate) {
      setShowAdvanced(true);
    }
  }, [priority, dueDate]);

  return (
    <div className={styles.quickAdd}>
      <div className={styles.inputRow}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="输入任务，如: 明天下午3点开会 #工作"
          className={styles.input}
        />

        <button
          onClick={handleAddTodo}
          className={styles.addBtn}
          title="添加任务 (Enter)"
          disabled={!input.trim()}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      {/* Preview tags when typing */}
      {parsedPreview.length > 0 && (
        <div className={styles.preview}>
          {parsedPreview.map((tag, index) => (
            <span key={index} className={styles.previewTag}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Advanced options toggle */}
      <div className={styles.advancedToggle}>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={styles.toggleBtn}
        >
          {showAdvanced ? '▴' : '▸'} 高级选项
        </button>
      </div>

      {showAdvanced && (
        <div className={styles.advancedOptions}>
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

          <DatePicker
            value={dueDate}
            onChange={setDueDate}
            placeholder="📅 到期日期"
          />
        </div>
      )}
    </div>
  );
}

export default QuickAdd;
