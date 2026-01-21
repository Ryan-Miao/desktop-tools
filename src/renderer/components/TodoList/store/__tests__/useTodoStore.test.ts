import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTodoStore, Todo, List } from "../useTodoStore";

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

Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
});

describe("useTodoStore", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Completely reset store state
    const store = useTodoStore.getState();

    // Reset todos
    store.todos = [];

    // Reset lists to default (don't use set() as it might trigger side effects)
    // We'll let the initialize function handle this
    store.currentView = "list-inbox";
    store.searchQuery = "";
  });

  describe("Initial State", () => {
    it("should have correct initial state", () => {
      const { result } = renderHook(() => useTodoStore());

      expect(result.current.todos).toEqual([]);
      expect(result.current.lists).toHaveLength(3);
      expect(result.current.currentView).toBe("list-inbox");
      expect(result.current.searchQuery).toBe("");
    });

    it("should have default lists", () => {
      const { result } = renderHook(() => useTodoStore());

      const inboxList = result.current.lists.find((l) => l.id === "list-inbox");
      expect(inboxList).toBeDefined();
      expect(inboxList?.name).toBe("收集箱");
      expect(inboxList?.isInbox).toBe(true);
    });
  });

  describe("addTodo", () => {
    it("should add a new todo", () => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.addTodo({
          title: "Test Task",
          completed: false,
          priority: "none",
          listId: "list-inbox",
        });
      });

      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].title).toBe("Test Task");
      expect(result.current.todos[0].completed).toBe(false);
      expect(result.current.todos[0].listId).toBe("list-inbox");
      expect(result.current.todos[0].subtasks).toEqual([]);
      expect(result.current.todos[0].createdAt).toBeDefined();
    });

    it("should add multiple todos", () => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.addTodo({
          title: "First Task",
          completed: false,
          priority: "none",
          listId: "list-inbox",
        });
      });

      act(() => {
        result.current.addTodo({
          title: "Second Task",
          completed: false,
          priority: "high",
          listId: "list-inbox",
          dueDate: "2025-01-20",
        });
      });

      expect(result.current.todos).toHaveLength(2);
      expect(result.current.todos[0].title).toBe("Second Task"); // Newest first
      expect(result.current.todos[1].title).toBe("First Task");
    });

    it("should add todo with priority", () => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.addTodo({
          title: "High Priority Task",
          completed: false,
          priority: "high",
          listId: "list-inbox",
        });
      });

      expect(result.current.todos[0].priority).toBe("high");
    });

    it("should add todo with due date", () => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.addTodo({
          title: "Task with Due Date",
          completed: false,
          priority: "none",
          listId: "list-inbox",
          dueDate: "2025-01-25",
        });
      });

      expect(result.current.todos[0].dueDate).toBe("2025-01-25");
    });

    it("should add todo with description", () => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.addTodo({
          title: "Task with Description",
          description: "This is a detailed description",
          completed: false,
          priority: "none",
          listId: "list-inbox",
        });
      });

      expect(result.current.todos[0].description).toBe(
        "This is a detailed description",
      );
    });
  });

  describe("updateTodo", () => {
    it("should update todo properties", () => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.addTodo({
          title: "Original Title",
          completed: false,
          priority: "none",
          listId: "list-inbox",
        });
      });

      const todoId = result.current.todos[0].id;

      act(() => {
        result.current.updateTodo(todoId, {
          title: "Updated Title",
          priority: "high",
        });
      });

      expect(result.current.todos[0].title).toBe("Updated Title");
      expect(result.current.todos[0].priority).toBe("high");
    });
  });

  describe("toggleTodo", () => {
    it("should toggle todo completion", () => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.addTodo({
          title: "Test Task",
          completed: false,
          priority: "none",
          listId: "list-inbox",
        });
      });

      const todoId = result.current.todos[0].id;

      expect(result.current.todos[0].completed).toBe(false);

      act(() => {
        result.current.toggleTodo(todoId);
      });

      expect(result.current.todos[0].completed).toBe(true);
      expect(result.current.todos[0].completedAt).toBeDefined();

      act(() => {
        result.current.toggleTodo(todoId);
      });

      expect(result.current.todos[0].completed).toBe(false);
      expect(result.current.todos[0].completedAt).toBeUndefined();
    });
  });

  describe("deleteTodo", () => {
    it("should delete a todo", () => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.addTodo({
          title: "Task to Delete",
          completed: false,
          priority: "none",
          listId: "list-inbox",
        });
      });

      expect(result.current.todos).toHaveLength(1);

      const todoId = result.current.todos[0].id;

      act(() => {
        result.current.deleteTodo(todoId);
      });

      expect(result.current.todos).toHaveLength(0);
    });
  });

  describe("Subtasks", () => {
    it("should add a subtask", () => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.addTodo({
          title: "Parent Task",
          completed: false,
          priority: "none",
          listId: "list-inbox",
        });
      });

      const todoId = result.current.todos[0].id;

      act(() => {
        result.current.addSubTask(todoId, "First Subtask");
      });

      expect(result.current.todos[0].subtasks).toHaveLength(1);
      expect(result.current.todos[0].subtasks[0].title).toBe("First Subtask");
      expect(result.current.todos[0].subtasks[0].completed).toBe(false);
    });

    it("should toggle subtask completion", () => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.addTodo({
          title: "Parent Task",
          completed: false,
          priority: "none",
          listId: "list-inbox",
        });
      });

      const todoId = result.current.todos[0].id;

      act(() => {
        result.current.addSubTask(todoId, "Subtask to Toggle");
      });

      const subtaskId = result.current.todos[0].subtasks[0].id;

      act(() => {
        result.current.toggleSubTask(todoId, subtaskId);
      });

      expect(result.current.todos[0].subtasks[0].completed).toBe(true);
    });

    it("should delete a subtask", () => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.addTodo({
          title: "Parent Task",
          completed: false,
          priority: "none",
          listId: "list-inbox",
        });
      });

      const todoId = result.current.todos[0].id;

      act(() => {
        result.current.addSubTask(todoId, "Subtask to Delete");
      });

      expect(result.current.todos[0].subtasks).toHaveLength(1);

      const subtaskId = result.current.todos[0].subtasks[0].id;

      act(() => {
        result.current.deleteSubTask(todoId, subtaskId);
      });

      expect(result.current.todos[0].subtasks).toHaveLength(0);
    });

    it("should update a subtask", () => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.addTodo({
          title: "Parent Task",
          completed: false,
          priority: "none",
          listId: "list-inbox",
        });
      });

      const todoId = result.current.todos[0].id;

      act(() => {
        result.current.addSubTask(todoId, "Original Title");
      });

      const subtaskId = result.current.todos[0].subtasks[0].id;

      act(() => {
        result.current.updateSubTask(todoId, subtaskId, "Updated Title");
      });

      expect(result.current.todos[0].subtasks[0].title).toBe("Updated Title");
    });
  });

  describe("List Management", () => {
    it("should add a custom list", () => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.addList("Work", "💼", "#3B82F6");
      });

      expect(result.current.lists).toHaveLength(4);
      const workList = result.current.lists.find((l) => l.name === "Work");
      expect(workList).toBeDefined();
      expect(workList?.icon).toBe("💼");
      expect(workList?.color).toBe("#3B82F6");
    });

    it("should update a list name", () => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.addList("Personal", "🏠", "#10B981");
      });

      const listId = result.current.lists.find(
        (l) => l.name === "Personal",
      )?.id!;

      act(() => {
        result.current.updateList(listId, "Home");
      });

      expect(result.current.lists.find((l) => l.id === listId)?.name).toBe(
        "Home",
      );
    });

    it("should not delete inbox list", () => {
      const { result } = renderHook(() => useTodoStore());

      const initialListCount = result.current.lists.length;

      act(() => {
        result.current.deleteList("list-inbox");
      });

      expect(result.current.lists).toHaveLength(initialListCount);
    });

    it("should delete custom list and move todos to inbox", () => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.addList("Work", "💼", "#3B82F6");
      });

      const workList = result.current.lists.find((l) => l.name === "Work")!;

      act(() => {
        result.current.addTodo({
          title: "Work Task",
          completed: false,
          priority: "none",
          listId: workList.id,
        });
      });

      expect(result.current.todos[0].listId).toBe(workList.id);

      act(() => {
        result.current.deleteList(workList.id);
      });

      expect(
        result.current.lists.find((l) => l.id === workList.id),
      ).toBeUndefined();
      expect(result.current.todos[0].listId).toBe("list-inbox");
    });
  });

  describe("getFilteredTodos", () => {
    beforeEach(() => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        // Add task to inbox
        result.current.addTodo({
          title: "Inbox Task",
          completed: false,
          priority: "none",
          listId: "list-inbox",
        });

        // Add task for today
        const today = new Date().toISOString().split("T")[0];
        result.current.addTodo({
          title: "Today Task",
          completed: false,
          priority: "none",
          listId: "list-inbox",
          dueDate: today,
        });
      });
    });

    it("should filter todos by inbox view", () => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.setCurrentView("list-inbox");
      });

      const filtered = result.current.getFilteredTodos();
      expect(filtered.length).toBeGreaterThan(0);
    });

    it("should filter todos by search query", () => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.setSearchQuery("Inbox");
      });

      const filtered = result.current.getFilteredTodos();
      expect(filtered.every((t) => t.title.includes("Inbox"))).toBe(true);
    });
  });

  describe("UI State", () => {
    it("should change current view", () => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.setCurrentView("today");
      });

      expect(result.current.currentView).toBe("today");
    });

    it("should set search query", () => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.setSearchQuery("test query");
      });

      expect(result.current.searchQuery).toBe("test query");
    });
  });

  describe("Helpers", () => {
    it("should get todo by id", () => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.addTodo({
          title: "Test Task",
          completed: false,
          priority: "none",
          listId: "list-inbox",
        });
      });

      const todoId = result.current.todos[0].id;
      const todo = result.current.getTodoById(todoId);

      expect(todo).toBeDefined();
      expect(todo?.title).toBe("Test Task");
    });

    it("should get list by id", () => {
      const { result } = renderHook(() => useTodoStore());

      const list = result.current.getListById("list-inbox");

      expect(list).toBeDefined();
      expect(list?.name).toBe("收集箱");
    });
  });
});
