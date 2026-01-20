import { create } from 'zustand';
import { fileStorageService } from '@renderer/services/FileStorageService';
import { createLogger } from '../../../../shared/logger';
import { debounce } from '@renderer/utils/debounce';

const logger = createLogger('TodoListStore');

// ========== Simplified Data Models ==========

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

// Activity Event Types
export type ActivityEventType =
  | 'CREATED'
  | 'UPDATED'
  | 'COMPLETED'
  | 'REOPENED'
  | 'DELETED'
  | 'TITLE_CHANGED'
  | 'DESCRIPTION_CHANGED'
  | 'PRIORITY_CHANGED'
  | 'DUE_DATE_CHANGED'
  | 'LIST_CHANGED'
  | 'SUBTASK_ADDED'
  | 'SUBTASK_COMPLETED'
  | 'SUBTASK_REOPENED'
  | 'SUBTASK_DELETED'
  | 'SUBTASK_TITLE_CHANGED'
  | 'STATUS_CHANGED';

// Activity Event Interface
export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  timestamp: string;
  description?: string;
  changes?: {
    field?: string;
    oldValue?: any;
    newValue?: any;
  };
  userId?: string; // For future multi-user support
}

export interface Todo {
  id: string;
  title: string;              // Main title (required)
  description?: string;       // Description (optional)
  completed: boolean;
  priority: 'none' | 'low' | 'medium' | 'high';
  dueDate?: string;           // YYYY-MM-DD
  listId: string;             // Associated list
  order: number;              // Sort order
  createdAt: string;
  updatedAt?: string;         // Last modification timestamp
  completedAt?: string;
  subtasks: SubTask[];        // Embedded subtasks
  activityHistory?: ActivityEvent[]; // Activity log (optional)
  status?: 'todo' | 'in-progress' | 'done'; // Task status for kanban view
}

export interface List {
  id: string;
  name: string;
  icon: string;
  color: string;
  isInbox: boolean;           // Is this the inbox list?
  order: number;
}

export type SmartView = 'inbox' | 'today' | 'week';
export type ViewMode = 'list' | 'kanban';

// ========== Store State ==========

interface TodoStoreState {
  // Data
  todos: Todo[];
  lists: List[];

  // UI State
  currentView: SmartView | string;  // Smart view or list ID
  searchQuery: string;
  viewMode: ViewMode;              // View mode: list or kanban

  // ========== Sorting State ==========
  sortBy: 'none' | 'createdAt' | 'priority' | 'dueDate';
  sortOrder: 'asc' | 'desc';
  showCompletedAtBottom: boolean;

  // ========== File Storage ==========
  initialize: () => Promise<void>;
  saveToFile: () => Promise<void>;
  migrateFromLocalStorage: () => Promise<boolean>;

  // ========== Migration ==========
  migrateOldData: () => void;

  // ========== Todo Actions ==========

  addTodo: (todo: Omit<Todo, 'id' | 'createdAt' | 'order' | 'subtasks'>) => void;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  deleteTodo: (id: string) => void;
  toggleTodo: (id: string) => void;
  clearCompleted: () => void;

  // ========== Subtask Actions ==========

  addSubTask: (todoId: string, title: string) => void;
  toggleSubTask: (todoId: string, subtaskId: string) => void;
  deleteSubTask: (todoId: string, subtaskId: string) => void;
  updateSubTask: (todoId: string, subtaskId: string, title: string) => void;
  reorderSubTasks: (todoId: string, subtasks: SubTask[]) => void;

  // ========== List Actions ==========

  addList: (name: string, icon?: string, color?: string) => void;
  updateList: (id: string, name: string) => void;
  deleteList: (id: string) => void;

  // ========== UI State ==========

  setCurrentView: (view: SmartView | string) => void;
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: ViewMode) => void;
  updateTodoStatus: (id: string, status: 'todo' | 'in-progress' | 'done') => void;

  // ========== Sorting Actions ==========

  setSortBy: (sortBy: 'none' | 'createdAt' | 'priority' | 'dueDate') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  toggleShowCompletedAtBottom: () => void;

  // ========== Helpers ==========

  getTodoById: (id: string) => Todo | undefined;
  getListById: (id: string) => List | undefined;
  getFilteredTodos: () => Todo[];
}

// ========== Store Implementation ==========

const generateId = () => Date.now().toString() + Math.random().toString(36).slice(2);

// ========== Activity Tracking Helpers ==========

/**
 * Create a new activity event
 */
