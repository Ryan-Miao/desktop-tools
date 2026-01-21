import React from "react";
import { ActivityEvent } from "../../store/useTodoStore";
import styles from "./ActivityTimeline.module.css";

export interface ActivityTimelineProps {
  activities: ActivityEvent[];
  maxItems?: number;
}

// Activity type icons and labels
const ACTIVITY_CONFIG: Record<
  string,
  { icon: string; label: string; color: string }
> = {
  CREATED: {
    icon: "✨",
    label: "创建",
    color: "#10B981",
  },
  UPDATED: {
    icon: "✏️",
    label: "更新",
    color: "#3B82F6",
  },
  COMPLETED: {
    icon: "✅",
    label: "完成",
    color: "#10B981",
  },
  REOPENED: {
    icon: "↩️",
    label: "重新打开",
    color: "#F59E0B",
  },
  DELETED: {
    icon: "🗑️",
    label: "删除",
    color: "#EF4444",
  },
  TITLE_CHANGED: {
    icon: "📝",
    label: "修改标题",
    color: "#3B82F6",
  },
  DESCRIPTION_CHANGED: {
    icon: "📄",
    label: "修改描述",
    color: "#3B82F6",
  },
  PRIORITY_CHANGED: {
    icon: "⚡",
    label: "优先级",
    color: "#F59E0B",
  },
  DUE_DATE_CHANGED: {
    icon: "📅",
    label: "到期日期",
    color: "#8B5CF6",
  },
  LIST_CHANGED: {
    icon: "📁",
    label: "移动",
    color: "#6366F1",
  },
  SUBTASK_ADDED: {
    icon: "➕",
    label: "子任务",
    color: "#10B981",
  },
  SUBTASK_COMPLETED: {
    icon: "☑️",
    label: "子任务完成",
    color: "#10B981",
  },
  SUBTASK_REOPENED: {
    icon: "↩️",
    label: "子任务重开",
    color: "#F59E0B",
  },
  SUBTASK_DELETED: {
    icon: "✖️",
    label: "删除子任务",
    color: "#EF4444",
  },
  SUBTASK_TITLE_CHANGED: {
    icon: "✏️",
    label: "修改子任务",
    color: "#3B82F6",
  },
  STATUS_CHANGED: {
    icon: "📊",
    label: "状态变更",
    color: "#3B82F6",
  },
};

// Format timestamp to relative time
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

  // Format absolute date for older activities
  const year = time.getFullYear();
  const month = String(time.getMonth() + 1).padStart(2, "0");
  const day = String(time.getDate()).padStart(2, "0");
  const hour = String(time.getHours()).padStart(2, "0");
  const minute = String(time.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hour}:${minute}`;
};

function ActivityTimeline({
  activities,
  maxItems = 10,
}: ActivityTimelineProps) {
  if (!activities || activities.length === 0) {
    return (
      <div className={styles.empty}>
        <p>暂无活动记录</p>
      </div>
    );
  }

  // Sort by timestamp (newest first) and limit
  const sortedActivities = [...activities]
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    .slice(0, maxItems);

  return (
    <div className={styles.timeline}>
      <h4 className={styles.title}>活动历史</h4>
      <div className={styles.timelineList}>
        {sortedActivities.map((activity, index) => {
          const config = ACTIVITY_CONFIG[activity.type] || {
            icon: "•",
            label: "活动",
            color: "#64748B",
          };

          return (
            <div key={activity.id} className={styles.timelineItem}>
              {/* Icon */}
              <div
                className={styles.icon}
                style={{ backgroundColor: `${config.color}20` }}
              >
                <span style={{ color: config.color }}>{config.icon}</span>
              </div>

              {/* Content */}
              <div className={styles.content}>
                <div className={styles.description}>
                  {activity.description || config.label}
                </div>

                {/* Show change details if available */}
                {activity.changes &&
                  activity.changes.oldValue !== undefined && (
                    <div className={styles.changes}>
                      {activity.changes.oldValue && (
                        <span className={styles.oldValue}>
                          {activity.changes.oldValue}
                        </span>
                      )}
                      <span className={styles.arrow}>→</span>
                      {activity.changes.newValue && (
                        <span className={styles.newValue}>
                          {activity.changes.newValue}
                        </span>
                      )}
                    </div>
                  )}

                <div className={styles.timestamp}>
                  {formatRelativeTime(activity.timestamp)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ActivityTimeline;
