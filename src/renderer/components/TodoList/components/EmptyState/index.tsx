import React from 'react';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  type: 'inbox' | 'today' | 'week' | 'list' | 'search';
  listName?: string;
}

function EmptyState({ type, listName }: EmptyStateProps) {
  const getEmptyContent = () => {
    switch (type) {
      case 'inbox':
        return {
          icon: '📥',
          title: '收集箱是空的',
          hint: '开始添加你的第一个任务吧！',
        };
      case 'today':
        return {
          icon: '☀️',
          title: '今天没有任务',
          hint: '享受生活，或者添加新任务',
        };
      case 'week':
        return {
          icon: '📅',
          title: '最近7天没有任务',
          hint: '添加一些即将到来的任务',
        };
      case 'list':
        return {
          icon: '📁',
          title: `${listName || '清单'}是空的`,
          hint: '添加任务到这个清单',
        };
      case 'search':
        return {
          icon: '🔍',
          title: '没有找到匹配的任务',
          hint: '尝试其他搜索关键词',
        };
      default:
        return {
          icon: '📝',
          title: '没有任务',
          hint: '开始添加你的第一个任务吧！',
        };
    }
  };

  const content = getEmptyContent();

  return (
    <div className={styles.emptyState}>
      <div className={styles.icon}>{content.icon}</div>
      <h3 className={styles.title}>{content.title}</h3>
      <p className={styles.hint}>{content.hint}</p>
    </div>
  );
}

export default EmptyState;