const createActivityEvent = (
  type: ActivityEventType,
  description?: string,
  changes?: { field?: string; oldValue?: any; newValue?: any }
): ActivityEvent => ({
  id: generateId(),
  type,
  timestamp: new Date().toISOString(),
  description,
  changes,
});

/**
 * Get status label in Chinese
 */
const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    'todo': '待办',
    'in-progress': '进行中',
    'done': '已完成'
  };
  return labels[status] || status;
};

/**
 * Add activity event to a todo
 */
const addActivityToTodo = (
  todo: Todo,
  type: ActivityEventType,
  description?: string,
  changes?: { field?: string; oldValue?: any; newValue?: any }
): Todo => {
  const event = createActivityEvent(type, description, changes);
  const history = todo.activityHistory || [];

  // Keep only last 50 activities to prevent storage bloat
  const maxActivities = 50;
  const trimmedHistory = history.length >= maxActivities
    ? history.slice(-maxActivities + 1)
    : history;

  return {
    ...todo,
    updatedAt: new Date().toISOString(),
    activityHistory: [...trimmedHistory, event],
  };
};

const initialLists: List[] = [
  { id: 'list-inbox', name: '收集箱', icon: '📥', color: '#3B82F6', isInbox: true, order: 0 },
  { id: 'list-today', name: '今天', icon: '☀️', color: '#F59E0B', isInbox: false, order: 1 },
  { id: 'list-week', name: '最近7天', icon: '📅', color: '#10B981', isInbox: false, order: 2 },
];

const PLUGIN_ID = 'todolist';
const STORAGE_KEY = 'todo-storage';

// Debounced save function to reduce file I/O
// Delay saves by 1 second to batch rapid changes
let debouncedSaveInstance: ((getFn: () => TodoStoreState) => Promise<void>) | null = null;

const getDebouncedSave = () => {
  if (!debouncedSaveInstance) {
    debouncedSaveInstance = debounce(async (getFn: () => TodoStoreState) => {
      try {
        const state = getFn();
        const data = {
          todos: state.todos,
          lists: state.lists,
          sortBy: state.sortBy,
          sortOrder: state.sortOrder,
          showCompletedAtBottom: state.showCompletedAtBottom,
        };

        await fileStorageService.savePluginData(PLUGIN_ID, data);
        logger.debug('[TodoList] Debounced save completed');
      } catch (error) {
        logger.error('[TodoList] Error in debounced save', { error });
      }
    }, 1000); // 1 second debounce
  }
  return debouncedSaveInstance;
};

