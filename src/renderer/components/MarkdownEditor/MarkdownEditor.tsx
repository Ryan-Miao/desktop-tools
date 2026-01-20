/**
 * Markdown Editor Plugin
 *
 * Enhanced markdown editor with live preview and export
 */

import React, { useState, useCallback, useMemo } from 'react';
import PluginWindow from '../PluginWindow/PluginWindow';
import styles from './MarkdownEditor.module.css';

interface MarkdownEditorProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  onClose,
  onMinimize,
  onMaximize,
}) => {
  const [content, setContent] = useState(`# 欢迎使用 Markdown 编辑器

这是一个功能强大的 **Markdown** 编辑器，支持实时预览。

## 功能特性

- 实时预览
- 工具栏快捷操作
- 导出为 HTML
- 字数统计

## 代码示例

\`\`\`javascript
function hello() {
  console.log('Hello, World!');
}
\`\`\`

## 列表示例

1. 第一项
2. 第二项
3. 第三项

## 引用

> 这是一个引用示例

## 链接

[访问 GitHub](https://github.com)
`);

  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  // Parse markdown to HTML (basic implementation)
  const parseMarkdown = useCallback((markdown: string): string => {
    let html = markdown;

    // Escape HTML
    html = html.replace(/&/g, '&amp;');
    html = html.replace(/</g, '&lt;');
    html = html.replace(/>/g, '&gt;');

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/__(.*?)__/gim, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
    html = html.replace(/_(.*?)_/gim, '<em>$1</em>');

    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/gim, '<pre><code>$2</code></pre>');

    // Inline code
    html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank">$1</a>');

    // Unordered lists
    html = html.replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // Ordered lists
    html = html.replace(/^\s*\d+\.\s+(.*$)/gim, '<li>$1</li>');

    // Blockquotes
    html = html.replace(/^&gt; (.*$)/gim, '<blockquote>$1</blockquote>');

    // Line breaks
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br />');

    // Wrap in paragraph
    html = `<div class="${styles.previewContent}">${html}</div>`;

    return html;
  }, []);

  // Insert markdown syntax
  const insertSyntax = useCallback((before: string, after: string = '', placeholder: string = '') => {
    const textarea = document.getElementById('markdown-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || placeholder;

    const newText =
      content.substring(0, start) +
      before +
      selectedText +
      after +
      content.substring(end);

    setContent(newText);

    // Set cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  }, [content]);

  // Word count
  const stats = useMemo(() => {
    const words = content.trim().split(/\s+/).filter(w => w.length > 0);
    const characters = content.length;
    const lines = content.split('\n').length;
    return {
      words: words.length,
      characters,
      lines,
    };
  }, [content]);

  // Copy to clipboard
  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [content]);

  // Export as HTML
  const exportHtml = useCallback(() => {
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Export</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
    h1, h2, h3 { margin-top: 24px; margin-bottom: 16px; font-weight: 600; line-height: 1.25; }
    h1 { font-size: 2em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
    h3 { font-size: 1.25em; }
    code { background: #f6f8fa; padding: 0.2em 0.4em; border-radius: 3px; font-family: monospace; }
    pre { background: #f6f8fa; padding: 16px; border-radius: 6px; overflow: auto; }
    pre code { background: none; padding: 0; }
    blockquote { border-left: 4px solid #dfe2e5; padding-left: 16px; color: #6a737d; }
    ul, ol { padding-left: 2em; }
    a { color: #0366d6; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
${parseMarkdown(content)}
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `markdown-export-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }, [content, parseMarkdown]);

  return (
    <PluginWindow
      title="Markdown 编辑器"
      icon="📝"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      className="markdown-editor-standalone"
      pluginId="markdown-editor"
      showStandaloneButton={false}
    >
      <div className={styles.container}>
        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.toolbarGroup}>
            <button
              onClick={() => insertSyntax('** ', ' **', '粗体文本')}
              className={styles.toolbarButton}
              title="粗体"
            >
              <strong>B</strong>
            </button>
            <button
              onClick={() => insertSyntax('* ', ' *', '斜体文本')}
              className={styles.toolbarButton}
              title="斜体"
            >
              <em>I</em>
            </button>
            <button
              onClick={() => insertSyntax('`', '`', '代码')}
              className={styles.toolbarButton}
              title="行内代码"
            >
              &lt;/&gt;
            </button>
          </div>

          <div className={styles.toolbarGroup}>
            <button
              onClick={() => insertSyntax('# ', '', '标题 1')}
              className={styles.toolbarButton}
              title="标题 1"
            >
              H1
            </button>
            <button
              onClick={() => insertSyntax('## ', '', '标题 2')}
              className={styles.toolbarButton}
              title="标题 2"
            >
              H2
            </button>
            <button
              onClick={() => insertSyntax('### ', '', '标题 3')}
              className={styles.toolbarButton}
              title="标题 3"
            >
              H3
            </button>
          </div>

          <div className={styles.toolbarGroup}>
            <button
              onClick={() => insertSyntax('- ', '', '列表项')}
              className={styles.toolbarButton}
              title="无序列表"
            >
              • 列表
            </button>
            <button
              onClick={() => insertSyntax('1. ', '', '列表项')}
              className={styles.toolbarButton}
              title="有序列表"
            >
              1. 列表
            </button>
            <button
              onClick={() => insertSyntax('> ', '', '引用')}
              className={styles.toolbarButton}
              title="引用"
            >
              " 引用
            </button>
          </div>

          <div className={styles.toolbarGroup}>
            <button
              onClick={() => insertSyntax('[', '](https://)', '链接文本')}
              className={styles.toolbarButton}
              title="链接"
            >
              🔗 链接
            </button>
            <button
              onClick={() => insertSyntax('```\\n', '\\n```', '代码')}
              className={styles.toolbarButton}
              title="代码块"
            >
              {'{}'} 代码
            </button>
          </div>

          <div className={styles.toolbarGroup}>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`${styles.toolbarButton} ${showPreview ? styles.active : ''}`}
              title="切换预览"
            >
              👁️ 预览
            </button>
          </div>

          <div className={styles.toolbarGroup}>
            <button
              onClick={copyToClipboard}
              className={styles.toolbarButton}
              title="复制"
            >
              {copied ? '✓ 已复制' : '📋 复制'}
            </button>
            <button
              onClick={exportHtml}
              className={styles.toolbarButton}
              title="导出 HTML"
            >
              📥 导出
            </button>
          </div>
        </div>

        {/* Editor and Preview */}
        <div className={styles.editorContainer}>
          {/* Editor */}
          <div className={`${styles.editorPane} ${!showPreview ? styles.fullWidth : ''}`}>
            <textarea
              id="markdown-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={styles.textarea}
              placeholder="在此输入 Markdown 内容..."
              spellCheck={false}
            />
          </div>

          {/* Preview */}
          {showPreview && (
            <div className={styles.previewPane}>
              <div
                className={styles.preview}
                dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
              />
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className={styles.statusBar}>
          <div className={styles.stats}>
            <span className={styles.statItem}>
              📝 {stats.words} 词
            </span>
            <span className={styles.statItem}>
              📄 {stats.characters} 字符
            </span>
            <span className={styles.statItem}>
              📋 {stats.lines} 行
            </span>
          </div>
        </div>
      </div>
    </PluginWindow>
  );
};

export default MarkdownEditor;
