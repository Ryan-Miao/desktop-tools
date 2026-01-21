import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import TodoCard from "../index";
import { useTodoStore } from "@renderer/components/TodoList/store/useTodoStore";

describe("TodoCard Component", () => {
  const mockTodo = {
    id: "test-1",
    title: "Test Task",
    description: "Test description",
    completed: false,
    priority: "high" as const,
    listId: "list-inbox",
    dueDate: new Date().toISOString().split("T")[0],
    order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    activityHistory: [],
    subtasks: [],
  };

  beforeEach(() => {
    const store = useTodoStore.getState();
    store.todos = [];
    store.lists = [
      {
        id: "list-inbox",
        name: "收件箱",
        icon: "📥",
        color: "#3b82f6",
        isInbox: true,
        order: 0,
      },
    ];
  });

  it("should render todo card with correct title", () => {
    render(<TodoCard todo={mockTodo} onClick={() => {}} isSelected={false} />);

    expect(screen.getByText("Test Task")).toBeInTheDocument();
  });

  it("should show completed state when todo is completed", () => {
    const completedTodo = { ...mockTodo, completed: true };
    render(
      <TodoCard todo={completedTodo} onClick={() => {}} isSelected={false} />,
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });

  it("should call onClick when card is clicked", () => {
    const handleClick = vi.fn();
    render(
      <TodoCard todo={mockTodo} onClick={handleClick} isSelected={false} />,
    );

    const card = screen.getByText("Test Task").closest("div");
    fireEvent.click(card!);

    expect(handleClick).toHaveBeenCalledWith("test-1");
  });

  it("should toggle todo completion when checkbox is clicked", () => {
    // Initialize store with the mock todo
    const store = useTodoStore.getState();
    store.todos = [mockTodo];

    render(<TodoCard todo={mockTodo} onClick={() => {}} isSelected={false} />);

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    const updatedStore = useTodoStore.getState();
    expect(updatedStore.todos).toHaveLength(1);
    expect(updatedStore.todos[0].completed).toBe(true);
  });

  it("should display priority indicator", () => {
    render(<TodoCard todo={mockTodo} onClick={() => {}} isSelected={false} />);

    // Priority is displayed as emoji (🔴 for high)
    expect(screen.getByText(/🔴/)).toBeInTheDocument();
  });

  it("should display subtasks count", () => {
    const todoWithSubtasks = {
      ...mockTodo,
      subtasks: [
        { id: "st-1", title: "Subtask 1", completed: false, order: 0 },
        { id: "st-2", title: "Subtask 2", completed: true, order: 1 },
      ],
    };

    render(
      <TodoCard
        todo={todoWithSubtasks}
        onClick={() => {}}
        isSelected={false}
      />,
    );

    expect(screen.getByText(/1\/2/)).toBeInTheDocument();
  });

  it("should show overdue indicator for overdue tasks", () => {
    const overdueTodo = {
      ...mockTodo,
      dueDate: "2020-01-01", // Past date
    };

    const { container } = render(
      <TodoCard todo={overdueTodo} onClick={() => {}} isSelected={false} />,
    );

    // Check for overdue class on the todoCard element
    // CSS modules rewrite class names, so check if the className string contains 'overdue'
    const todoCardElement = container.querySelector("[class*='todoCard']");
    expect(todoCardElement).toBeInTheDocument();
    expect(todoCardElement?.className).toContain("overdue");
  });
});
