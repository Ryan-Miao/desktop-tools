/**
 * Month View Component
 * 月视图组件
 */

import React from 'react';
import { Todo } from '../../../store/useTodoStore';
import styles from '../CalendarView.module.css';

interface MonthViewProps {
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

// 获取月份的第一天是星期几 (0-6)
const getFirstDayOfMonth = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
};

// 获取月份的天数
const getDaysInMonth = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

// 获取月份的所有日期（包括前后月份的填充）
const getMonthDays = (date: Date): Date[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = getFirstDayOfMonth(date);
  const daysInMonth = getDaysInMonth(date);
  const days: Date[] = [];

  // 前一个月的填充
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push(new Date(year, month - 1, prevMonthDays - i));
  }

  // 当前月份
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  // 下一个月的填充（补齐到42天，6行）
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push(new Date(year, month + 1, i));
  }

  return days;
};

// 星期标题
const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六'];

const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  onDateClick,
  onTaskClick,
  getTodosForDate,
  selectedDate,
}) => {
  const today = new Date();
  const todayStr = formatDateKey(today);

  // 获取月份的所有日期
  const monthDays = getMonthDays(currentDate);
  const currentMonth = currentDate.getMonth();

  return (
    <div className={styles.monthView}>
      {/* 星期标题 */}
      {WEEK_DAYS.map((day) => (
        <div key={day} className={styles.weekDayHeader}>
          {day}
        </div>
      ))}

      {/* 日期格子 */}
      {monthDays.map((date, index) => {
        const dateStr = formatDateKey(date);
        const isCurrentMonth = date.getMonth() === currentMonth;
        const isToday = dateStr === todayStr;
        const isSelected = dateStr === selectedDate;
        const todos = getTodosForDate(dateStr);

        return (
          <div
            key={`${dateStr}-${index}`}
            className={`${styles.dayCell} ${!isCurrentMonth ? styles.otherMonth : ''} ${isToday ? styles.today : ''} ${isSelected ? styles.selected : ''}`}
            onClick={() => onDateClick(dateStr)}
          >
            <div className={styles.dayNumber}>{date.getDate()}</div>

            {/* 任务预览 */}
            {todos.slice(0, 3).map((todo) => (
              <div
                key={todo.id}
                className={`${styles.taskPreview} ${styles[todo.priority]}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onTaskClick(todo.id);
                }}
                title={todo.title}
              >
                {todo.title}
              </div>
            ))}

            {/* 显示更多任务提示 */}
            {todos.length > 3 && (
              <div className={styles.taskPreview} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)' }}>
                +{todos.length - 3} 更多
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MonthView;
