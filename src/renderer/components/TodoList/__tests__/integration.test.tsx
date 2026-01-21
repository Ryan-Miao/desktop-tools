import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTodoStore } from '@renderer/components/TodoList/store/useTodoStore';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

describe('TodoList Integration Tests - Bug Reproduction', () => {
  beforeEach(() => {
    localStorage.clear();
    // Clear todos manually
    act(() => {
      const store = useTodoStore.getState();
      // Clear all todos
      store.todos.forEach(todo => {
        useTodoStore.getState().deleteTodo(todo.id);
      });
    });
  });

  describe('Bug: Tasks not appearing after adding', () => {
    it('should show added todos in filtered results', () => {
      const { result } = renderHook(() => useTodoStore());

      // Initial state
      expect(result.current.todos).toHaveLength(0);
      expect(result.current.currentView).toBe('list-inbox');

      // Get filtered todos (should be empty)
      let filteredTodos = result.current.getFilteredTodos();
      expect(filteredTodos).toHaveLength(0);

      // Add first todo
      act(() => {
        result.current.addTodo({
          title: 'First Task',
          completed: false,
          priority: 'none',
          listId: 'list-inbox',
        });
      });

      // Check it was added to store
      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].title).toBe('First Task');

      // Check it appears in filtered results
      filteredTodos = result.current.getFilteredTodos();
      expect(filteredTodos.length).toBeGreaterThan(0);
      expect(filteredTodos[0].title).toBe('First Task');

      // Add second todo
      act(() => {
        result.current.addTodo({
          title: 'Second Task',
          completed: false,
          priority: 'high',
          listId: 'list-inbox',
        });
      });

      // Check both are in store
      expect(result.current.todos).toHaveLength(2);

      // Check both appear in filtered results
      filteredTodos = result.current.getFilteredTodos();
      expect(filteredTodos).toHaveLength(2);
      expect(filteredTodos[0].title).toBe('Second Task'); // Newest first
      expect(filteredTodos[1].title).toBe('First Task');

      // Add third todo
      act(() => {
        result.current.addTodo({
          title: 'Third Task',
          completed: false,
          priority: 'medium',
          listId: 'list-inbox',
        });
      });

      // Check all three are in store
      expect(result.current.todos).toHaveLength(3);

      // Check all three appear in filtered results
      filteredTodos = result.current.getFilteredTodos();
      expect(filteredTodos).toHaveLength(3);
    });

    it('should show todos when view is inbox', () => {
      const { result } = renderHook(() => useTodoStore());

      // Ensure view is set to inbox
      act(() => {
        result.current.setCurrentView('list-inbox');
      });
      expect(result.current.currentView).toBe('list-inbox');

      // Add a todo to list-inbox
      act(() => {
        result.current.addTodo({
          title: 'Inbox Task',
          completed: false,
          priority: 'none',
          listId: 'list-inbox',
        });
      });

      // Get filtered todos
      const filteredTodos = result.current.getFilteredTodos();

      // Should appear because listId matches the view filter
      expect(filteredTodos).toHaveLength(1);
      expect(filteredTodos[0].title).toBe('Inbox Task');
      expect(filteredTodos[0].listId).toBe('list-inbox');
    });

    it('should track state updates correctly', () => {
      const { result } = renderHook(() => useTodoStore());

      let renderCount = 0;
      let todoCount = 0;

      // Subscribe to store changes
      const unsubscribe = useTodoStore.subscribe((state, prevState) => {
        renderCount++;
        todoCount = state.todos.length;
      });

      // Add first todo
      act(() => {
        result.current.addTodo({
          title: 'Task 1',
          completed: false,
          priority: 'none',
          listId: 'list-inbox',
        });
      });

      expect(todoCount).toBe(1);

      // Add second todo
      act(() => {
        result.current.addTodo({
          title: 'Task 2',
          completed: false,
          priority: 'none',
          listId: 'list-inbox',
        });
      });

      expect(todoCount).toBe(2);

      unsubscribe();
    });

    it('should persist todos in store', () => {
      const { result: firstHook } = renderHook(() => useTodoStore());

      // Add a todo
      act(() => {
        firstHook.current.addTodo({
          title: 'Persistent Task',
          completed: false,
          priority: 'high',
          listId: 'list-inbox',
        });
      });

      expect(firstHook.current.todos).toHaveLength(1);

      // Create a new hook instance (simulating component remount)
      const { result: secondHook } = renderHook(() => useTodoStore());

      // The todo should still be there because it's in the same store
      expect(secondHook.current.todos).toHaveLength(1);
      expect(secondHook.current.todos[0].title).toBe('Persistent Task');
    });
  });
});
