import React, { useState, useCallback, useEffect } from "react";
import { createLogger } from "../../shared/logger";
import { fileStorageService } from "../services/FileStorageService";
import { PluginManifest } from "../../shared/types/plugin";
import PluginWindow from "./PluginWindow/PluginWindow";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./Notepad.css";

const logger = createLogger("Notepad");

interface NotepadProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

// Activity event types for note history
type ActivityEventType =
  | "CREATED"
  | "UPDATED_TITLE"
  | "UPDATED_CONTENT"
  | "DELETED";

interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  timestamp: string;
  description: string;
  changes?: {
    field?: string;
    oldValue?: string;
    newValue?: string;
  };
}

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  activityHistory?: ActivityEvent[];
}

const PLUGIN_ID = "notepad";
const STORAGE_KEY = "notepad-notes"; // For migration only

function Notepad({ onClose, onMinimize, onMaximize }: NotepadProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // Helper function to create activity event
  const createActivityEvent = (
    type: ActivityEventType,
    description: string,
    changes?: ActivityEvent["changes"],
  ): ActivityEvent => ({
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    timestamp: new Date().toISOString(),
    description,
    changes,
  });

  // Helper function to add activity to note
  const addActivityToNote = (
    note: Note,
    type: ActivityEventType,
    description: string,
    changes?: ActivityEvent["changes"],
  ): Note => {
    const newEvent = createActivityEvent(type, description, changes);
    const history = note.activityHistory || [];

    // Limit history to 50 events
    const updatedHistory = [newEvent, ...history].slice(0, 50);

    return {
      ...note,
      activityHistory: updatedHistory,
    };
  };

  // Format relative time for display
  const formatRelativeTime = (timestamp: string): string => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "刚刚";
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays === 1) return "昨天";
    if (diffDays < 7) return `${diffDays}天前`;

    return time.toLocaleDateString("zh-CN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Load notes from file storage (with localStorage migration)
  useEffect(() => {
    const loadNotes = async () => {
      try {
        // Try to load from file storage first
        let data = await fileStorageService.loadPluginData<Note[]>(PLUGIN_ID);

        if (data && Array.isArray(data)) {
          setNotes(data);
          logger.info("[Notepad] Loaded notes from file storage:", data.length);
        } else {
          // File storage not found, try localStorage migration
          const localStorageData = localStorage.getItem(STORAGE_KEY);
          if (localStorageData) {
            try {
              const parsed = JSON.parse(localStorageData);
              if (Array.isArray(parsed)) {
                setNotes(parsed);
                // Save to file storage
                await fileStorageService.savePluginData(PLUGIN_ID, parsed);
                // Create backup
                localStorage.setItem(
                  `${STORAGE_KEY}-migrated-backup`,
                  localStorageData,
                );
                logger.info(
                  "[Notepad] Migrated notes from localStorage:",
                  parsed.length,
                );
              }
            } catch (parseErr) {
              logger.error(
                "[Notepad] Failed to parse localStorage data:",
                parseErr,
              );
              setNotes([]);
            }
          } else {
            logger.info("[Notepad] No existing notes found, starting fresh");
            setNotes([]);
          }
        }
      } catch (err) {
        logger.error("[Notepad] Failed to load notes:", err);
        // Fallback to empty notes array
        setNotes([]);
      }
    };

    loadNotes();
  }, []);

  // Save notes to file storage (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (notes.length > 0) {
        fileStorageService.savePluginData(PLUGIN_ID, notes);
        logger.debug("[Notepad] Saved notes to file storage");
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [notes]);

  // Create new note
  const createNote = useCallback(() => {
    const baseNote: Note = {
      id: Date.now().toString(),
      title: "新建笔记",
      content: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add creation activity
    const newNote = addActivityToNote(baseNote, "CREATED", "创建了笔记", {
      field: "title",
      newValue: "新建笔记",
    });

    setNotes((prev) => [newNote, ...prev]);
    setSelectedId(newNote.id);
    setTitle("新建笔记");
    setContent("");
    setIsPreviewMode(false);
    setShowHistory(false);
  }, []);

  // Update note
  const updateNote = useCallback(() => {
    if (!selectedId) return;

    setNotes((prev) =>
      prev.map((note) => {
        if (note.id === selectedId) {
          let updatedNote = {
            ...note,
            title,
            content,
            updatedAt: new Date().toISOString(),
          };

          // Track title changes
          if (note.title !== title) {
            updatedNote = addActivityToNote(
              updatedNote,
              "UPDATED_TITLE",
              "修改了标题",
              {
                field: "title",
                oldValue: note.title,
                newValue: title,
              },
            );
          }

          // Track content changes (only if content was not empty and has meaningful changes)
          if (note.content !== content && content.length > 0) {
            // Simple heuristic: only track if change is more than just whitespace
            const oldContentTrimmed = note.content.trim();
            const newContentTrimmed = content.trim();

            if (
              oldContentTrimmed !== newContentTrimmed &&
              newContentTrimmed.length > 0
            ) {
              // Show preview of changes (first 50 chars)
              updatedNote = addActivityToNote(
                updatedNote,
                "UPDATED_CONTENT",
                "修改了内容",
                {
                  field: "content",
                  oldValue:
                    oldContentTrimmed.slice(0, 50) +
                    (oldContentTrimmed.length > 50 ? "..." : ""),
                  newValue:
                    newContentTrimmed.slice(0, 50) +
                    (newContentTrimmed.length > 50 ? "..." : ""),
                },
              );
            }
          }

          return updatedNote;
        }
        return note;
      }),
    );
  }, [selectedId, title, content]);

  // Delete note
  const deleteNote = useCallback(
    (id: string) => {
      if (notes.length === 0) return;
      setNotes((prev) => prev.filter((note) => note.id !== id));
      if (selectedId === id) {
        setSelectedId(null);
        setTitle("");
        setContent("");
      }
    },
    [notes.length, selectedId],
  );

  // Select note
  const selectNote = useCallback((note: Note) => {
    setSelectedId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setIsPreviewMode(false);
    setShowHistory(false);
  }, []);

  // Export note as .txt file
  const exportNote = useCallback((note: Note) => {
    const text = `${note.title}\n\n创建时间: ${new Date(note.createdAt).toLocaleString()}\n更新时间: ${new Date(note.updatedAt).toLocaleString()}\n\n${note.content}`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${note.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // Auto-save on content change
  useEffect(() => {
    if (selectedId) {
      const timer = setTimeout(() => {
        updateNote();
      }, 500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [title, content, selectedId, updateNote]);

  const selectedNote = notes.find((n) => n.id === selectedId);

  return (
    <PluginWindow
      title="记事本"
      icon="📝"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      pluginId="com.desktop-tool.plugin.notepad"
    >
      <div className="notepad-content">
        {/* Note List */}
        <div className="notepad-sidebar">
          <div className="notepad-sidebar-header">
            <h3>我的笔记</h3>
            <button onClick={createNote} className="notepad-btn-new">
              + 新建
            </button>
          </div>
          <div className="notepad-list">
            {notes.length === 0 ? (
              <div className="notepad-empty">
                <p>暂无笔记</p>
                <p className="notepad-empty-hint">点击"新建"创建第一条笔记</p>
              </div>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  className={`notepad-item ${selectedId === note.id ? "notepad-item-selected" : ""}`}
                  onClick={() => selectNote(note)}
                >
                  <div className="notepad-item-title">
                    {note.title || "无标题"}
                  </div>
                  <div className="notepad-item-preview">
                    {note.content.slice(0, 50) || "空白笔记"}
                  </div>
                  <div className="notepad-item-date">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="notepad-editor">
          {selectedNote ? (
            <>
              <div className="notepad-editor-header">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="笔记标题"
                  className="notepad-title-input"
                />
                <div className="notepad-editor-actions">
                  <button
                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                    className={`notepad-btn-toggle ${isPreviewMode ? "notepad-btn-toggle-active" : ""}`}
                    title={isPreviewMode ? "切换到编辑模式" : "切换到预览模式"}
                  >
                    {isPreviewMode ? "✏️ 编辑" : "👁️ 预览"}
                  </button>
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className={`notepad-btn-toggle ${showHistory ? "notepad-btn-toggle-active" : ""}`}
                    title="查看修改历史"
                  >
                    🕜 历史
                  </button>
                  <button
                    onClick={() => exportNote(selectedNote)}
                    className="notepad-btn-export"
                    title="导出为 .txt 文件"
                  >
                    📥 导出
                  </button>
                  <button
                    onClick={() => deleteNote(selectedNote.id)}
                    className="notepad-btn-delete"
                    title="删除笔记"
                  >
                    🗑️ 删除
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className="notepad-content-area">
                {/* Editor or Preview */}
                {!isPreviewMode ? (
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="在此输入笔记内容... (支持Markdown语法)"
                    className="notepad-content-textarea"
                  />
                ) : (
                  <div className="notepad-content-preview">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => (
                          <p
                            style={{ marginBottom: "0.5em", lineHeight: "1.6" }}
                          >
                            {children}
                          </p>
                        ),
                        h1: ({ children }) => (
                          <h1
                            style={{
                              fontSize: "1.8em",
                              fontWeight: "bold",
                              marginBottom: "0.5em",
                              borderBottom: "2px solid var(--border)",
                              paddingBottom: "0.3em",
                            }}
                          >
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2
                            style={{
                              fontSize: "1.5em",
                              fontWeight: "bold",
                              marginBottom: "0.5em",
                              borderBottom: "1px solid var(--border)",
                              paddingBottom: "0.2em",
                            }}
                          >
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3
                            style={{
                              fontSize: "1.3em",
                              fontWeight: "bold",
                              marginBottom: "0.5em",
                            }}
                          >
                            {children}
                          </h3>
                        ),
                        h4: ({ children }) => (
                          <h4
                            style={{
                              fontSize: "1.1em",
                              fontWeight: "bold",
                              marginBottom: "0.5em",
                            }}
                          >
                            {children}
                          </h4>
                        ),
                        ul: ({ children }) => (
                          <ul
                            style={{
                              marginLeft: "1.5em",
                              marginBottom: "0.5em",
                            }}
                          >
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol
                            style={{
                              marginLeft: "1.5em",
                              marginBottom: "0.5em",
                            }}
                          >
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li style={{ marginBottom: "0.25em" }}>{children}</li>
                        ),
                        code: ({ inline, children }: any) =>
                          inline ? (
                            <code
                              style={{
                                background: "rgba(0, 0, 0, 0.05)",
                                padding: "0.2em 0.4em",
                                borderRadius: "3px",
                                fontFamily: "'Consolas', 'Monaco', monospace",
                                fontSize: "0.9em",
                                color: "#e83e8c",
                              }}
                            >
                              {children}
                            </code>
                          ) : (
                            <code
                              style={{
                                display: "block",
                                background: "#f6f8fa",
                                padding: "1em",
                                borderRadius: "6px",
                                fontFamily: "'Consolas', 'Monaco', monospace",
                                fontSize: "0.85em",
                                overflowX: "auto",
                                whiteSpace: "pre-wrap",
                                border: "1px solid #e1e4e8",
                              }}
                            >
                              {children}
                            </code>
                          ),
                        pre: ({ children }) => (
                          <pre
                            style={{
                              background: "#f6f8fa",
                              padding: "1em",
                              borderRadius: "6px",
                              overflowX: "auto",
                              marginBottom: "1em",
                            }}
                          >
                            {children}
                          </pre>
                        ),
                        a: ({ href, children }) => (
                          <a
                            href={href}
                            style={{
                              color: "#0366d6",
                              textDecoration: "underline",
                            }}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {children}
                          </a>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote
                            style={{
                              borderLeft: "4px solid #dfe2e5",
                              paddingLeft: "1em",
                              fontStyle: "italic",
                              color: "#6a737d",
                              marginBottom: "0.5em",
                            }}
                          >
                            {children}
                          </blockquote>
                        ),
                        hr: () => (
                          <hr
                            style={{
                              border: "none",
                              borderTop: "2px solid #e1e4e8",
                              margin: "1.5em 0",
                            }}
                          />
                        ),
                        table: ({ children }) => (
                          <div
                            style={{ overflowX: "auto", marginBottom: "1em" }}
                          >
                            <table
                              style={{
                                borderCollapse: "collapse",
                                width: "100%",
                                border: "1px solid #dfe2e5",
                              }}
                            >
                              {children}
                            </table>
                          </div>
                        ),
                        th: ({ children }) => (
                          <th
                            style={{
                              border: "1px solid #dfe2e5",
                              padding: "0.5em",
                              background: "#f6f8fa",
                              textAlign: "left",
                              fontWeight: "600",
                            }}
                          >
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td
                            style={{
                              border: "1px solid #dfe2e5",
                              padding: "0.5em",
                            }}
                          >
                            {children}
                          </td>
                        ),
                        img: ({ src, alt }) => (
                          <img
                            src={src}
                            alt={alt}
                            style={{ maxWidth: "100%", height: "auto" }}
                          />
                        ),
                        strong: ({ children }) => (
                          <strong
                            style={{ fontWeight: "600", color: "#24292e" }}
                          >
                            {children}
                          </strong>
                        ),
                        em: ({ children }) => (
                          <em style={{ fontStyle: "italic" }}>{children}</em>
                        ),
                      }}
                    >
                      {content || "*空笔记*"}
                    </ReactMarkdown>
                  </div>
                )}

                {/* Activity History Panel */}
                {showHistory && (
                  <div className="notepad-history-panel">
                    <div className="notepad-history-header">
                      <h4>修改历史</h4>
                      <button
                        onClick={() => setShowHistory(false)}
                        className="notepad-history-close"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="notepad-history-list">
                      {selectedNote.activityHistory &&
                      selectedNote.activityHistory.length > 0 ? (
                        selectedNote.activityHistory.map((activity) => (
                          <div
                            key={activity.id}
                            className="notepad-history-item"
                          >
                            <div className="notepad-history-time">
                              {formatRelativeTime(activity.timestamp)}
                            </div>
                            <div className="notepad-history-description">
                              {activity.description}
                            </div>
                            {activity.changes && (
                              <div className="notepad-history-changes">
                                {activity.changes.oldValue && (
                                  <div className="notepad-history-change">
                                    <span className="notepad-history-change-label">
                                      旧值:
                                    </span>
                                    <span className="notepad-history-change-old">
                                      {activity.changes.oldValue}
                                    </span>
                                  </div>
                                )}
                                {activity.changes.newValue && (
                                  <div className="notepad-history-change">
                                    <span className="notepad-history-change-label">
                                      新值:
                                    </span>
                                    <span className="notepad-history-change-new">
                                      {activity.changes.newValue}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="notepad-history-empty">
                          暂无修改历史
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="notepad-status">
                自动保存于{" "}
                {new Date(selectedNote.updatedAt).toLocaleTimeString()}
              </div>
            </>
          ) : (
            <div className="notepad-editor-empty">
              <p>📝</p>
              <p>选择或创建一个笔记开始编辑</p>
            </div>
          )}
        </div>
      </div>
    </PluginWindow>
  );
}

// Plugin manifest
export const notepadManifest = {
  id: "com.desktop-tool.plugin.notepad",
  name: "Notepad",
  description: "支持Markdown语法的笔记工具，具有实时预览和修改历史记录功能",
  icon: "📝",
  version: "1.0.0",
  author: "Desktop Tool",
  category: "utility",
  entry: "./Notepad",
};

export default Notepad;
