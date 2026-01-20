/**
 * Kanban View Component
 * 看板视图，支持拖拽修改任务状态
 */

import React, { useState } from 'react';
import { useTodoStore } from '@renderer/components/TodoList/store/useTodoStore';
import styles from './KanbanView.module.css';

interface KanbanViewProps {
  onTodoClick: (todoId: string) => void;
}

type ColumnType = 'todo' | 'in-progress' | 'done';

interface KanbanColumn {
  id: ColumnType;
  title: string;
  color: string;
}

const COLUMNS: KanbanColumn[] = [
  { id: 'todo', title: '待办', color: '#6B7280' },
  { id: 'in-progress', title: '进行中', color: '#3B82F6' },
  { id: 'done', title: '已完成', color: '#10B981' }
];

const KanbanView: React.FC<KanbanViewProps> = ({ onTodoClick }) => {
  const todos = useTodoStore((state) => state.todos);
  const updateTodoStatus = useTodoStore((state) => state.updateTodoStatus);
  const getFilteredTodos = useTodoStore((state) => state.getFilteredTodos);
  const currentView = useTodoStore((state) => state.currentView);

  const [draggedTodoId, setDraggedTodoId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<ColumnType | null>(null);

  // 获取当前视图的任务
  const filteredTodos = getFilteredTodos();

  // 按列分组任务
  const getTodosByColumn = (columnId: ColumnType) => {
    return filteredTodos.filter(todo => {
      // 如果任务有状态，使用状态
      if (todo.status) {
        return todo.status === columnId;
      }
      // 否则根据 completed 字段判断
      if (columnId === 'done') return todo.completed;
      if (columnId === 'in-progress') return !todo.completed;
      return !todo.completed;
    });
  };

  // 拖拽开始
  const handleDragStart = (e: React.DragEvent, todoId: string) => {
    setDraggedTodoId(todoId);
    e.dataTransfer.effectAllowed = 'move';
  };

  // 拖拽结束
  const handleDragEnd = () => {
    setDraggedTodoId(null);
    setDragOverColumn(null);
  };

  // 拖拽经过
  const handleDragOver = (e: React.DragEvent, columnId: ColumnType) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  // 放置
  const handleDrop = (e: React.DragEvent, columnId: ColumnType) => {
    e.preventDefault();
    if (draggedTodoId) {
      updateTodoStatus(draggedTodoId, columnId);
    }
    setDraggedTodoId(null);
    setDragOverColumn(null);
  };

  return (
    <div className={styles.kanbanView}>
      {COLUMNS.map((column) => {
        const columnTodos = getTodosByColumn(column.id);

        return (
          <div
            key={column.id}
            className={`${styles.column} ${dragOverColumn === column.id ? styles.dragOver : ''}`}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* 列标题 */}
            <div className={styles.columnHeader} style={{ borderTopColor: column.color }}>
              <h3 className={styles.columnTitle}>{column.title}</h3>
              <span className={styles.columnCount}>{columnTodos.length}</span>
            </div>

            {/* 任务列表 */}
            <div className={styles.taskList}>
              {columnTodos.length === 0 ? (
                <div className={styles.emptyColumn}>
                  暂无任务
                </div>
              ) : (
                columnTodos.map((todo) => (
                  <div
                    key={todo.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, todo.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onTodoClick(todo.id)}
                    className={`${styles.taskCard} ${todo.priority !== 'none' ? styles[todo.priority] : ''} ${draggedTodoId === todo.id ? styles.dragging : ''}`}
                  >
                    {/* 优先级指示器 */}
                    {todo.priority !== 'none' && (
                      <div className={styles.priorityIndicator} style={{
                        backgroundColor: todo.priority === 'high' ? '#EF4444' :
                                          todo.priority === 'medium' ? '#F59E0B' : '#10B981'
                      }} />
                    )}

                    {/* 任务标题 */}
                    <h4 className={styles.taskTitle}>{todo.title}</h4>

                    {/* 任务元数据 */}
                    <div className={styles.taskMeta}>
                      {todo.dueDate && (
                        <span className={styles.dueDate}>
                          📅 {todo.dueDate}
                        </span>
                      )}
                      {todo.subtasks && todo.subtasks.length > 0 && (
                        <span className={styles.subtasks}>
                          ✓ {todo.subtasks.filter(st => st.completed).length}/{todo.subtasks.length}
                        </span>
                      )}
                    </div>

                    {/* 描述预览 */}
                    {todo.description && (
                      <p className={styles.taskDescription}>
                        {todo.description}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanView;
