/**
 * Goal Tracker Plugin
 *
 * 设定和追踪长期目标
 */

import React, { useState, useEffect } from 'react';
import PluginWindow from '../PluginWindow/PluginWindow';
import styles from './GoalTracker.module.css';

interface GoalTrackerProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'work' | 'personal' | 'health' | 'learning' | 'finance';
  progress: number;
  targetDate: string;
  milestones: Milestone[];
  createdAt: number;
}

interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: number;
}

const CATEGORIES = {
  work: { label: '工作', icon: '💼', color: '#667eea' },
  personal: { label: '个人', icon: '👤', color: '#764ba2' },
  health: { label: '健康', icon: '💪', color: '#10b981' },
  learning: { label: '学习', icon: '📚', color: '#f59e0b' },
  finance: { label: '财务', icon: '💰', color: '#ef4444' }
};

const GoalTracker: React.FC<GoalTrackerProps> = ({ onClose, onMinimize, onMaximize }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'work' as keyof typeof CATEGORIES,
    targetDate: '',
    milestones: [] as Milestone[]
  });

  // 从本地存储加载
  useEffect(() => {
    const saved = localStorage.getItem('goal-tracker');
    if (saved) {
      setGoals(JSON.parse(saved));
    }
  }, []);

  // 保存到本地存储
  useEffect(() => {
    if (goals.length > 0) {
      localStorage.setItem('goal-tracker', JSON.stringify(goals));
    }
  }, [goals]);

  // 过滤目标
  const filteredGoals = goals.filter(goal =>
    filterCategory === 'all' || goal.category === filterCategory
  );

  // 创建新目标
  const createNew = () => {
    setSelectedGoal(null);
    setIsEditing(false);
    setFormData({
      title: '',
      description: '',
      category: 'work',
      targetDate: '',
      milestones: []
    });
  };

  // 保存目标
  const saveGoal = () => {
    const goal: Goal = {
      id: selectedGoal?.id || Date.now().toString(),
      title: formData.title || '未命名目标',
      description: formData.description,
      category: formData.category,
      progress: calculateProgress(formData.milestones),
      targetDate: formData.targetDate,
      milestones: formData.milestones,
      createdAt: selectedGoal?.createdAt || Date.now()
    };

    if (selectedGoal) {
      setGoals(prev => prev.map(g => g.id === selectedGoal.id ? goal : g));
    } else {
      setGoals(prev => [goal, ...prev]);
    }

    setSelectedGoal(goal);
    setIsEditing(false);
  };

  // 计算进度
  const calculateProgress = (milestones: Milestone[]) => {
    if (milestones.length === 0) return 0;
    const completed = milestones.filter(m => m.completed).length;
    return Math.round((completed / milestones.length) * 100);
  };

  // 删除目标
  const deleteGoal = (id: string) => {
    if (confirm('确定要删除这个目标吗？')) {
      setGoals(prev => prev.filter(g => g.id !== id));
      if (selectedGoal?.id === id) {
        setSelectedGoal(null);
      }
    }
  };

  // 添加里程碑
  const addMilestone = () => {
    setFormData({
      ...formData,
      milestones: [
        ...formData.milestones,
        { id: Date.now().toString(), title: '', completed: false }
      ]
    });
  };

  // 更新里程碑
  const updateMilestone = (id: string, title: string) => {
    setFormData({
      ...formData,
      milestones: formData.milestones.map(m =>
        m.id === id ? { ...m, title } : m
      )
    });
  };

  // 删除里程碑
  const removeMilestone = (id: string) => {
    setFormData({
      ...formData,
      milestones: formData.milestones.filter(m => m.id !== id)
    });
  };

  // 切换里程碑完成状态
  const toggleMilestone = (id: string) => {
    if (!selectedGoal) return;

    const updatedMilestones = selectedGoal.milestones.map(m =>
      m.id === id
        ? {
            ...m,
            completed: !m.completed,
            completedAt: !m.completed ? Date.now() : undefined
          }
        : m
    );

    const updatedGoal = {
      ...selectedGoal,
      milestones: updatedMilestones,
      progress: calculateProgress(updatedMilestones)
    };

    setGoals(prev => prev.map(g => g.id === selectedGoal.id ? updatedGoal : g));
    setSelectedGoal(updatedGoal);
  };

  return (
    <PluginWindow
      title="目标追踪"
      icon="🎯"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      className="goal-tracker-standalone"
      pluginId="goal-tracker"
      showStandaloneButton={false}
    >
      <div className={styles.container}>
        {/* 分类筛选 */}
        <div className={styles.filterBar}>
          <button
            onClick={() => setFilterCategory('all')}
            className={`${styles.filterButton} ${filterCategory === 'all' ? styles.active : ''}`}
          >
            全部
          </button>
          {Object.entries(CATEGORIES).map(([key, { label, icon, color }]) => (
            <button
              key={key}
              onClick={() => setFilterCategory(key)}
              className={`${styles.filterButton} ${filterCategory === key ? styles.active : ''}`}
              style={{ borderColor: filterCategory === key ? color : undefined }}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        <div className={styles.content}>
          {/* 目标列表 */}
          <div className={styles.goalList}>
            <div className={styles.listHeader}>
              <h3>目标列表 ({filteredGoals.length})</h3>
              <button onClick={createNew} className={styles.newButton}>
                ➕ 新建
              </button>
            </div>

            {filteredGoals.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🎯</div>
                <p>暂无目标，创建一个吧！</p>
              </div>
            ) : (
              <div className={styles.list}>
                {filteredGoals.map(goal => {
                  const category = CATEGORIES[goal.category];
                  return (
                    <div
                      key={goal.id}
                      className={`${styles.goalCard} ${selectedGoal?.id === goal.id ? styles.active : ''}`}
                      onClick={() => setSelectedGoal(goal)}
                    >
                      <div className={styles.goalHeader}>
                        <div className={styles.goalIcon} style={{ background: category.color }}>
                          {category.icon}
                        </div>
                        <div className={styles.goalInfo}>
                          <h4>{goal.title}</h4>
                          <span className={styles.goalCategory}>{category.label}</span>
                        </div>
                      </div>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{ width: `${goal.progress}%`, background: category.color }}
                        />
                      </div>
                      <div className={styles.goalMeta}>
                        <span>{goal.progress}% 完成</span>
                        <span>
                          {goal.milestones.filter(m => m.completed).length}/{goal.milestones.length} 里程碑
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 目标详情 */}
          {selectedGoal && !isEditing && (
            <div className={styles.goalDetail}>
              <div className={styles.detailHeader}>
                <div className={styles.detailTitle}>
                  <h2>{selectedGoal.title}</h2>
                  <span className={styles.detailCategory}>
                    {CATEGORIES[selectedGoal.category].icon} {CATEGORIES[selectedGoal.category].label}
                  </span>
                </div>
                <div className={styles.detailActions}>
                  <button onClick={() => setIsEditing(true)} className={styles.editButton}>
                    编辑
                  </button>
                  <button
                    onClick={() => deleteGoal(selectedGoal.id)}
                    className={styles.deleteButton}
                  >
                    删除
                  </button>
                </div>
              </div>

              {selectedGoal.description && (
                <div className={styles.detailSection}>
                  <label>描述</label>
                  <div className={styles.detailDescription}>{selectedGoal.description}</div>
                </div>
              )}

              <div className={styles.detailSection}>
                <label>进度: {selectedGoal.progress}%</label>
                <div className={styles.progressLarge}>
                  <div
                    className={styles.progressFillLarge}
                    style={{
                      width: `${selectedGoal.progress}%`,
                      background: CATEGORIES[selectedGoal.category].color
                    }}
                  />
                </div>
              </div>

              {selectedGoal.targetDate && (
                <div className={styles.detailSection}>
                  <label>目标日期</label>
                  <div className={styles.detailDate}>
                    {new Date(selectedGoal.targetDate).toLocaleDateString()}
                  </div>
                </div>
              )}

              {selectedGoal.milestones.length > 0 && (
                <div className={styles.detailSection}>
                  <label>里程碑</label>
                  <div className={styles.milestonesList}>
                    {selectedGoal.milestones.map(milestone => (
                      <div
                        key={milestone.id}
                        className={styles.milestoneItem}
                        onClick={() => toggleMilestone(milestone.id)}
                      >
                        <input
                          type="checkbox"
                          checked={milestone.completed}
                          onChange={() => toggleMilestone(milestone.id)}
                          className={styles.milestoneCheckbox}
                        />
                        <span className={`${styles.milestoneTitle} ${milestone.completed ? styles.completed : ''}`}>
                          {milestone.title}
                        </span>
                        {milestone.completedAt && (
                          <span className={styles.milestoneDate}>
                            {new Date(milestone.completedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 编辑表单 */}
          {(isEditing || !selectedGoal) && (
            <div className={styles.editForm}>
              <h3>{isEditing ? '编辑目标' : '新建目标'}</h3>
              <div className={styles.formGroup}>
                <label>目标标题</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="例如：学习TypeScript"
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label>描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="描述你的目标..."
                  className={styles.textarea}
                  rows={3}
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>分类</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className={styles.select}
                  >
                    {Object.entries(CATEGORIES).map(([key, { label, icon }]) => (
                      <option key={key} value={key}>{icon} {label}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>目标日期</label>
                  <input
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    className={styles.input}
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <div className={styles.milestoneHeader}>
                  <label>里程碑</label>
                  <button onClick={addMilestone} className={styles.addMilestoneButton}>
                    ➕ 添加
                  </button>
                </div>
                <div className={styles.milestoneFormList}>
                  {formData.milestones.map(milestone => (
                    <div key={milestone.id} className={styles.milestoneFormItem}>
                      <input
                        type="text"
                        value={milestone.title}
                        onChange={(e) => updateMilestone(milestone.id, e.target.value)}
                        placeholder="里程碑标题"
                        className={styles.input}
                      />
                      <button
                        onClick={() => removeMilestone(milestone.id)}
                        className={styles.removeMilestoneButton}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.formActions}>
                <button onClick={saveGoal} className={styles.saveButton}>
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

export default GoalTracker;
