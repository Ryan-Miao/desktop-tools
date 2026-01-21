/**
 * Schedule Planner Plugin
 *
 * 每日时间规划和安排
 */

import React, { useState, useEffect } from "react";
import PluginWindow from "../PluginWindow/PluginWindow";
import styles from "./SchedulePlanner.module.css";

interface SchedulePlannerProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

interface TimeBlock {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  color: string;
}

const COLORS = [
  "#667eea",
  "#764ba2",
  "#f093fb",
  "#f5576c",
  "#4facfe",
  "#00f2fe",
  "#43e97b",
  "#38f9d7",
  "#fa709a",
  "#fee140",
  "#30cfd0",
  "#c43a30",
];

const SchedulePlanner: React.FC<SchedulePlannerProps> = ({
  onClose,
  onMinimize,
  onMaximize,
}) => {
  const [blocks, setBlocks] = useState<TimeBlock[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<TimeBlock | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    startTime: "09:00",
    endTime: "10:00",
    color: COLORS[0],
  });

  // 从本地存储加载数据
  useEffect(() => {
    const saved = localStorage.getItem("schedule-blocks");
    if (saved) {
      setBlocks(JSON.parse(saved));
    }
  }, []);

  // 保存到本地存储
  useEffect(() => {
    if (blocks.length > 0) {
      localStorage.setItem("schedule-blocks", JSON.stringify(blocks));
    }
  }, [blocks]);

  // 添加时间段
  const addBlock = () => {
    if (!formData.title.trim()) return;

    const newBlock: TimeBlock = {
      id: Date.now().toString(),
      ...formData,
      color: formData.color ?? COLORS[0],
    };

    setBlocks((prev) =>
      [...prev, newBlock].sort((a, b) =>
        a.startTime.localeCompare(b.startTime),
      ),
    );
    resetForm();
  };

  // 更新时间段
  const updateBlock = () => {
    if (!selectedBlock || !formData.title.trim()) return;

    setBlocks((prev) =>
      prev
        .map((block) =>
          block.id === selectedBlock.id ? { ...block, ...formData } : block,
        )
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    );
    resetForm();
  };

  // 删除时间段
  const deleteBlock = (id: string) => {
    setBlocks((prev) => prev.filter((block) => block.id !== id));
    if (selectedBlock?.id === id) {
      resetForm();
    }
  };

  // 编辑时间段
  const editBlock = (block: TimeBlock) => {
    setSelectedBlock(block);
    setFormData({
      title: block.title,
      startTime: block.startTime,
      endTime: block.endTime,
      color: block.color,
    });
    setIsEditing(true);
  };

  // 重置表单
  const resetForm = () => {
    setSelectedBlock(null);
    setIsEditing(false);
    setFormData({
      title: "",
      startTime: "09:00",
      endTime: "10:00",
      color: COLORS[0],
    });
  };

  // 清空所有
  const clearAll = () => {
    if (confirm("确定要清空所有日程吗？")) {
      setBlocks([]);
      resetForm();
      localStorage.removeItem("schedule-blocks");
    }
  };

  // 检查时间冲突
  const hasConflict = (start: string, end: string, excludeId?: string) => {
    return blocks.some((block) => {
      if (excludeId && block.id === excludeId) return false;
      return (
        (start >= block.startTime && start < block.endTime) ||
        (end > block.startTime && end <= block.endTime) ||
        (start <= block.startTime && end >= block.endTime)
      );
    });
  };

  return (
    <PluginWindow
      title="日程安排"
      icon="📅"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      className="schedule-planner-standalone"
      pluginId="schedule-planner"
      showStandaloneButton={false}
    >
      <div className={styles.container}>
        {/* 表单 */}
        <div className={styles.formSection}>
          <h3>{isEditing ? "编辑日程" : "添加日程"}</h3>
          <div className={styles.formGroup}>
            <label>标题</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="例如：晨会、午休..."
              className={styles.input}
            />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>开始时间</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label>结束时间</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
                className={styles.input}
              />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>颜色</label>
            <div className={styles.colorPicker}>
              {COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setFormData({ ...formData, color })}
                  className={`${styles.colorButton} ${formData.color === color ? styles.active : ""}`}
                  style={{ background: color }}
                />
              ))}
            </div>
          </div>
          <div className={styles.formActions}>
            {isEditing ? (
              <>
                <button onClick={updateBlock} className={styles.primaryButton}>
                  保存修改
                </button>
                <button onClick={resetForm} className={styles.secondaryButton}>
                  取消
                </button>
              </>
            ) : (
              <button onClick={addBlock} className={styles.primaryButton}>
                添加日程
              </button>
            )}
          </div>
        </div>

        {/* 日程列表 */}
        <div className={styles.scheduleSection}>
          <div className={styles.sectionHeader}>
            <h3>今日日程 ({blocks.length})</h3>
            {blocks.length > 0 && (
              <button onClick={clearAll} className={styles.clearButton}>
                清空
              </button>
            )}
          </div>

          {blocks.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📅</div>
              <p>暂无日程，添加一个吧！</p>
            </div>
          ) : (
            <div className={styles.timeline}>
              {blocks.map((block) => (
                <div
                  key={block.id}
                  className={styles.timeBlock}
                  style={{ borderLeftColor: block.color }}
                  onClick={() => editBlock(block)}
                >
                  <div className={styles.timeRange}>
                    <span className={styles.startTime}>{block.startTime}</span>
                    <span className={styles.timeArrow}>→</span>
                    <span className={styles.endTime}>{block.endTime}</span>
                  </div>
                  <div className={styles.blockTitle}>{block.title}</div>
                  <div className={styles.blockActions}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        editBlock(block);
                      }}
                      className={styles.actionButton}
                    >
                      编辑
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteBlock(block.id);
                      }}
                      className={styles.deleteButton}
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 统计 */}
        {blocks.length > 0 && (
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>日程总数</span>
              <span className={styles.statValue}>{blocks.length}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>总时长</span>
              <span className={styles.statValue}>
                {blocks.reduce((acc, block) => {
                  const start = new Date(`2000-01-01 ${block.startTime}`);
                  const end = new Date(`2000-01-01 ${block.endTime}`);
                  return acc + (end.getTime() - start.getTime()) / (1000 * 60);
                }, 0)}{" "}
                分钟
              </span>
            </div>
          </div>
        )}
      </div>
    </PluginWindow>
  );
};

export default SchedulePlanner;
