import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import CalendarView from '../CalendarView';
import { useTodoStore } from '@renderer/components/TodoList/store/useTodoStore';

// Mock the subcomponents
vi.mock('../components/MonthView', () => ({
  __esModule: true,
  default: function MockMonthView({ currentDate, onDateClick, onTaskClick, getTodosForDate, selectedDate }: any) {
    const dateKey = currentDate.toISOString().split('T')[0];
    const todos = getTodosForDate(dateKey);

    return (
      <div data-testid="month-view">
        <div data-testid="current-date">{dateKey}</div>
        {todos.map((todo: any) => (
          <div
            key={todo.id}
            data-testid={`todo-${todo.id}`}
            onClick={() => onTaskClick(todo.id)}
          >
            {todo.title}
          </div>
        ))}
      </div>
    );
  },
}));

vi.mock('../components/WeekView', () => ({
  __esModule: true,
  default: function MockWeekView({ currentDate, onDateClick, onTaskClick, getTodosForDate, selectedDate }: any) {
    const dateKey = currentDate.toISOString().split('T')[0];
    const todos = getTodosForDate(dateKey);

    return (
      <div data-testid="week-view">
        <div data-testid="current-date">{dateKey}</div>
        {todos.map((todo: any) => (
          <div
            key={todo.id}
            data-testid={`todo-${todo.id}`}
            onClick={() => onTaskClick(todo.id)}
          >
            {todo.title}
          </div>
        ))}
      </div>
    );
  },
}));

vi.mock('../components/CalendarHeader', () => ({
  __esModule: true,
  default: function MockCalendarHeader({ currentDate, setCurrentDate, calendarMode, setCalendarMode }: any) {
    return (
      <div data-testid="calendar-header">
        <button onClick={() => setCurrentDate(new Date())}>Today</button>
        <button onClick={() => setCalendarMode(calendarMode === 'month' ? 'week' : 'month')}>
          Toggle View
        </button>
      </div>
    );
  },
}));

describe('CalendarView Component', () => {
  const mockTodos = [
    {
      id: 'test-1',
      title: 'Task 1',
      completed: false,
      priority: 'high' as const,
      listId: 'list-inbox',
      dueDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activityHistory: [],
      subtasks: [],
    },
    {
      id: 'test-2',
      title: 'Task 2',
      completed: true,
      priority: 'medium' as const,
      listId: 'list-inbox',
      dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activityHistory: [],
      subtasks: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    const store = useTodoStore.getState();
    store.todos = mockTodos;
    store.lists = [
      { id: 'list-inbox', name: '收件箱', icon: '📥' },
    ];
    store.currentView = 'inbox';
    store.searchQuery = '';
  });

  it('should render calendar view with month view as default', () => {
    render(<CalendarView />);

    expect(screen.getByTestId('month-view')).toBeInTheDocument();
    expect(screen.getByTestId('calendar-header')).toBeInTheDocument();
  });

  it('should call onTodoClick when task is clicked', () => {
    const handleTodoClick = vi.fn();
    render(<CalendarView onTodoClick={handleTodoClick} />);

    const taskElement = screen.getByTestId('todo-test-1');
    fireEvent.click(taskElement);

    expect(handleTodoClick).toHaveBeenCalledWith('test-1');
  });

  it('should toggle between month and week view', () => {
    render(<CalendarView />);

    const toggleButton = screen.getByText('Toggle View');
    fireEvent.click(toggleButton);

    expect(screen.getByTestId('week-view')).toBeInTheDocument();
  });

  it('should navigate to today when today button is clicked', () => {
    render(<CalendarView />);

    const todayButton = screen.getByText('Today');
    fireEvent.click(todayButton);

    const currentDate = screen.getByTestId('current-date');
    const todayStr = new Date().toISOString().split('T')[0];
    expect(currentDate).toHaveTextContent(todayStr);
  });

  it('should filter todos by current view', () => {
    const store = useTodoStore.getState();

    render(<CalendarView />);

    // Should show todos from store
    expect(screen.getByTestId('todo-test-1')).toBeInTheDocument();
    expect(screen.getByTestId('todo-test-2')).toBeInTheDocument();
  });
});
