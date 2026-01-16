/**
 * 前端输入事件跟踪服务
 * 监听应用内的键盘和鼠标事件，并通过 IPC 发送到主进程
 */

class InputEventTracker {
  private isTracking: boolean = false;
  private keyboardCount: number = 0;
  private mouseClickCount: number = 0;
  private mouseMoveDistance: number = 0;
  private lastMousePosition: { x: number; y: number } | null = null;
  private updateThrottle: NodeJS.Timeout | null = null;
  private mouseMoveThrottle: number = 0;

  /**
   * 开始跟踪输入事件
   */
  start() {
    if (this.isTracking) {
      return;
    }

    this.isTracking = true;

    // 监听键盘事件
    document.addEventListener('keydown', this.handleKeyDown);

    // 监听鼠标点击
    document.addEventListener('click', this.handleMouseClick);

    // 监听鼠标移动（节流）
    document.addEventListener('mousemove', this.handleMouseMove);

    if (process.env.NODE_ENV !== 'production') {
      console.log('Input event tracker started');
    }
  }

  /**
   * 停止跟踪输入事件
   */
  stop() {
    if (!this.isTracking) {
      return;
    }

    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('click', this.handleMouseClick);
    document.removeEventListener('mousemove', this.handleMouseMove);

    this.isTracking = false;

    // 发送最终统计
    this.sendUpdate();

    if (process.env.NODE_ENV !== 'production') {
      console.log('Input event tracker stopped');
    }
  }

  /**
   * 处理键盘事件
   */
  private handleKeyDown = (event: KeyboardEvent) => {
    this.keyboardCount++;
    this.scheduleUpdate();
  };

  /**
   * 处理鼠标点击
   */
  private handleMouseClick = (event: MouseEvent) => {
    this.mouseClickCount++;
    this.scheduleUpdate();
  };

  /**
   * 处理鼠标移动（使用 requestAnimationFrame 优化性能）
   */
  private handleMouseMove = (event: MouseEvent) => {
    if (this.lastMousePosition) {
      const dx = event.clientX - this.lastMousePosition.x;
      const dy = event.clientY - this.lastMousePosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      this.mouseMoveDistance += distance;
    }
    this.lastMousePosition = { x: event.clientX, y: event.clientY };

    // 节流鼠标移动更新，避免过于频繁
    this.mouseMoveThrottle++;
    if (this.mouseMoveThrottle % 10 === 0) {
      this.scheduleUpdate();
    }
  };

  /**
   * 节流更新
   */
  private scheduleUpdate() {
    if (this.updateThrottle) {
      return;
    }

    this.updateThrottle = setTimeout(() => {
      this.sendUpdate();
      this.updateThrottle = null;
    }, 1000); // 每秒最多更新一次
  }

  /**
   * 发送更新到主进程
   */
  private sendUpdate() {
    if (window.electron?.ipcRenderer) {
      const updateData = {
        keyboardCount: this.keyboardCount,
        mouseClickCount: this.mouseClickCount,
        mouseMoveDistance: this.mouseMoveDistance
      };

      window.electron.ipcRenderer.send('input-monitor:update', updateData);

      // 重置本地计数
      this.keyboardCount = 0;
      this.mouseClickCount = 0;
      this.mouseMoveDistance = 0;
    }
  }

  /**
   * 获取当前统计
   */
  getStats() {
    return {
      keyboardCount: this.keyboardCount,
      mouseClickCount: this.mouseClickCount,
      mouseMoveDistance: this.mouseMoveDistance
    };
  }
}

// 导出单例
export const inputEventTracker = new InputEventTracker();
