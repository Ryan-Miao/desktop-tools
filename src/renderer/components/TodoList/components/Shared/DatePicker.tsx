import React, { useRef, useState, useEffect } from 'react';
import styles from './DatePicker.module.css';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
}

function DatePicker({ value, onChange, placeholder = '📅 选择日期' }: DatePickerProps) {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [displayValue, setDisplayValue] = useState('');

  // Format date for display
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      if (date.toDateString() === today.toDateString()) {
        setDisplayValue('今天');
      } else if (date.toDateString() === tomorrow.toDateString()) {
        setDisplayValue('明天');
      } else {
        setDisplayValue(
          date.toLocaleDateString('zh-CN', {
            month: 'short',
            day: 'numeric',
          })
        );
      }
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleClick = () => {
    const input = dateInputRef.current;
    if (input) {
      // Try to show picker (modern browsers)
      if (typeof input.showPicker === 'function') {
        input.showPicker();
      }
      // Fallback to focus
      input.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div
      className={styles.datePickerWrapper}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      title={value || placeholder}
    >
      {!displayValue && (
        <span className={styles.placeholder}>{placeholder}</span>
      )}
      <input
        ref={dateInputRef}
        type="date"
        value={value}
        onChange={handleChange}
        className={`${styles.dateInput} ${value ? styles.filled : ''}`}
      />
      {displayValue && (
        <span className={styles.displayValue}>{displayValue}</span>
      )}
    </div>
  );
}

export default DatePicker;
