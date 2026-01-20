/**
 * Week View Component
 * 周视图组件
 */

import React from 'react';
import { Todo } from '../../../store/useTodoStore';
import styles from '../CalendarView.module.css';

interface WeekViewProps {
  currentDate: Date;
  onDateClick: (dateStr: string) => void;
  onTaskClick: (todoId: string) => void;
  getTodosForDate: (dateStr: string) => Todo[];
  selectedDate: string | null;
}

// 辅助函数：格式化日期为 YYYY-MM-DD
const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 获取一周的所有日期
const getWeekDays = (date: Date): Date[] => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day; // 周日作为第一天
  const sunday = new Date(d.setDate(diff));
  const days: Date[] = [];

  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(sunday);
    nextDay.setDate(sunday.getDate() + i);
    days.push(nextDay);
  }

  return days;
};

// 星期标题
const WEEK_DAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  onDateClick,
  onTaskClick,
  getTodosForDate,
  selectedDate,
}) => {
  const today = new Date();
  const todayStr = formatDateKey(today);
  const weekDays = getWeekDays(currentDate);

  return (
    <div className={styles.weekView}>
      {weekDays.map((date, index) => {
        const dateStr = formatDateKey(date);
        const isToday = dateStr === todayStr;
        const isSelected = dateStr === selectedDate;
        const todos = getTodosForDate(dateStr);

        return (
          <div
            key={dateStr}
            className={`${styles.weekDayColumn} ${isToday ? styles.today : ''} ${isSelected ? styles.selected : ''}`}
            onClick={() => onDateClick(dateStr)}
          >
            <div className={styles.weekDayHeader}>
              {WEEK_DAYS[index]}
            </div>
            <div className={styles.weekDateNumber}>
              {date.getMonth() + 1}/{date.getDate()}
            </div>

            <div className={styles.weekTaskList}>
              {todos.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  color: 'var(--text-tertiary)',
                  fontSize: '0.8125rem',
                  padding: '2rem 1rem',
                  opacity: 0.7,
                  fontStyle: 'italic'
                }}>
                  暂无任务
                </div>
              ) : (
                todos.map((todo) => (
                  <div
                    key={todo.id}
                    className={`${styles.weekTaskCard} ${styles[todo.priority]} ${todo.completed ? styles.completed : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTaskClick(todo.id);
                    }}
                    title={todo.title}
                  >
                    <span className={styles.taskTitle}>{todo.title}</span>
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

export default WeekView;
