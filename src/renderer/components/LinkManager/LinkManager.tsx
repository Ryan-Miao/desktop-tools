/**
 * Link Manager Plugin
 *
 * 保存和整理常用链接
 */

import React, { useState, useCallback, useEffect } from 'react';
import PluginWindow from '../PluginWindow/PluginWindow';
import styles from './LinkManager.module.css';

interface LinkManagerProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

interface Link {
  id: string;
  title: string;
  url: string;
  category: string;
  tags: string[];
  createdAt: number;
}

const LinkManager: React.FC<LinkManagerProps> = ({
  onClose,
  onMinimize,
  onMaximize,
}) => {
  const [links, setLinks] = useState<Link[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newLink, setNewLink] = useState({ title: '', url: '', category: '未分类', tags: '' });

  // 加载链接
  useEffect(() => {
    const saved = localStorage.getItem('link-manager-data');
    if (saved) {
      try {
        setLinks(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to load links:', err);
      }
    }
  }, []);

  // 保存链接
  useEffect(() => {
    localStorage.setItem('link-manager-data', JSON.stringify(links));
  }, [links]);

  // 添加链接
  const addLink = useCallback(() => {
    if (!newLink.title.trim() || !newLink.url.trim()) return;

    const link: Link = {
      id: Date.now().toString(),
      title: newLink.title,
      url: newLink.url,
      category: newLink.category,
      tags: newLink.tags ? newLink.tags.split(',').map(t => t.trim()).filter(t => t) : [],
      createdAt: Date.now(),
    };

    setLinks(prev => [...prev, link]);
    setNewLink({ title: '', url: '', category: '未分类', tags: '' });
    setShowModal(false);
  }, [newLink]);

  // 删除链接
  const deleteLink = useCallback((id: string) => {
    setLinks(prev => prev.filter(l => l.id !== id));
  }, []);

  // 获取分类列表
  const categories = ['all', ...Array.from(new Set(links.map(l => l.category)))];

  // 过滤链接
  const filteredLinks = links.filter(link => {
    const matchesSearch = link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         link.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         link.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || link.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <PluginWindow
      title="链接管理"
      icon="🔗"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      className="link-manager-standalone"
      pluginId="link-manager"
      showStandaloneButton={false}
    >
      <div className={styles.container}>
        {/* 搜索和筛选 */}
        <div className={styles.filters}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索链接..."
            className={styles.searchInput}
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={styles.categorySelect}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button onClick={() => setShowModal(true)} className={styles.addButton}>
            + 添加链接
          </button>
        </div>

        {/* 链接列表 */}
        <div className={styles.linkList}>
          {filteredLinks.length === 0 ? (
            <div className={styles.emptyState}>
              <p>暂无链接，点击"添加链接"开始</p>
            </div>
          ) : (
            filteredLinks.map(link => (
              <div key={link.id} className={styles.linkCard}>
                <a href={link.url} target="_blank" rel="noopener noreferrer" className={styles.linkTitle}>
                  {link.title}
                </a>
                <a href={link.url} target="_blank" rel="noopener noreferrer" className={styles.linkUrl}>
                  {link.url}
                </a>
                <div className={styles.linkMeta}>
                  <span className={styles.category}>{link.category}</span>
                  {link.tags.length > 0 && (
                    <div className={styles.tags}>
                      {link.tags.map((tag, i) => (
                        <span key={i} className={styles.tag}>{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => deleteLink(link.id)}
                  className={styles.deleteButton}
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>

        {/* 添加链接模态框 */}
        {showModal && (
          <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>添加链接</h3>
                <button onClick={() => setShowModal(false)} className={styles.modalClose}>×</button>
              </div>
              <div className={styles.form}>
                <div className={styles.formGroup}>
                  <label>标题 *</label>
                  <input
                    type="text"
                    value={newLink.title}
                    onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                    placeholder="网站名称"
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>URL *</label>
                  <input
                    type="url"
                    value={newLink.url}
                    onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                    placeholder="https://example.com"
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>分类</label>
                  <input
                    type="text"
                    value={newLink.category}
                    onChange={(e) => setNewLink({ ...newLink, category: e.target.value })}
                    placeholder="例如: 工作, 学习, 娱乐"
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>标签（逗号分隔）</label>
                  <input
                    type="text"
                    value={newLink.tags}
                    onChange={(e) => setNewLink({ ...newLink, tags: e.target.value })}
                    placeholder="例如: 常用, 工具, 开发"
                    className={styles.input}
                  />
                </div>
                <div className={styles.formActions}>
                  <button onClick={() => setShowModal(false)} className={styles.cancelButton}>取消</button>
                  <button onClick={addLink} className={styles.submitButton}>添加</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PluginWindow>
  );
};

export default LinkManager;
