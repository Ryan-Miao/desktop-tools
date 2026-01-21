/**
 * Calendar Plugin
 *
 * Schedule management with reminders and events
 */

import React, { useState, useCallback, useEffect } from "react";
import PluginWindow from "../PluginWindow/PluginWindow";
import styles from "./Calendar.module.css";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  description?: string;
  color: string;
}

interface CalendarProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

const Calendar: React.FC<CalendarProps> = ({
  onClose,
  onMinimize,
  onMaximize,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: "",
    date: new Date().toISOString().split("T")[0],
    time: "09:00",
    description: "",
    color: "#3b82f6",
  });

  // Load events from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("calendar-events");
    if (saved) {
      try {
        setEvents(JSON.parse(saved));
      } catch (err) {
        console.error("Failed to load events:", err);
      }
    }
  }, []);

  // Save events to localStorage
  const saveEvents = useCallback((updatedEvents: Event[]) => {
    localStorage.setItem("calendar-events", JSON.stringify(updatedEvents));
    setEvents(updatedEvents);
  }, []);

  // Get days in month
  const getDaysInMonth = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return {
      daysInMonth,
      startingDayOfWeek,
      year,
      month,
    };
  }, []);

  // Navigate month
  const navigateMonth = useCallback((direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "next") {
        newDate.setMonth(newDate.getMonth() + 1);
      } else {
        newDate.setMonth(newDate.getMonth() - 1);
      }
      return newDate;
    });
  }, []);

  // Go to today
  const goToToday = useCallback(() => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  }, []);

  // Select date
  const selectDate = useCallback(
    (day: number) => {
      const newDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day,
      );
      setSelectedDate(newDate);
      setNewEvent((prev) => ({
        ...prev,
        date: newDate.toISOString().split("T")[0],
      }));
    },
    [currentDate],
  );

  // Check if date has events
  const hasEvents = useCallback(
    (dateStr: string) => {
      return events.some((event) => event.date === dateStr);
    },
    [events],
  );

  // Get events for selected date
  const getEventsForDate = useCallback(
    (date: Date) => {
      const dateStr = date.toISOString().split("T")[0];
      return events.filter((event) => event.date === dateStr);
    },
    [events],
  );

  // Add event
  const addEvent = useCallback(() => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) {
      return;
    }

    const event: Event = {
      id: Date.now().toString(),
      title: newEvent.title,
      date: newEvent.date!,
      time: newEvent.time!,
      description: newEvent.description,
      color: newEvent.color || "#3b82f6",
    };

    saveEvents([...events, event]);
    setNewEvent({
      title: "",
      date: new Date().toISOString().split("T")[0],
      time: "09:00",
      description: "",
      color: "#3b82f6",
    });
    setShowEventForm(false);
    announceToScreenReader("已添加新事件");
  }, [newEvent, events, saveEvents]);

  // Edit event
  const editEvent = useCallback((event: Event) => {
    setEditingEvent(event);
    setNewEvent(event);
    setShowEventForm(true);
  }, []);

  // Update event
  const updateEvent = useCallback(() => {
    if (!editingEvent || !newEvent.title || !newEvent.date || !newEvent.time) {
      return;
    }

    const updatedEvents = events.map((event) =>
      event.id === editingEvent.id
        ? {
            ...event,
            title: newEvent.title!,
            date: newEvent.date!,
            time: newEvent.time!,
            description: newEvent.description || "",
            color: newEvent.color || event.color,
          }
        : event,
    );

    saveEvents(updatedEvents);
    setEditingEvent(null);
    setNewEvent({
      title: "",
      date: new Date().toISOString().split("T")[0],
      time: "09:00",
      description: "",
      color: "#3b82f6",
    });
    setShowEventForm(false);
    announceToScreenReader("已更新事件");
  }, [editingEvent, newEvent, events, saveEvents]);

  // Delete event
  const deleteEvent = useCallback(
    (eventId: string) => {
      const updatedEvents = events.filter((event) => event.id !== eventId);
      saveEvents(updatedEvents);
      announceToScreenReader("已删除事件");
    },
    [events, saveEvents],
  );

  // Format date for display
  const formatDate = useCallback((date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    };
    return date.toLocaleDateString("zh-CN", options);
  }, []);

  // Get week day names
  const weekDays = ["日", "一", "二", "三", "四", "五", "六"];
  const { daysInMonth, startingDayOfWeek, year, month } =
    getDaysInMonth(currentDate);
  const selectedDateEvents = getEventsForDate(selectedDate);

  return (
    <PluginWindow
      title="日历日程"
      icon="📅"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      className="calendar-standalone"
      pluginId="calendar"
      showStandaloneButton={false}
    >
      <div className={styles.calendar}>
        {/* Header */}
        <div className={styles.header}>
          <button
            onClick={() => navigateMonth("prev")}
            className={styles.navButton}
            aria-label="上个月"
          >
            ◀
          </button>
          <h2>
            {year}年 {month + 1}月
          </h2>
          <button
            onClick={() => navigateMonth("next")}
            className={styles.navButton}
            aria-label="下个月"
          >
            ▶
          </button>
        </div>

        <div className={styles.headerActions}>
          <button
            onClick={goToToday}
            className={styles.todayButton}
            aria-label="回到今天"
          >
            今天
          </button>
          <button
            onClick={() => {
              setEditingEvent(null);
              setNewEvent({
                title: "",
                date: selectedDate.toISOString().split("T")[0],
                time: "09:00",
                description: "",
                color: "#3b82f6",
              });
              setShowEventForm(true);
            }}
            className={styles.addButton}
            aria-label="添加新事件"
          >
            ➕ 添加事件
          </button>
        </div>

        {/* Calendar Grid */}
        <div className={styles.calendarGrid}>
          {/* Week day headers */}
          <div className={styles.weekDays}>
            {weekDays.map((day) => (
              <div key={day} className={styles.weekDay}>
                {day}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className={styles.days}>
            {/* Empty cells before first day */}
            {Array.from({ length: startingDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className={styles.dayCell} />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isToday =
                day === new Date().getDate() &&
                month === new Date().getMonth() &&
                year === new Date().getFullYear();
              const isSelected =
                day === selectedDate.getDate() &&
                month === selectedDate.getMonth() &&
                year === selectedDate.getFullYear();
              const hasEvent = hasEvents(dateStr);

              return (
                <button
                  key={day}
                  onClick={() => selectDate(day)}
                  className={`${styles.dayCell} ${isToday ? styles.today : ""} ${
                    isSelected ? styles.selected : ""
                  } ${hasEvent ? styles.hasEvent : ""}`}
                  aria-label={`${month + 1}月${day}日${hasEvent ? "有事件" : ""}`}
                  aria-pressed={isSelected}
                >
                  <span className={styles.dayNumber}>{day}</span>
                  {hasEvent && <span className={styles.eventIndicator} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Events */}
        <div className={styles.eventsSection}>
          <h3>{formatDate(selectedDate)}</h3>
          {selectedDateEvents.length > 0 ? (
            <div className={styles.eventsList}>
              {selectedDateEvents
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((event) => (
                  <div
                    key={event.id}
                    className={styles.eventCard}
                    style={{ borderLeftColor: event.color }}
                  >
                    <div className={styles.eventHeader}>
                      <div className={styles.eventTime}>🕐 {event.time}</div>
                      <div className={styles.eventActions}>
                        <button
                          onClick={() => editEvent(event)}
                          className={styles.eventAction}
                          aria-label={`编辑${event.title}`}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteEvent(event.id)}
                          className={styles.eventAction}
                          aria-label={`删除${event.title}`}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <h4 className={styles.eventTitle}>{event.title}</h4>
                    {event.description && (
                      <p className={styles.eventDescription}>
                        {event.description}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          ) : (
            <p className={styles.noEvents}>今天没有安排</p>
          )}
        </div>

        {/* Event Form Modal */}
        {showEventForm && (
          <div className={styles.modal} onClick={() => setShowEventForm(false)}>
            <div
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>{editingEvent ? "编辑事件" : "添加新事件"}</h3>

              <div className={styles.formGroup}>
                <label htmlFor="event-title">标题 *</label>
                <input
                  id="event-title"
                  type="text"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                  className={styles.input}
                  placeholder="事件标题"
                  autoFocus
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="event-date">日期 *</label>
                  <input
                    id="event-date"
                    type="date"
                    value={newEvent.date}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, date: e.target.value })
                    }
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="event-time">时间 *</label>
                  <input
                    id="event-time"
                    type="time"
                    value={newEvent.time}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, time: e.target.value })
                    }
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="event-color">颜色</label>
                <div className={styles.colorPicker}>
                  {[
                    "#3b82f6",
                    "#10b981",
                    "#f59e0b",
                    "#ef4444",
                    "#8b5cf6",
                    "#ec4899",
                  ].map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewEvent({ ...newEvent, color })}
                      className={`${styles.colorButton} ${
                        newEvent.color === color ? styles.colorButtonActive : ""
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={`选择颜色 ${color}`}
                      aria-pressed={newEvent.color === color}
                    />
                  ))}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="event-description">描述</label>
                <textarea
                  id="event-description"
                  value={newEvent.description}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, description: e.target.value })
                  }
                  className={styles.textarea}
                  placeholder="事件描述（可选）"
                  rows={3}
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  onClick={() => {
                    setShowEventForm(false);
                    setEditingEvent(null);
                  }}
                  className={styles.cancelButton}
                >
                  取消
                </button>
                <button
                  onClick={editingEvent ? updateEvent : addEvent}
                  className={styles.saveButton}
                >
                  {editingEvent ? "更新" : "添加"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PluginWindow>
  );
};

// Screen reader announcement helper
function announceToScreenReader(message: string) {
  const announcement = document.createElement("div");
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", "polite");
  announcement.className = "sr-only";
  announcement.style.position = "absolute";
  announcement.style.left = "-10000px";
  announcement.style.width = "1px";
  announcement.style.height = "1px";
  announcement.style.overflow = "hidden";
  announcement.textContent = message;
  document.body.appendChild(announcement);
  setTimeout(() => document.body.removeChild(announcement), 1000);
}

export default Calendar;
