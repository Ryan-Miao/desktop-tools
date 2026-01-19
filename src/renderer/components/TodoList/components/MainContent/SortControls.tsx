import React from 'react';
import { useTodoStore } from '@renderer/components/TodoList/store/useTodoStore';
import styles from './SortControls.module.css';

function SortControls() {
  const sortBy = useTodoStore((state) => state.sortBy);
  const sortOrder = useTodoStore((state) => state.sortOrder);
  const showCompletedAtBottom = useTodoStore((state) => state.showCompletedAtBottom);

  const setSortBy = useTodoStore((state) => state.setSortBy);
  const setSortOrder = useTodoStore((state) => state.setSortOrder);
  const toggleShowCompletedAtBottom = useTodoStore((state) => state.toggleShowCompletedAtBottom);

  return (
    <div className={styles.sortControls}>
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value as any)}
        className={styles.sortSelect}
        title="排序方式"
      >
        <option value="none">默认排序</option>
        <option value="createdAt">创建时间</option>
        <option value="priority">优先级</option>
        <option value="dueDate">到期日期</option>
      </select>

      <button
        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        className={styles.sortOrderButton}
        title={sortOrder === 'asc' ? '升序' : '降序'}
        type="button"
      >
        {sortOrder === 'asc' ? '↑' : '↓'}
      </button>

      <label className={styles.checkboxLabel}>
        <input
          type="checkbox"
          checked={showCompletedAtBottom}
          onChange={toggleShowCompletedAtBottom}
        />
        <span>已完成到底部</span>
      </label>
    </div>
  );
}

export default SortControls;
