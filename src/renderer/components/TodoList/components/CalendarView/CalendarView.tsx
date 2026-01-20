/**
 * Calendar View Component
 * 日历视图主组件
 */

import React, { useState } from 'react';
import { useTodoStore } from '@renderer/components/TodoList/store/useTodoStore';
import MonthView from './components/MonthView';
import WeekView from './components/WeekView';
import CalendarHeader from './components/CalendarHeader';
import styles from './CalendarView.module.css';

type CalendarMode = 'month' | 'week';

interface CalendarViewProps {
  onTodoClick?: (todoId: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ onTodoClick }) => {
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const getFilteredTodos = useTodoStore((state) => state.getFilteredTodos);

  const filteredTodos = getFilteredTodos();

  // 按日期分组任务
  const getTodosForDate = (dateStr: string) => {
    return filteredTodos.filter(todo => todo.dueDate === dateStr);
  };

  // 处理日期点击
  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    console.log('Date clicked:', dateStr);
    // TODO: 打开创建任务对话框或显示任务列表
  };

  // 处理任务点击
  const handleTaskClick = (todoId: string) => {
    console.log('Task clicked:', todoId);
    if (onTodoClick) {
      onTodoClick(todoId);
    }
  };

  return (
    <div className={styles.calendarView}>
      <CalendarHeader
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        calendarMode={calendarMode}
        setCalendarMode={setCalendarMode}
      />

      {calendarMode === 'month' ? (
        <MonthView
          currentDate={currentDate}
          onDateClick={handleDateClick}
          onTaskClick={handleTaskClick}
          getTodosForDate={getTodosForDate}
          selectedDate={selectedDate}
        />
      ) : (
        <WeekView
          currentDate={currentDate}
          onDateClick={handleDateClick}
          onTaskClick={handleTaskClick}
          getTodosForDate={getTodosForDate}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
};

export default CalendarView;
