import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, renderHook, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuickAdd from '../QuickAdd';
import { useTodoStore } from '@renderer/components/TodoList/store/useTodoStore';

// Mock the natural language parser
vi.mock('@renderer/components/TodoList/utils/naturalLanguageParser', () => ({
  parseNaturalLanguageInput: (input: string) => {
    if (input.includes('明天')) {
      // Remove "明天" and hashtags (including Chinese characters)
      const text = input.replace(/明天/g, '').replace(/#\S+/g, '').trim();
      const categoryMatch = input.match(/#(\S+)/);
      return {
        text: text || input,
        priority: 'none' as const,
        dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        category: categoryMatch ? categoryMatch[1] : undefined,
      };
    }
    return {
      text: input,
      priority: 'none' as const,
    };
  },
  getParsedPreview: (input: string) => {
    const tags: string[] = [];
    if (input.includes('明天')) tags.push('明天');
    const categoryMatch = input.match(/#(\S+)/);
    if (categoryMatch) tags.push(categoryMatch[1]);
    return tags;
  },
}));

describe('QuickAdd Component', () => {
  beforeEach(() => {
    // Reset the store before each test
    const store = useTodoStore.getState();
    // Clear todos
    store.todos = [];
    store.currentView = 'inbox';
    store.searchQuery = '';
  });

  it('should render input field and add button', () => {
    render(<QuickAdd />);

    const input = screen.getByPlaceholderText(/输入任务/);
    const addButton = screen.getAllByRole('button')[0]; // First button is the add button

    expect(input).toBeInTheDocument();
    expect(addButton).toBeInTheDocument();
  });

  it('should add a simple todo on Enter key', async () => {
    const user = userEvent.setup();
    render(<QuickAdd />);

    const input = screen.getByPlaceholderText(/输入任务/);

    await user.type(input, 'Simple Task');
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      const store = useTodoStore.getState();
      expect(store.todos).toHaveLength(1);
      expect(store.todos[0].title).toBe('Simple Task');
    });
  });

  it('should add a todo on button click', async () => {
    const user = userEvent.setup();
    render(<QuickAdd />);

    const input = screen.getByPlaceholderText(/输入任务/);
    const buttons = screen.getAllByRole('button');
    const addButton = buttons[0]; // First button is the add button

    await user.type(input, 'Button Click Task');
    await user.click(addButton);

    await waitFor(() => {
      const store = useTodoStore.getState();
      expect(store.todos).toHaveLength(1);
      expect(store.todos[0].title).toBe('Button Click Task');
    });
  });

  it('should add multiple todos in sequence', async () => {
    const user = userEvent.setup();
    render(<QuickAdd />);

    const input = screen.getByPlaceholderText(/输入任务/);

    // Add first task
    await user.clear(input);
    await user.type(input, 'First Task');
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      const store = useTodoStore.getState();
      expect(store.todos).toHaveLength(1);
      expect(store.todos[0].title).toBe('First Task');
    });

    // Add second task
    await user.clear(input);
    await user.type(input, 'Second Task');
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      const store = useTodoStore.getState();
      expect(store.todos).toHaveLength(2);
      expect(store.todos[0].title).toBe('Second Task'); // Newest first
      expect(store.todos[1].title).toBe('First Task');
    });

    // Add third task
    await user.clear(input);
    await user.type(input, 'Third Task');
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      const store = useTodoStore.getState();
      expect(store.todos).toHaveLength(3);
      expect(store.todos[0].title).toBe('Third Task');
    });
  });

  it('should parse natural language input', async () => {
    const user = userEvent.setup();
    render(<QuickAdd />);

    const input = screen.getByPlaceholderText(/输入任务/);

    await user.type(input, '明天开会 #工作');
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      const store = useTodoStore.getState();
      expect(store.todos).toHaveLength(1);
      expect(store.todos[0].title).toBe('开会');
      expect(store.todos[0].dueDate).toBeDefined();
    });
  });

  it('should show preview tags when typing', async () => {
    const user = userEvent.setup();
    render(<QuickAdd />);

    const input = screen.getByPlaceholderText(/输入任务/);

    await user.type(input, '明天 #工作');

    // Preview tags should appear
    await waitFor(() => {
      const tags = screen.queryAllByText(/明天|工作/);
      expect(tags.length).toBeGreaterThan(0);
    });
  });

  it('should respect advanced options', async () => {
    const user = userEvent.setup();
    render(<QuickAdd />);

    // Expand advanced options
    const toggleButton = screen.getByText(/高级选项/);
    await user.click(toggleButton);

    // Set priority using the select dropdown
    const prioritySelect = screen.getByDisplayValue(/优先级/) as HTMLSelectElement;

    // Use selectOptions and wait for state update
    await user.selectOptions(prioritySelect, 'high');

    // Wait a bit for the state to update
    await waitFor(() => {
      expect(prioritySelect.value).toBe('high');
    });

    const input = screen.getByPlaceholderText(/输入任务/);
    await user.clear(input);
    await user.type(input, 'High Priority Task');
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      const store = useTodoStore.getState();
      expect(store.todos.length).toBeGreaterThan(0);
      expect(store.todos[0].priority).toBe('high');
    }, { timeout: 3000 });
  });

  it('should set due date from advanced options', async () => {
    const user = userEvent.setup();
    render(<QuickAdd />);

    // Expand advanced options
    const toggleButton = screen.getByText(/高级选项/);
    await user.click(toggleButton);

    // Set due date
    const dateInput = screen.getByTitle(/到期日期/);
    await user.type(dateInput, '2025-01-25');

    const input = screen.getByPlaceholderText(/输入任务/);
    await user.type(input, 'Task with Date');
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      const store = useTodoStore.getState();
      expect(store.todos[0].dueDate).toBe('2025-01-25');
    });
  });

  it('should not add empty todo', async () => {
    const user = userEvent.setup();
    render(<QuickAdd />);

    const input = screen.getByPlaceholderText(/输入任务/);
    const buttons = screen.getAllByRole('button');
    const addButton = buttons[0]; // First button is the add button

    // Try to add with only spaces
    await user.type(input, '   ');
    await user.click(addButton);

    await waitFor(() => {
      const store = useTodoStore.getState();
      expect(store.todos).toHaveLength(0);
    });
  });

  it('should keep focus on input after adding', async () => {
    const user = userEvent.setup();
    render(<QuickAdd />);

    const input = screen.getByPlaceholderText(/输入任务/) as HTMLInputElement;

    await user.type(input, 'Task 1');
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(input).toHaveFocus();
    });
  });

  it('should add todo to current custom list', async () => {
    const user = userEvent.setup();

    // Create a custom list using renderHook to ensure state updates
    const { result: storeHook } = renderHook(() => useTodoStore());

    act(() => {
      storeHook.current.addList('Work', '💼', '#3B82F6');
    });

    // Find the work list
    const workList = storeHook.current.lists.find(l => l.name === 'Work');
    expect(workList).toBeDefined();

    if (workList) {
      act(() => {
        storeHook.current.setCurrentView(workList.id);
      });

      render(<QuickAdd />);

      const input = screen.getByPlaceholderText(/输入任务/);

      await user.type(input, 'Work Task');
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        const updatedStore = useTodoStore.getState();
        expect(updatedStore.todos[0].listId).toBe(workList.id);
      });
    }
  });
});
