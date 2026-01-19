import React, { useEffect } from 'react';
import { useTodoStore } from '@renderer/components/TodoList/store/useTodoStore';
import './styles/global.css';

// Placeholder components - will implement in detail
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';

function TodoList() {
  const initialize = useTodoStore((state) => state.initialize);

  // Initialize file storage on mount (will auto-migrate from localStorage if needed)
  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <div className="todoListContainer">
      {/* Sidebar - 240px fixed width */}
      <Sidebar />

      {/* Main Content - flex-1 */}
      <MainContent />
    </div>
  );
}

export default TodoList;
