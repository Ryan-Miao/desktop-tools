/**
 * Meeting Notes Plugin
 *
 * 结构化会议记录工具
 */

import React, { useState, useEffect } from 'react';
import PluginWindow from '../PluginWindow/PluginWindow';
import styles from './MeetingNotes.module.css';

interface MeetingNotesProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

interface Meeting {
  id: string;
  title: string;
  date: string;
  location: string;
  attendees: string[];
  agenda: string[];
  notes: string;
  actionItems: ActionItem[];
}

interface ActionItem {
  id: string;
  task: string;
  assignee: string;
  dueDate: string;
  completed: boolean;
}

const MeetingNotes: React.FC<MeetingNotesProps> = ({ onClose, onMinimize, onMaximize }) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showMeetingList, setShowMeetingList] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    attendees: '',
    agenda: '',
    notes: '',
    actionItems: [] as ActionItem[]
  });

  // 从本地存储加载
  useEffect(() => {
    const saved = localStorage.getItem('meeting-notes');
    if (saved) {
      setMeetings(JSON.parse(saved));
    }
  }, []);

  // 保存到本地存储
  useEffect(() => {
    if (meetings.length > 0) {
      localStorage.setItem('meeting-notes', JSON.stringify(meetings));
    }
  }, [meetings]);

  // 创建新会议
  const createNew = () => {
    setSelectedMeeting(null);
    setIsEditing(false);
    setFormData({
      title: '',
      date: new Date().toISOString().split('T')[0],
      location: '',
      attendees: '',
      agenda: '',
      notes: '',
      actionItems: []
    });
    setShowMeetingList(false);
  };

  // 保存会议
  const saveMeeting = () => {
    const meeting: Meeting = {
      id: selectedMeeting?.id || Date.now().toString(),
      title: formData.title || '未命名会议',
      date: formData.date,
      location: formData.location,
      attendees: formData.attendees.split('\n').filter(a => a.trim()),
      agenda: formData.agenda.split('\n').filter(a => a.trim()),
      notes: formData.notes,
      actionItems: formData.actionItems
    };

    if (selectedMeeting) {
      setMeetings(prev => prev.map(m => m.id === selectedMeeting.id ? meeting : m));
    } else {
      setMeetings(prev => [meeting, ...prev]);
    }

    setSelectedMeeting(meeting);
    setIsEditing(false);
    setShowMeetingList(true);
  };

  // 删除会议
  const deleteMeeting = (id: string) => {
    if (confirm('确定要删除这条会议记录吗？')) {
      setMeetings(prev => prev.filter(m => m.id !== id));
      if (selectedMeeting?.id === id) {
        setSelectedMeeting(null);
        setShowMeetingList(true);
      }
    }
  };

  // 添加行动项
  const addActionItem = () => {
    setFormData({
      ...formData,
      actionItems: [
        ...formData.actionItems,
        {
          id: Date.now().toString(),
          task: '',
          assignee: '',
          dueDate: '',
          completed: false
        }
      ]
    });
  };

  // 更新行动项
  const updateActionItem = (id: string, field: keyof ActionItem, value: string | boolean) => {
    setFormData({
      ...formData,
      actionItems: formData.actionItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    });
  };

  // 删除行动项
  const removeActionItem = (id: string) => {
    setFormData({
      ...formData,
      actionItems: formData.actionItems.filter(item => item.id !== id)
    });
  };

  // 切换行动项完成状态
  const toggleActionItem = (id: string) => {
    setFormData({
      ...formData,
      actionItems: formData.actionItems.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    });
  };

  return (
    <PluginWindow
      title="会议记录"
      icon="🗒️"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      className="meeting-notes-standalone"
      pluginId="meeting-notes"
      showStandaloneButton={false}
    >
      <div className={styles.container}>
        {/* 头部操作栏 */}
        <div className={styles.header}>
          <button onClick={createNew} className={styles.newButton}>
            ➕ 新建会议
          </button>
          <button onClick={() => setShowMeetingList(!showMeetingList)} className={styles.toggleButton}>
            {showMeetingList ? '📝 编辑' : '📋 列表'}
          </button>
        </div>

        {/* 会议列表 */}
        {showMeetingList ? (
          <div className={styles.meetingList}>
            {meetings.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🗒️</div>
                <p>暂无会议记录</p>
              </div>
            ) : (
              meetings.map(meeting => (
                <div
                  key={meeting.id}
                  className={styles.meetingCard}
                  onClick={() => {
                    setSelectedMeeting(meeting);
                    setFormData({
                      title: meeting.title,
                      date: meeting.date,
                      location: meeting.location,
                      attendees: meeting.attendees.join('\n'),
                      agenda: meeting.agenda.join('\n'),
                      notes: meeting.notes,
                      actionItems: meeting.actionItems
                    });
                    setShowMeetingList(false);
                  }}
                >
                  <div className={styles.meetingHeader}>
                    <h4>{meeting.title}</h4>
                    <span className={styles.meetingDate}>{meeting.date}</span>
                  </div>
                  <div className={styles.meetingInfo}>
                    {meeting.location && <span>📍 {meeting.location}</span>}
                    <span>👥 {meeting.attendees.length} 人</span>
                  </div>
                  <div className={styles.meetingStats}>
                    <span>📋 {meeting.agenda.length} 议程</span>
                    <span>✅ {meeting.actionItems.filter(a => a.completed).length}/{meeting.actionItems.length} 行动项</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMeeting(meeting.id);
                    }}
                    className={styles.deleteMeetingButton}
                  >
                    删除
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          /* 编辑表单 */
          <div className={styles.form}>
            <div className={styles.formSection}>
              <h3>基本信息</h3>
              <div className={styles.formGroup}>
                <label>会议主题</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="输入会议主题"
                  className={styles.input}
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>日期</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>地点</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="会议室或线上"
                    className={styles.input}
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>参会人员 (每行一个)</label>
                <textarea
                  value={formData.attendees}
                  onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                  placeholder="张三&#10;李四&#10;王五"
                  className={styles.textarea}
                  rows={3}
                />
              </div>
            </div>

            <div className={styles.formSection}>
              <h3>议程</h3>
              <textarea
                value={formData.agenda}
                onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                placeholder="1. 议题一&#10;2. 议题二&#10;3. 议题三"
                className={styles.textarea}
                rows={4}
              />
            </div>

            <div className={styles.formSection}>
              <h3>会议记录</h3>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="记录会议讨论要点..."
                className={styles.textarea}
                rows={6}
              />
            </div>

            <div className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <h3>行动项</h3>
                <button onClick={addActionItem} className={styles.addActionButton}>
                  ➕ 添加
                </button>
              </div>
              <div className={styles.actionItems}>
                {formData.actionItems.map(item => (
                  <div key={item.id} className={styles.actionItem}>
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => toggleActionItem(item.id)}
                      className={styles.checkbox}
                    />
                    <input
                      type="text"
                      value={item.task}
                      onChange={(e) => updateActionItem(item.id, 'task', e.target.value)}
                      placeholder="任务描述"
                      className={styles.taskInput}
                    />
                    <input
                      type="text"
                      value={item.assignee}
                      onChange={(e) => updateActionItem(item.id, 'assignee', e.target.value)}
                      placeholder="负责人"
                      className={styles.assigneeInput}
                    />
                    <input
                      type="date"
                      value={item.dueDate}
                      onChange={(e) => updateActionItem(item.id, 'dueDate', e.target.value)}
                      className={styles.dateInput}
                    />
                    <button
                      onClick={() => removeActionItem(item.id)}
                      className={styles.removeItemButton}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.formActions}>
              <button onClick={saveMeeting} className={styles.saveButton}>
                💾 保存
              </button>
              <button
                onClick={() => {
                  setShowMeetingList(true);
                  setSelectedMeeting(null);
                }}
                className={styles.cancelButton}
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>
    </PluginWindow>
  );
};

export default MeetingNotes;
