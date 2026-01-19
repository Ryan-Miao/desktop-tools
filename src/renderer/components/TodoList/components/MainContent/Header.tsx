import React from 'react';
import { useTodoStore } from '@renderer/components/TodoList/store/useTodoStore';
import SortControls from '@renderer/components/TodoList/components/MainContent/SortControls';
import styles from './Header.module.css';

function Header() {
  const searchQuery = useTodoStore((state) => state.searchQuery);
  const setSearchQuery = useTodoStore((state) => state.setSearchQuery);
  const currentView = useTodoStore((state) => state.currentView);
  const lists = useTodoStore((state) => state.lists);

  const currentList = lists.find((l) => l.id === currentView);

  return (
    <div className={styles.header}>
      <div className={styles.headerLeft}>
        {currentList && (
          <div className={styles.headerTitle}>
            <span className={styles.headerIcon}>{currentList.icon}</span>
            <span>{currentList.name}</span>
          </div>
        )}
      </div>

      <div className={styles.headerRight}>
        <div className={styles.searchBox}>
          <svg
            className={styles.searchIcon}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            placeholder="搜索任务..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={styles.clearSearch}
              aria-label="清除搜索"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        <SortControls />
      </div>
    </div>
  );
}

export default Header;
