import React, { useEffect, useCallback } from 'react';
import './SearchBox.css';

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onEnter?: () => void;
}

const SearchBox: React.FC<SearchBoxProps> = ({ value, onChange, placeholder = '搜索插件...', onEnter }) => {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && value) {
      onChange('');
    }
    if (e.key === 'Enter' && onEnter) {
      onEnter();
    }
  }, [value, onChange, onEnter]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className="search-box">
      <svg className="search-icon" viewBox="0 0 20 20" fill="none">
        <path
          d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="search-input"
        autoFocus
      />
      {value && (
        <button
          className="search-clear"
          onClick={() => onChange('')}
          title="按 ESC 清空"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default SearchBox;
