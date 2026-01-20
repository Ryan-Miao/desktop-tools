/**
 * Markdown Editor Plugin
 */

export { default } from './MarkdownEditor';
export const markdownEditorManifest = {
  id: 'com.desktop-tool.plugin.markdown-editor',
  name: 'Markdown编辑器',
  description: '增强版Markdown编辑器，支持实时预览、工具栏和导出功能',
  icon: '📝',
  version: '1.0.0',
  author: 'Desktop Tool',
  category: '开发工具',
  entry: './MarkdownEditor',
};
