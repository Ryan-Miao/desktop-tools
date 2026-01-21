import React, { useEffect, useState } from "react";
import "./Toast.css";

export interface ToastProps {
  /** 通知类型 */
  type?: "success" | "error" | "warning" | "info";
  /** 标题 */
  title?: string;
  /** 消息内容 */
  message: string;
  /** 持续时间（毫秒），0 表示不自动关闭 */
  duration?: number;
  /** 关闭回调 */
  onClose?: () => void;
  /** 操作按钮 */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** 是否显示图标 */
  showIcon?: boolean;
}

/**
 * 通知/Toast 组件
 *
 * 带有平滑进入/退出动画的通知提示
 */
const Toast: React.FC<ToastProps> = ({
  type = "info",
  title,
  message,
  duration = 3000,
  onClose,
  action,
  showIcon = true,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [duration]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300); // 等待退出动画完成
  };

  const handleAction = () => {
    action?.onClick();
    handleClose();
  };

  if (!isVisible) {
    return null;
  }

  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };

  return (
    <div className={`toast toast-${type} ${isClosing ? "toast-closing" : ""}`}>
      {showIcon && <div className="toast-icon">{icons[type]}</div>}

      <div className="toast-content">
        {title && <div className="toast-title">{title}</div>}
        <div className="toast-message">{message}</div>
      </div>

      {action && (
        <button className="toast-action" onClick={handleAction}>
          {action.label}
        </button>
      )}

      <button className="toast-close" onClick={handleClose} aria-label="关闭">
        ×
      </button>
    </div>
  );
};

export default Toast;

/**
 * Toast 容器组件（管理多个通知）
 */
export interface ToastContainerProps {
  toasts: Array<{
    id: string;
    type?: "success" | "error" | "warning" | "info";
    title?: string;
    message: string;
    duration?: number;
    action?: {
      label: string;
      onClick: () => void;
    };
  }>;
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemove,
}) => {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast-wrapper">
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            duration={toast.duration}
            onClose={() => onRemove(toast.id)}
            action={toast.action}
          />
        </div>
      ))}
    </div>
  );
};

/**
 * Toast Hook（简化使用）
 */
export function useToast() {
  const [toasts, setToasts] = useState<
    Array<{
      id: string;
      type?: "success" | "error" | "warning" | "info";
      title?: string;
      message: string;
      duration?: number;
    }>
  >([]);

  const show = (
    message: string,
    options?: {
      type?: "success" | "error" | "warning" | "info";
      title?: string;
      duration?: number;
    },
  ) => {
    const id = Date.now().toString();
    const toast = {
      id,
      message,
      ...options,
    };

    setToasts((prev) => [...prev, toast]);

    if (options?.duration !== 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, options?.duration || 3000);
    }

    return id;
  };

  const remove = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return {
    toasts,
    show,
    remove,
    success: (message: string, title?: string) =>
      show(message, { type: "success", title }),
    error: (message: string, title?: string) =>
      show(message, { type: "error", title }),
    warning: (message: string, title?: string) =>
      show(message, { type: "warning", title }),
    info: (message: string, title?: string) =>
      show(message, { type: "info", title }),
  };
}