export const useTodoStore = create<TodoStoreState>((set, get) => ({
  // Initial State
  todos: [],
  lists: initialLists,
  currentView: 'inbox',
  searchQuery: '',
  viewMode: 'list',
  sortBy: 'none',
  sortOrder: 'desc',
  showCompletedAtBottom: true,

  // ========== File Storage ==========

  /**
   * 初始化：从文件加载数据，如果不存在则从localStorage迁移
   */
  initialize: async () => {
    try {
      // 尝试从文件加载
      const data = await fileStorageService.loadPluginData<{
        todos: Todo[];
        lists: List[];
        sortBy: TodoStoreState['sortBy'];
        sortOrder: TodoStoreState['sortOrder'];
        showCompletedAtBottom: boolean;
      }>(PLUGIN_ID);

      if (data) {
        logger.info('[TodoList] Loaded data from file storage');
        set({
          todos: data.todos || [],
          lists: data.lists || initialLists,
          sortBy: data.sortBy || 'none',
          sortOrder: data.sortOrder || 'desc',
          showCompletedAtBottom: data.showCompletedAtBottom ?? true,
        });
      } else {
        // 文件不存在，尝试从localStorage迁移
        logger.info('[TodoList] No file data found, trying localStorage migration');
        const migrated = await get().migrateFromLocalStorage();
        if (migrated) {
          logger.info('[TodoList] Successfully migrated from localStorage');
        } else {
          logger.info('[TodoList] Starting with empty state');
        }
      }
    } catch (error) {
      logger.error('[TodoList] Failed to initialize', { error });
    }
  },

  /**
   * 保存数据到文件 (使用防抖优化性能)
   * 每次调用会延迟1秒执行，频繁调用会重置计时器
   */
  saveToFile: async () => {
    // Use debounced save for better performance
    const debouncedSave = getDebouncedSave();
    await debouncedSave(get);
  },

  /**
   * 从localStorage迁移数据到文件存储
   */
  migrateFromLocalStorage: async () => {
    try {
      const localStorageData = localStorage.getItem(STORAGE_KEY);
      if (!localStorageData) {
        return false;
      }

      const data = JSON.parse(localStorageData);

      // 保存到文件
      const success = await fileStorageService.savePluginData(PLUGIN_ID, data);

      if (success) {
        // 更新store状态
        set({
          todos: data.todos || [],
          lists: data.lists || initialLists,
          sortBy: data.sortBy || 'none',
          sortOrder: data.sortOrder || 'desc',
          showCompletedAtBottom: data.showCompletedAtBottom ?? true,
        });

        // 创建localStorage备份
        localStorage.setItem(`${STORAGE_KEY}-migrated-backup`, localStorageData);
        logger.info('[TodoList] Migrated from localStorage to file storage');
        return true;
      }

      return false;
    } catch (error) {
      logger.error('[TodoList] Failed to migrate from localStorage', { error });
      return false;
    }
  },

  // ========== Migration Helper ==========
  migrateOldData: () => {
    const oldTodos = localStorage.getItem('todo-items');
    const oldCategories = localStorage.getItem('todo-categories');

    if (oldTodos) {
      try {
        const parsed = JSON.parse(oldTodos);
        // Migrate to new data model
        const migrated: Todo[] = parsed.map((todo: any) => ({
          id: todo.id || generateId(),
          title: todo.text || todo.title || '',
          description: todo.description,
          completed: todo.completed || false,
          priority: todo.priority || 'none',
          dueDate: todo.dueDate,
          listId: 'list-inbox', // Default to inbox
          order: todo.order || 0,
          createdAt: todo.createdAt || new Date().toISOString(),
          completedAt: todo.completedAt,
          subtasks: [], // Start with empty subtasks
        }));
        set({ todos: migrated });
        localStorage.removeItem('todo-items');
      } catch (err) {
        console.error('Failed to migrate old todos:', err);
      }
    }

    if (oldCategories) {
      try {
        const parsed = JSON.parse(oldCategories);
        // Convert old categories to custom lists
        const customLists: List[] = parsed.map((cat: any) => ({
          id: cat.id || generateId(),
          name: cat.name,
          icon: cat.icon || '📁',
          color: cat.color || '#3B82F6',
          isInbox: false,
          order: get().lists.length,
        }));
        set((state) => ({
          lists: [...state.lists, ...customLists],
        }));
        localStorage.removeItem('todo-categories');
      } catch (err) {
        console.error('Failed to migrate old categories:', err);
      }
    }
  },

  // ========== Todo Actions ==========

  addTodo: (todoData) => {
    const newTodo: Todo = {
      ...todoData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: get().todos.length,
      subtasks: [],
      activityHistory: [
        createActivityEvent('CREATED', '创建了任务', {
          field: 'title',
          newValue: todoData.title,
        }),
      ],
    };

    set((state) => ({ todos: [newTodo, ...state.todos] }));

    logger.info('[TodoList] Task created', { id: newTodo.id, title: newTodo.title });

    // Auto-save to file
    get().saveToFile();
  },

  updateTodo: (id, updates) => {
    let activityType: ActivityEventType = 'UPDATED';
    let activityDesc = '更新了任务';
    let activityChanges: { field?: string; oldValue?: any; newValue?: any } | undefined;

    set((state) => ({
      todos: state.todos.map((todo) => {
        if (todo.id === id) {
          // Determine what changed and create appropriate activity
          const oldTodo = { ...todo };

          // Track specific field changes
          if ('title' in updates && updates.title !== oldTodo.title) {
            activityType = 'TITLE_CHANGED';
            activityDesc = '修改了标题';
            activityChanges = {
              field: 'title',
              oldValue: oldTodo.title,
              newValue: updates.title,
            };
          } else if ('description' in updates && updates.description !== oldTodo.description) {
            activityType = 'DESCRIPTION_CHANGED';
            activityDesc = '修改了描述';
            activityChanges = {
              field: 'description',
              oldValue: oldTodo.description,
              newValue: updates.description,
            };
          } else if ('priority' in updates && updates.priority !== oldTodo.priority) {
            activityType = 'PRIORITY_CHANGED';
            activityDesc = `修改了优先级为${updates.priority}`;
            activityChanges = {
              field: 'priority',
              oldValue: oldTodo.priority,
              newValue: updates.priority,
            };
          } else if ('dueDate' in updates && updates.dueDate !== oldTodo.dueDate) {
            activityType = 'DUE_DATE_CHANGED';
            activityDesc = updates.dueDate
              ? `设置到期日期为${updates.dueDate}`
              : '移除了到期日期';
            activityChanges = {
              field: 'dueDate',
              oldValue: oldTodo.dueDate,
              newValue: updates.dueDate,
            };
          } else if ('listId' in updates && updates.listId !== oldTodo.listId) {
            activityType = 'LIST_CHANGED';
            activityDesc = '移动了任务';
            activityChanges = {
              field: 'listId',
              oldValue: oldTodo.listId,
              newValue: updates.listId,
            };
          }

          // Update todo with activity tracking
          return addActivityToTodo(
            { ...todo, ...updates },
            activityType,
            activityDesc,
            activityChanges
          );
        }
        return todo;
      }),
    }));

    // Auto-save to file
    get().saveToFile();
  },

  deleteTodo: (id) => {
    set((state) => ({
      todos: state.todos.filter((todo) => todo.id !== id),
    }));

    // Auto-save to file
    get().saveToFile();
  },

  toggleTodo: (id) => {
    set((state) => ({
      todos: state.todos.map((todo) => {
        if (todo.id === id) {
          const isCompleting = !todo.completed;

          // Add completion/reopen activity
          if (isCompleting) {
            logger.info('[TodoList] Task completed', { id, title: todo.title });
            return addActivityToTodo(
              { ...todo, completed: true, completedAt: new Date().toISOString() },
              'COMPLETED',
              '完成了任务'
            );
          } else {
            logger.info('[TodoList] Task reopened', { id, title: todo.title });
            return addActivityToTodo(
              { ...todo, completed: false, completedAt: undefined },
              'REOPENED',
              '重新打开任务'
            );
          }
        }
        return todo;
      }),
    }));

    // Auto-save to file
    get().saveToFile();
  },

  clearCompleted: () => {
    set((state) => ({
      todos: state.todos.filter((todo) => !todo.completed),
    }));

    // Auto-save to file
    get().saveToFile();
  },

  // ========== Subtask Actions ==========

  addSubTask: (todoId, title) => {
    const newSubTask: SubTask = {
      id: generateId(),
      title,
      completed: false,
      order: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      todos: state.todos.map((todo) => {
        if (todo.id === todoId) {
          logger.info('[TodoList] Subtask added', { todoId, title });
          return addActivityToTodo(
            { ...todo, subtasks: [...todo.subtasks, newSubTask] },
            'SUBTASK_ADDED',
            `添加了子任务: ${title}`,
            { field: 'subtask', newValue: title }
          );
        }
        return todo;
      }),
    }));

    // Auto-save to file
    get().saveToFile();
  },

  toggleSubTask: (todoId, subtaskId) => {
    set((state) => ({
      todos: state.todos.map((todo) => {
        if (todo.id === todoId) {
          const subtask = todo.subtasks.find(st => st.id === subtaskId);
          if (subtask) {
            const isCompleting = !subtask.completed;

            return addActivityToTodo(
              {
                ...todo,
                subtasks: todo.subtasks.map((st) =>
                  st.id === subtaskId
                    ? { ...st, completed: isCompleting, updatedAt: new Date().toISOString() }
                    : st
                ),
              },
              isCompleting ? 'SUBTASK_COMPLETED' : 'SUBTASK_REOPENED',
              isCompleting ? `完成了子任务: ${subtask.title}` : `重新打开子任务: ${subtask.title}`,
              { field: 'subtask', newValue: subtask.title }
            );
          }
        }
        return todo;
      }),
    }));

    // Auto-save to file
    get().saveToFile();
  },

  deleteSubTask: (todoId, subtaskId) => {
    set((state) => ({
      todos: state.todos.map((todo) => {
        if (todo.id === todoId) {
          const subtask = todo.subtasks.find(st => st.id === subtaskId);
          if (subtask) {
            logger.info('[TodoList] Subtask deleted', { todoId, title: subtask.title });
            return addActivityToTodo(
              { ...todo, subtasks: todo.subtasks.filter((st) => st.id !== subtaskId) },
              'SUBTASK_DELETED',
              `删除了子任务: ${subtask.title}`,
              { field: 'subtask', oldValue: subtask.title }
            );
          }
        }
        return todo;
      }),
    }));

    // Auto-save to file
    get().saveToFile();
  },

  updateSubTask: (todoId, subtaskId, title) => {
    set((state) => ({
      todos: state.todos.map((todo) => {
        if (todo.id === todoId) {
          const subtask = todo.subtasks.find(st => st.id === subtaskId);
          if (subtask && subtask.title !== title) {
            logger.info('[TodoList] Subtask updated', { todoId, oldTitle: subtask.title, newTitle: title });
            return addActivityToTodo(
              {
                ...todo,
                subtasks: todo.subtasks.map((st) =>
                  st.id === subtaskId
                    ? { ...st, title, updatedAt: new Date().toISOString() }
                    : st
                ),
              },
              'SUBTASK_TITLE_CHANGED',
              `修改了子任务: ${title}`,
              { field: 'subtask', oldValue: subtask.title, newValue: title }
            );
          }
          // Just update timestamp if title hasn't changed
          return {
            ...todo,
            subtasks: todo.subtasks.map((subtask) =>
              subtask.id === subtaskId
                ? { ...subtask, updatedAt: new Date().toISOString() }
                : subtask
            ),
          };
        }
        return todo;
      }),
    }));

    // Auto-save to file
    get().saveToFile();
  },

  reorderSubTasks: (todoId, subtasks) => {
    set((state) => ({
      todos: state.todos.map((todo) =>
        todo.id === todoId ? { ...todo, subtasks } : todo
      ),
    }));

    // Auto-save to file
    get().saveToFile();
  },

  // ========== List Actions ==========

  addList: (name, icon, color) => {
    const newList: List = {
      id: generateId(),
      name,
      icon: icon || '📁',
      color: color || '#3B82F6',
      isInbox: false,
      order: get().lists.length,
    };
    set((state) => ({
      lists: [...state.lists, newList],
    }));

    // Auto-save to file
    get().saveToFile();
  },

  updateList: (id, name) => {
    set((state) => ({
      lists: state.lists.map((list) =>
        list.id === id ? { ...list, name } : list
      ),
    }));

    // Auto-save to file
    get().saveToFile();
  },

  deleteList: (id) => {
    // Don't allow deleting smart lists
    const list = get().lists.find((l) => l.id === id);
    if (list?.isInbox) return;

    set((state) => ({
      lists: state.lists.filter((list) => list.id !== id),
      // Move todos from deleted list to inbox
      todos: state.todos.map((todo) =>
        todo.listId === id ? { ...todo, listId: 'list-inbox' } : todo
      ),
    }));

    // Auto-save to file
    get().saveToFile();
  },

  // ========== UI State ==========

  setCurrentView: (view) => set({ currentView: view }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setViewMode: (mode) => set({ viewMode: mode }),

  updateTodoStatus: (id, status) => {
    set((state) => {
      const todo = state.todos.find((t) => t.id === id);
      if (!todo) return state;

      const oldStatus = todo.status || (todo.completed ? 'done' : 'todo');
      const newStatus = status;
      const completed = status === 'done';

      return {
        todos: state.todos.map((todo) => {
          if (todo.id === id) {
            // Only record activity if status actually changed
            if (oldStatus === newStatus) {
              return {
                ...todo,
                status,
                completed,
                ...(completed && { completedAt: new Date().toISOString() })
              };
            }

            return addActivityToTodo(
              {
                ...todo,
                status,
                completed,
                ...(completed && { completedAt: new Date().toISOString() })
              },
              'STATUS_CHANGED',
              `状态从 ${getStatusLabel(oldStatus)} 改为 ${getStatusLabel(newStatus)}`,
              {
                field: 'status',
                oldValue: oldStatus,
                newValue: newStatus
              }
            );
          }
          return todo;
        }),
      };
    });

    // Auto-save to file
    get().saveToFile();
  },

  // ========== Sorting Actions ==========

  setSortBy: (sortBy) => {
    set({ sortBy });
    get().saveToFile();
  },

  setSortOrder: (sortOrder) => {
    set({ sortOrder });
    get().saveToFile();
  },

  toggleShowCompletedAtBottom: () => {
    set((state) => ({
      showCompletedAtBottom: !state.showCompletedAtBottom,
    }));
    get().saveToFile();
  },

  // ========== Helpers ==========

  getTodoById: (id) => {
    return get().todos.find((todo) => todo.id === id);
  },

  getListById: (id) => {
    return get().lists.find((list) => list.id === id);
  },

  getFilteredTodos: () => {
    const state = get();
    const { todos, currentView, searchQuery, sortBy, sortOrder, showCompletedAtBottom } = state;

    // 1. Filter by search query
    let filtered = searchQuery.trim()
      ? todos.filter(
          (todo) =>
            todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            todo.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : [...todos]; // Create a copy to avoid mutation

    // 2. Filter by view
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`; // 格式: YYYY-MM-DD (本地日期)

    // Debug logging
    logger.info('[getFilteredTodos] Debug', {
      currentView,
      todayStr,
      totalTodos: todos.length,
      todosWithDueDates: todos.filter(t => t.dueDate).length,
      sampleTodosWithDates: todos.filter(t => t.dueDate).slice(0, 3).map(t => ({
        title: t.title,
        dueDate: t.dueDate,
        listId: t.listId
      }))
    });

    if (currentView === 'list-inbox') {
      // Show all tasks in inbox list
      filtered = filtered.filter((todo) => todo.listId === 'list-inbox');
      logger.info('[getFilteredTodos] Inbox view - filtered count:', filtered.length);
    } else if (currentView === 'list-today') {
      // Show tasks due today (字符串比较，避免时区问题)
      const beforeCount = filtered.length;
      filtered = filtered.filter(
        (todo) => todo.dueDate === todayStr
      );
      logger.info('[getFilteredTodos] Today view', {
        todayStr,
        beforeCount,
        afterCount: filtered.length,
        matchedTodos: filtered.map(t => ({ title: t.title, dueDate: t.dueDate }))
      });
    } else if (currentView === 'list-week') {
      // Show tasks due in next 7 days
      const beforeCount = filtered.length;
      filtered = filtered.filter((todo) => {
        if (!todo.dueDate) return false;

        // 计算日期差（使用本地时间）
        const dueDate = new Date(todo.dueDate + 'T00:00:00'); // 强制使用本地时区
        const todayDate = new Date(todayStr + 'T00:00:00');

        const diffTime = dueDate.getTime() - todayDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays >= 0 && diffDays <= 7;
      });
      logger.info('[getFilteredTodos] Week view', {
        beforeCount,
        afterCount: filtered.length,
        matchedTodos: filtered.map(t => ({ title: t.title, dueDate: t.dueDate }))
      });
    } else {
      // Custom list view
      filtered = filtered.filter((todo) => todo.listId === currentView);
      logger.info('[getFilteredTodos] Custom list view', {
        listId: currentView,
        filteredCount: filtered.length
      });
    }

    // 3. Sort function
    const sortFn = (a: Todo, b: Todo) => {
      switch (sortBy) {
        case 'priority': {
          const priorityOrder = { high: 3, medium: 2, low: 1, none: 0 };
          const aPriority = priorityOrder[a.priority] || 0;
          const bPriority = priorityOrder[b.priority] || 0;
          const result = sortOrder === 'desc'
            ? bPriority - aPriority
            : aPriority - bPriority;

          // Debug: log priority comparison
          logger.debug('[Sort] Priority', {
            aTitle: a.title,
            aPriority: a.priority,
            aPriorityValue: aPriority,
            bTitle: b.title,
            bPriority: b.priority,
            bPriorityValue: bPriority,
            sortOrder,
            result
          });

          return result;
        }

        case 'dueDate':
          if (!a.dueDate) return 1; // Items without due date go last
          if (!b.dueDate) return -1;
          return sortOrder === 'desc'
            ? new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
            : new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();

        case 'createdAt':
          return sortOrder === 'desc'
            ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

        default: // 'none'
          return 0; // Keep original order
      }
    };

    // 4. Apply sorting
    let sorted = [...filtered].sort(sortFn);

    // Debug logging for sorting
    if (sortBy !== 'none') {
      logger.info('[getFilteredTodos] Applied sorting', {
        sortBy,
        sortOrder,
        beforeCount: filtered.length,
        afterCount: sorted.length,
        sampleOrder: sorted.slice(0, 5).map(t => ({
          title: t.title,
          priority: t.priority,
          dueDate: t.dueDate,
          createdAt: t.createdAt
        }))
      });
    }

    // 5. Separate completed and active todos (after sorting)
    let activeTodos = sorted.filter((t) => !t.completed);
    let completedTodos = sorted.filter((t) => t.completed);

    // 6. Return results
    if (showCompletedAtBottom) {
      return [...activeTodos, ...completedTodos]; // Completed at bottom
    } else {
      return sorted; // Keep sorted order with completed mixed in
    }
  },
}));
