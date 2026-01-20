/**
 * Calendar Header Component
 * 日历头部组件
 */

import React from 'react';
import styles from '../CalendarView.module.css';

type CalendarMode = 'month' | 'week';

interface CalendarHeaderProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  calendarMode: CalendarMode;
  setCalendarMode: (mode: CalendarMode) => void;
}

// 格式化日期显示
const formatMonthYear = (date: Date): string => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return `${year}年 ${month}月`;
};

const formatWeekRange = (date: Date): string => {
  const weekDays = getWeekDays(date);
  const start = weekDays[0];
  const end = weekDays[6];

  const startMonth = start.getMonth() + 1;
  const endMonth = end.getMonth() + 1;

  if (startMonth === endMonth) {
    return `${start.getMonth() + 1}月 第${getWeekNumber(date)}周`;
  } else {
    return `${startMonth}月${start.getDate()}日 - ${endMonth}月${end.getDate()}日`;
  }
};

// 获取周数
const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

// 获取一周的所有日期
const getWeekDays = (date: Date): Date[] => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  const sunday = new Date(d.setDate(diff));
  const days: Date[] = [];

  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(sunday);
    nextDay.setDate(sunday.getDate() + i);
    days.push(nextDay);
  }

  return days;
};

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  setCurrentDate,
  calendarMode,
  setCalendarMode,
}) => {
  // 上一个
  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (calendarMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  // 下一个
  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (calendarMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  // 回到今天
  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className={styles.calendarHeader}>
      <div className={styles.calendarNav}>
        <button
          className={`${styles.calendarBtn} ${styles.iconBtn}`}
          onClick={handlePrev}
          title="上一个"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className={styles.calendarTitle}>
          {calendarMode === 'month' ? formatMonthYear(currentDate) : formatWeekRange(currentDate)}
        </div>

        <button
          className={`${styles.calendarBtn} ${styles.iconBtn}`}
          onClick={handleNext}
          title="下一个"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <div className={styles.calendarActions}>
        <button
          className={`${styles.calendarBtn} ${styles.primary}`}
          onClick={handleToday}
        >
          今天
        </button>

        <div className={styles.viewToggle}>
          <button
            className={`${styles.viewToggleButton} ${calendarMode === 'month' ? styles.active : ''}`}
            onClick={() => setCalendarMode('month')}
          >
            月视图
          </button>
          <button
            className={`${styles.viewToggleButton} ${calendarMode === 'week' ? styles.active : ''}`}
            onClick={() => setCalendarMode('week')}
          >
            周视图
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;
