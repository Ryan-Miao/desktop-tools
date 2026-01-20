/**
 * Article Collector Plugin
 *
 * 保存和管理网页文章
 */

import React, { useState, useEffect } from 'react';
import PluginWindow from '../PluginWindow/PluginWindow';
import styles from './ArticleCollector.module.css';

interface ArticleCollectorProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

interface Article {
  id: string;
  title: string;
  url: string;
  tags: string[];
  notes: string;
  createdAt: number;
}

const ArticleCollector: React.FC<ArticleCollectorProps> = ({ onClose, onMinimize, onMaximize }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    url: '',
    tags: '',
    notes: ''
  });

  // 从本地存储加载
  useEffect(() => {
    const saved = localStorage.getItem('article-collector');
    if (saved) {
      setArticles(JSON.parse(saved));
    }
  }, []);

  // 保存到本地存储
  useEffect(() => {
    if (articles.length > 0) {
      localStorage.setItem('article-collector', JSON.stringify(articles));
    }
  }, [articles]);

  // 获取所有标签
  const allTags = Array.from(new Set(articles.flatMap(a => a.tags)));

  // 过滤文章
  const filteredArticles = articles.filter(article => {
    const matchesSearch = !searchQuery ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.url.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !filterTag || article.tags.includes(filterTag);
    return matchesSearch && matchesTag;
  });

  // 创建新文章
  const createNew = () => {
    setSelectedArticle(null);
    setIsEditing(false);
    setFormData({ title: '', url: '', tags: '', notes: '' });
  };

  // 保存文章
  const saveArticle = () => {
    const article: Article = {
      id: selectedArticle?.id || Date.now().toString(),
      title: formData.title || '未命名文章',
      url: formData.url,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      notes: formData.notes,
      createdAt: selectedArticle?.createdAt || Date.now()
    };

    if (selectedArticle) {
      setArticles(prev => prev.map(a => a.id === selectedArticle.id ? article : a));
    } else {
      setArticles(prev => [article, ...prev]);
    }

    setSelectedArticle(article);
    setIsEditing(false);
  };

  // 删除文章
  const deleteArticle = (id: string) => {
    if (confirm('确定要删除这篇文章吗？')) {
      setArticles(prev => prev.filter(a => a.id !== id));
      if (selectedArticle?.id === id) {
        setSelectedArticle(null);
      }
    }
  };

  // 从剪贴板粘贴URL
  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setFormData({ ...formData, url: text });
    } catch (err) {
      alert('无法访问剪贴板，请手动粘贴');
    }
  };

  // 打开链接
  const openLink = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <PluginWindow
      title="文章采集"
      icon="📰"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      className="article-collector-standalone"
      pluginId="article-collector"
      showStandaloneButton={false}
    >
      <div className={styles.container}>
        {/* 搜索和筛选 */}
        <div className={styles.searchBar}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索文章标题或URL..."
            className={styles.searchInput}
          />
          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className={styles.tagFilter}
          >
            <option value="">全部标签</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>

        <div className={styles.content}>
          {/* 文章列表 */}
          <div className={styles.articleList}>
            <div className={styles.listHeader}>
              <h3>文章列表 ({filteredArticles.length})</h3>
              <button onClick={createNew} className={styles.newButton}>
                ➕ 新建
              </button>
            </div>

            {filteredArticles.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📰</div>
                <p>{searchQuery || filterTag ? '没有找到匹配的文章' : '暂无文章，创建一个吧！'}</p>
              </div>
            ) : (
              <div className={styles.list}>
                {filteredArticles.map(article => (
                  <div
                    key={article.id}
                    className={`${styles.articleCard} ${selectedArticle?.id === article.id ? styles.active : ''}`}
                    onClick={() => setSelectedArticle(article)}
                  >
                    <h4>{article.title}</h4>
                    <div className={styles.articleUrl}>{article.url}</div>
                    <div className={styles.articleMeta}>
                      <span className={styles.articleDate}>
                        {new Date(article.createdAt).toLocaleDateString()}
                      </span>
                      {article.tags.length > 0 && (
                        <div className={styles.articleTags}>
                          {article.tags.map(tag => (
                            <span key={tag} className={styles.tag}>{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 文章详情 */}
          {selectedArticle && !isEditing && (
            <div className={styles.articleDetail}>
              <div className={styles.detailHeader}>
                <h2>{selectedArticle.title}</h2>
                <div className={styles.detailActions}>
                  <button onClick={() => setIsEditing(true)} className={styles.editButton}>
                    编辑
                  </button>
                  <button
                    onClick={() => openLink(selectedArticle.url)}
                    className={styles.openButton}
                  >
                    打开链接
                  </button>
                  <button
                    onClick={() => deleteArticle(selectedArticle.id)}
                    className={styles.deleteButton}
                  >
                    删除
                  </button>
                </div>
              </div>
              <div className={styles.detailSection}>
                <label>链接</label>
                <a href={selectedArticle.url} target="_blank" rel="noopener noreferrer" className={styles.detailUrl}>
                  {selectedArticle.url}
                </a>
              </div>
              {selectedArticle.tags.length > 0 && (
                <div className={styles.detailSection}>
                  <label>标签</label>
                  <div className={styles.detailTags}>
                    {selectedArticle.tags.map(tag => (
                      <span key={tag} className={styles.tag}>{tag}</span>
                    ))}
                  </div>
                </div>
              )}
              {selectedArticle.notes && (
                <div className={styles.detailSection}>
                  <label>笔记</label>
                  <div className={styles.detailNotes}>{selectedArticle.notes}</div>
                </div>
              )}
              <div className={styles.detailSection}>
                <label>添加时间</label>
                <div className={styles.detailDate}>
                  {new Date(selectedArticle.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {/* 编辑表单 */}
          {(isEditing || !selectedArticle) && (
            <div className={styles.editForm}>
              <h3>{isEditing ? '编辑文章' : '新建文章'}</h3>
              <div className={styles.formGroup}>
                <label>标题</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="输入文章标题"
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label>URL</label>
                <div className={styles.urlInput}>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://example.com/article"
                    className={styles.input}
                  />
                  <button onClick={pasteFromClipboard} className={styles.pasteButton}>
                    📋 粘贴
                  </button>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>标签 (用逗号分隔)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="技术, 教程, React"
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label>笔记</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="记录文章要点和心得..."
                  className={styles.textarea}
                  rows={6}
                />
              </div>
              <div className={styles.formActions}>
                <button onClick={saveArticle} className={styles.saveButton}>
                  💾 保存
                </button>
                {isEditing && (
                  <button onClick={() => setIsEditing(false)} className={styles.cancelButton}>
                    取消
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </PluginWindow>
  );
};

export default ArticleCollector;
