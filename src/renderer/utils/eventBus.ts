/**
 * 全局事件总线
 * 用于渲染进程组件间通信
 */
class EventEmitter {
  private listeners: Map<string, Set<Function>> = new Map();

  on(event: string, callback: Function): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // 返回清理函数
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  emit(event: string, ...args: any[]): void {
    this.listeners.get(event)?.forEach(callback => {
      callback(...args);
    });
  }
}

export const eventBus = new EventEmitter();

// 定义事件名称
export const AppEvents = {
  PLUGINS_CHANGED: 'app:plugins-changed',
};
