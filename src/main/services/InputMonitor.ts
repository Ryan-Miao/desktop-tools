import { DatabaseService } from '../database';

export class InputMonitor {
  private database: DatabaseService;
  private isRunning: boolean = false;
  private keyboardCount: number = 0;
  private mouseClickCount: number = 0;
  private mouseMoveDistance: number = 0;
  private saveInterval: NodeJS.Timeout | null = null;

  // 统计数据变化时的回调
  private statsUpdateCallback?: (stats: {
    keyboardCount: number;
    mouseClickCount: number;
    mouseMoveDistance: number;
  }) => void;

  constructor(database: DatabaseService) {
    this.database = database;
  }

  /**
   * 启动监听
   */
  start() {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;

    // 注意：这里暂时使用前端事件监听
    // 真实的全局键盘鼠标监听需要原生模块（如 uiohook-napi）
    // 由于原生模块编译问题，暂时使用模拟数据

    // 每1分钟保存一次数据
    this.saveInterval = setInterval(() => {
      this.saveStats();
    }, 1 * 60 * 1000); // 1分钟

    if (process.env.NODE_ENV !== 'production') {
      console.log('Input monitor started (using frontend events)');
    }
  }

  /**
   * 停止监听
   */
  stop() {
    if (!this.isRunning) {
      return;
    }

    // 立即保存当前统计数据
    this.saveStats();

    this.isRunning = false;

    // 清除定时器
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('Input monitor stopped');
    }
  }

  /**
   * 保存统计数据到数据库
   */
  async saveStats() {
    if (this.keyboardCount === 0 && this.mouseClickCount === 0 && this.mouseMoveDistance === 0) {
      return;
    }

    try {
      // 保存键盘统计
      if (this.keyboardCount > 0) {
        this.database.saveKeyboardStats(this.keyboardCount);
      }

      // 保存鼠标点击统计
      if (this.mouseClickCount > 0) {
        this.database.saveMouseClickStats('left', this.mouseClickCount);
      }

      // 保存鼠标移动统计
      if (this.mouseMoveDistance > 0) {
        this.database.saveMouseMoveStats(this.mouseMoveDistance);
      }

      if (process.env.NODE_ENV !== 'production') {
        console.log(`Stats saved: keyboard=${this.keyboardCount}, mouseClicks=${this.mouseClickCount}, mouseDistance=${this.mouseMoveDistance.toFixed(2)}`);
      }

      // 重置计数器
      this.keyboardCount = 0;
      this.mouseClickCount = 0;
      this.mouseMoveDistance = 0;
    } catch (error) {
      // Always log errors
      console.error('Failed to save stats:', error);
    }
  }

  /**
   * 更新统计数据（由前端调用）
   */
  updateStats(updates: {
    keyboardCount?: number;
    mouseClickCount?: number;
    mouseMoveDistance?: number;
  }) {
    if (updates.keyboardCount !== undefined && updates.keyboardCount > 0) {
      this.keyboardCount += updates.keyboardCount;
    }
    if (updates.mouseClickCount !== undefined && updates.mouseClickCount > 0) {
      this.mouseClickCount += updates.mouseClickCount;
    }
    if (updates.mouseMoveDistance !== undefined && updates.mouseMoveDistance > 0) {
      this.mouseMoveDistance += updates.mouseMoveDistance;
    }

    this.notifyStatsUpdate();
  }

  /**
   * 获取当前统计数据
   */
  getStats() {
    return {
      keyboardCount: this.keyboardCount,
      mouseClickCount: this.mouseClickCount,
      mouseMoveDistance: this.mouseMoveDistance
    };
  }

  /**
   * 设置统计数据更新回调
   */
  onStatsUpdate(callback: (stats: {
    keyboardCount: number;
    mouseClickCount: number;
    mouseMoveDistance: number;
  }) => void) {
    this.statsUpdateCallback = callback;
  }

  /**
   * 通知统计数据更新
   */
  private notifyStatsUpdate() {
    if (this.statsUpdateCallback) {
      const stats = {
        keyboardCount: this.keyboardCount,
        mouseClickCount: this.mouseClickCount,
        mouseMoveDistance: this.mouseMoveDistance
      };
      this.statsUpdateCallback(stats);
    }
  }

  /**
   * 重置统计数据
   */
  reset() {
    this.keyboardCount = 0;
    this.mouseClickCount = 0;
    this.mouseMoveDistance = 0;
    this.notifyStatsUpdate();
  }

  /**
   * 检查是否正在运行
   */
  isActive(): boolean {
    return this.isRunning;
  }
}
