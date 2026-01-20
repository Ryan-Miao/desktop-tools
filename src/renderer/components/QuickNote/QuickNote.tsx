/**
 * Quick Note Plugin
 *
 * Quick scratchpad for notes and thoughts
 */

import React, { useState, useCallback, useEffect } from 'react';
import PluginWindow from '../PluginWindow/PluginWindow';
import styles from './QuickNote.module.css';

interface QuickNoteProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

const QuickNote: React.FC<QuickNoteProps> = ({ onClose, onMinimize, onMaximize }) => {
  const [notes, setNotes] = useState<string[]>([]);
  const [activeNoteIndex, setActiveNoteIndex] = useState<number>(-1);
  const [activeNote, setActiveNote] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Load notes from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('quick-notes');
    if (saved) {
      try {
        const parsedNotes = JSON.parse(saved);
        setNotes(parsedNotes);
        if (parsedNotes.length > 0) {
          setActiveNoteIndex(0);
          setActiveNote(parsedNotes[0]);
        }
      } catch (err) {
        console.error('Failed to load notes:', err);
      }
    }
  }, []);

  // Save notes to localStorage
  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem('quick-notes', JSON.stringify(notes));
    }
  }, [notes]);

  // Auto-save active note
  useEffect(() => {
    if (activeNoteIndex >= 0) {
      setNotes(prev => {
        const updated = [...prev];
        updated[activeNoteIndex] = activeNote;
        return updated;
      });
    }
  }, [activeNote, activeNoteIndex]);

  // Create new note
  const createNote = useCallback(() => {
    const newNote = '';
    setNotes(prev => [...prev, newNote]);
    setActiveNoteIndex(notes.length);
    setActiveNote(newNote);
    announceToScreenReader('已创建新笔记');
  }, [notes.length]);

  // Delete note
  const deleteNote = useCallback(
    (index: number) => {
      if (notes.length <= 1) {
        setNotes(['']);
        setActiveNoteIndex(0);
        setActiveNote('');
      } else {
        const updated = notes.filter((_, i) => i !== index);
        setNotes(updated);
        if (activeNoteIndex === index) {
          setActiveNoteIndex(0);
          setActiveNote(updated[0]);
        } else if (activeNoteIndex > index) {
          setActiveNoteIndex(activeNoteIndex - 1);
        }
      }
      announceToScreenReader('已删除笔记');
    },
    [notes, activeNoteIndex]
  );

  // Select note
  const selectNote = useCallback((index: number) => {
    setActiveNoteIndex(index);
    setActiveNote(notes[index]);
  }, [notes]);

  // Copy note
  const copyNote = useCallback(async () => {
    if (!activeNote) return;

    try {
      await navigator.clipboard.writeText(activeNote);
      announceToScreenReader('已复制笔记内容');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [activeNote]);

  // Clear note
  const clearNote = useCallback(() => {
    setActiveNote('');
    announceToScreenReader('已清空笔记');
  }, []);

  // Filter notes by search
  const filteredNotes = useCallback(() => {
    if (!searchQuery.trim()) return notes.map((note, index) => ({ note, index }));

    return notes
      .map((note, index) => ({ note, index }))
      .filter(({ note }) => note.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [notes, searchQuery]);

  // Get word count
  const wordCount = useCallback(() => {
    return activeNote.trim().split(/\s+/).filter(word => word.length > 0).length;
  }, [activeNote]);

  // Get character count
  const charCount = useCallback(() => {
    return activeNote.length;
  }, [activeNote]);

  return (
    <PluginWindow
      title="快速笔记"
      icon="📝"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      className="quicknote-standalone"
      pluginId="quicknote"
      showStandaloneButton={false}
    >
      <div className={styles.quickNote}>
        {/* Header */}
        <div className={styles.header}>
          <h3>快速笔记</h3>
          <div className={styles.stats}>
            <span>{wordCount()} 词</span>
            <span>•</span>
            <span>{charCount()} 字符</span>
          </div>
        </div>

        {/* Search */}
        <div className={styles.search}>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="搜索笔记..."
            className={styles.searchInput}
          />
        </div>

        <div className={styles.content}>
          {/* Notes List */}
          <div className={styles.notesList}>
            <div className={styles.notesListHeader}>
              <span>笔记 ({filteredNotes().length})</span>
              <button
                onClick={createNote}
                className={styles.newButton}
                aria-label="新建笔记"
              >
                ➕ 新建
              </button>
            </div>

            <div className={styles.notesListContent}>
              {filteredNotes().map(({ note, index }) => (
                <div
                  key={index}
                  className={`${styles.noteItem} ${
                    activeNoteIndex === index ? styles.active : ''
                  }`}
                  onClick={() => selectNote(index)}
                >
                  <div className={styles.noteItemHeader}>
                    <span className={styles.noteItemTitle}>
                      {note.split('\n')[0]?.substring(0, 30) || '空白笔记'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(index);
                      }}
                      className={styles.deleteButton}
                      aria-label="删除笔记"
                    >
                      🗑️
                    </button>
                  </div>
                  <span className={styles.noteItemPreview}>
                    {note.substring(0, 50)}
                    {note.length > 50 && '...'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Note Editor */}
          <div className={styles.noteEditor}>
            <div className={styles.noteEditorHeader}>
              <span className={styles.noteTitle}>
                笔记 {activeNoteIndex + 1}
              </span>
              <div className={styles.noteEditorActions}>
                <button
                  onClick={copyNote}
                  className={styles.actionButton}
                  disabled={!activeNote}
                  aria-label="复制笔记"
                >
                  📋
                </button>
                <button
                  onClick={clearNote}
                  className={styles.actionButton}
                  disabled={!activeNote}
                  aria-label="清空笔记"
                >
                  🗑️
                </button>
              </div>
            </div>

            <textarea
              value={activeNote}
              onChange={(e) => setActiveNote(e.target.value)}
              placeholder="开始输入您的笔记..."
              className={styles.noteTextarea}
              aria-label="笔记内容"
            />

            <div className={styles.noteFooter}>
              <span className={styles.noteHint}>
                💡 自动保存已启用
              </span>
            </div>
          </div>
        </div>
      </div>
    </PluginWindow>
  );
};

// Screen reader announcement helper
function announceToScreenReader(message: string) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.className = 'sr-only';
  announcement.style.position = 'absolute';
  announcement.style.left = '-10000px';
  announcement.style.width = '1px';
  announcement.style.height = '1px';
  announcement.style.overflow = 'hidden';
  announcement.textContent = message;
  document.body.appendChild(announcement);
  setTimeout(() => document.body.removeChild(announcement), 1000);
}

export default QuickNote;
