/**
 * Article Collector Plugin
 */

export { default } from './ArticleCollector';
export const articleCollectorManifest = {
  id: 'com.desktop-tool.plugin.article-collector',
  name: '文章采集',
  description: '保存和管理网页文章链接，支持标签分类和全文搜索',
  icon: '📰',
  version: '1.0.0',
  author: 'Desktop Tool',
  category: '办公效率',
  entry: './ArticleCollector',
};
