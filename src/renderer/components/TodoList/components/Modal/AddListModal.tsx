import React, { useState, useEffect, useRef } from 'react';
import styles from './AddListModal.module.css';

interface AddListModalProps {
  onClose: () => void;
  onAddList: (name: string, icon: string, color: string) => void;
}

// Preset icons and colors
const PRESET_ICONS = ['📁', '📚', '💼', '🎯', '🏠', '💡', '🎨', '📊'];
const PRESET_COLORS = [
  { name: '蓝', value: '#3B82F6' },
  { name: '绿', value: '#10B981' },
  { name: '黄', value: '#F59E0B' },
  { name: '橙', value: '#F97316' },
  { name: '红', value: '#EF4444' },
  { name: '紫', value: '#8B5CF6' },
];

function AddListModal({ onClose, onAddList }: AddListModalProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📁');
  const [color, setColor] = useState('#3B82F6');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const isValid = name.trim().length > 0;

  // Auto-focus input on mount
  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  // Handle keyboard
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleSubmit = () => {
    if (!isValid) {
      setError('请输入清单名称');
      return;
    }
    onAddList(name.trim(), icon, color);
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div
      className={styles.modalOverlay}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.modalContent}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>创建新清单</h2>
          <button
            onClick={handleClose}
            className={styles.closeButton}
            aria-label="关闭"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          {/* Name Input */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>清单名称</label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="例如：工作、个人、购物清单"
              className={styles.formInput}
              maxLength={50}
            />
            {error && <p className={styles.formError}>{error}</p>}
          </div>

          {/* Icon Selector */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>图标</label>
            <div className={styles.iconSelector}>
              {PRESET_ICONS.map((presetIcon) => (
                <button
                  key={presetIcon}
                  onClick={() => setIcon(presetIcon)}
                  className={`${styles.iconButton} ${icon === presetIcon ? styles.selected : ''}`}
                  type="button"
                >
                  {presetIcon}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selector */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>颜色</label>
            <div className={styles.colorSelector}>
              {PRESET_COLORS.map((presetColor) => (
                <button
                  key={presetColor.value}
                  onClick={() => setColor(presetColor.value)}
                  className={`${styles.colorButton} ${color === presetColor.value ? styles.selected : ''}`}
                  style={{ backgroundColor: presetColor.value }}
                  title={presetColor.name}
                  type="button"
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className={styles.previewSection}>
            <label className={styles.formLabel}>预览</label>
            <div className={styles.previewList}>
              <span className={styles.previewIcon}>{icon}</span>
              <span className={styles.previewName}>{name.trim() || '清单名称'}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button onClick={handleClose} className={styles.cancelButton}>
            取消
          </button>
          <button
            onClick={handleSubmit}
            className={styles.confirmButton}
            disabled={!isValid}
          >
            创建
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddListModal;
