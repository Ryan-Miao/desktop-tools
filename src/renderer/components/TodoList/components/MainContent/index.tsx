import React, { useState } from 'react';
import { useTodoStore } from '@renderer/components/TodoList/store/useTodoStore';
import styles from './MainContent.module.css';

import Header from './Header';
import QuickAdd from './QuickAdd';
import TodoCard from '../TodoCard';
import TaskDetail from '../TaskDetail';
import EmptyState from '../EmptyState';

function MainContent() {
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null);

  const getFilteredTodos = useTodoStore((state) => state.getFilteredTodos);
  const currentView = useTodoStore((state) => state.currentView);
  const todos = useTodoStore((state) => state.todos);
  const searchQuery = useTodoStore((state) => state.searchQuery);
  const lists = useTodoStore((state) => state.lists);

  // Subscribe to sort settings to trigger re-render when they change
  // These variables are intentionally unused - we only need to subscribe to state changes
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const sortBy = useTodoStore((state) => state.sortBy);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const sortOrder = useTodoStore((state) => state.sortOrder);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const showCompletedAtBottom = useTodoStore((state) => state.showCompletedAtBottom);

  // Get filtered todos (will use latest state)
  const filteredTodos = getFilteredTodos();
  const currentList = lists.find((l) => l.id === currentView);

  // Get selected todo
  const selectedTodo = todos.find(t => t.id === selectedTodoId);

  // Determine empty state type
  const getEmptyStateType = () => {
    if (searchQuery) return 'search';
    if (currentView === 'inbox') return 'inbox';
    if (currentView === 'today') return 'today';
    if (currentView === 'week') return 'week';
    return 'list';
  };

  // Handle task click
  const handleTaskClick = (todoId: string) => {
    setSelectedTodoId(todoId);
  };

  // Close detail panel
  const handleCloseDetail = () => {
    setSelectedTodoId(null);
  };

  return (
    <>
      <div className={styles.mainContent}>
        {/* Header with Search */}
        <Header />

        {/* Todo List Area */}
        <div className={styles.todoListArea}>
          {filteredTodos.length === 0 ? (
            <EmptyState
              type={getEmptyStateType()}
              listName={currentList?.name}
            />
          ) : (
            <div className={styles.todoList}>
              {filteredTodos.map((todo) => (
                <TodoCard
                  key={todo.id}
                  todo={todo}
                  onClick={handleTaskClick}
                  isSelected={selectedTodoId === todo.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick Add Bar at Bottom */}
        <QuickAdd />
      </div>

      {/* Task Detail Panel */}
      {selectedTodo && (
        <>
          <div
            className={styles.overlay}
            onClick={handleCloseDetail}
          />
          <TaskDetail
            todo={selectedTodo}
            onClose={handleCloseDetail}
          />
        </>
      )}
    </>
  );
}

export default MainContent;
