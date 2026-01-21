/**
 * Enhanced Event Bus
 *
 * Global event system for renderer process communication
 * Features:
 * - Priority-based event queue
 * - Async event processing
 * - Error isolation
 * - Event history tracking
 */

import { logger } from "../../shared/logger";

export type EventPriority = "high" | "normal" | "low";
export type EventCallback = (...args: any[]) => void | Promise<void>;

interface QueuedEvent {
  event: string;
  args: any[];
  priority: EventPriority;
  timestamp: number;
}

interface Listener {
  callback: EventCallback;
  priority: EventPriority;
  once: boolean;
  context?: string;
}

interface SubscriptionOptions {
  priority?: EventPriority;
  once?: boolean;
  context?: string;
}

class EventEmitter {
  private listeners: Map<string, Set<Listener>> = new Map();
  private eventQueue: QueuedEvent[] = [];
  private isProcessing = false;
  private maxQueueSize = 1000;
  private eventHistory: QueuedEvent[] = [];
  private maxHistorySize = 100;

  /**
   * Subscribe to an event
   * @param event - Event name
   * @param callback - Callback function
   * @param options - Subscription options
   * @returns Unsubscribe function
   */
  on(
    event: string,
    callback: EventCallback,
    options: SubscriptionOptions = {},
  ): () => void {
    const { priority = "normal", once = false, context } = options;

    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    const listener: Listener = { callback, priority, once, context };
    this.listeners.get(event)!.add(listener);

    logger.debug(
      `[EventBus] Subscribed to "${event}" (priority: ${priority}, once: ${once})`,
    );

    // Return cleanup function
    return () => {
      this.listeners.get(event)?.delete(listener);
      logger.debug(`[EventBus] Unsubscribed from "${event}"`);
    };
  }

  /**
   * Subscribe to an event (one-time only)
   */
  once(
    event: string,
    callback: EventCallback,
    options?: Omit<SubscriptionOptions, "once">,
  ): () => void {
    return this.on(event, callback, { ...options, once: true });
  }

  /**
   * Emit an event
   * @param event - Event name
   * @param args - Arguments to pass to callbacks
   * @param options - Emit options
   */
  emit(event: string, ...args: any[]): void;
  emit(
    event: string,
    options: { priority?: EventPriority; delay?: number },
    ...args: any[]
  ): void;
  emit(event: string, optionsOrArgs: any, ...args: any[]): void {
    let priority: EventPriority = "normal";
    let delay: number | undefined;
    let eventArgs: any[] = [];

    // Handle overloaded signatures
    if (typeof optionsOrArgs === "object" && optionsOrArgs !== null) {
      priority = optionsOrArgs.priority || "normal";
      delay = optionsOrArgs.delay;
      eventArgs = args;
    } else {
      eventArgs = [optionsOrArgs, ...args];
    }

    // Add to queue
    this.eventQueue.push({
      event,
      args: eventArgs,
      priority,
      timestamp: Date.now(),
    });

    // Enforce max queue size
    if (this.eventQueue.length > this.maxQueueSize) {
      this.eventQueue.shift(); // Remove oldest event
      logger.warn("[EventBus] Event queue full, dropped oldest event");
    }

    // Process queue immediately or after delay
    if (delay) {
      setTimeout(() => this.processQueue(), delay);
    } else {
      this.processQueue();
    }
  }

  /**
   * Process the event queue with priority ordering
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      // Sort queue by priority
      this.eventQueue.sort((a, b) => {
        const priorityOrder = { high: 3, normal: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

      // Process events
      while (this.eventQueue.length > 0) {
        const queuedEvent = this.eventQueue.shift()!;

        // Add to history
        this.eventHistory.push(queuedEvent);
        if (this.eventHistory.length > this.maxHistorySize) {
          this.eventHistory.shift();
        }

        // Emit to listeners
        await this.notifyListeners(queuedEvent);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Notify all listeners for an event
   */
  private async notifyListeners(queuedEvent: QueuedEvent): Promise<void> {
    const { event, args } = queuedEvent;
    const listeners = this.listeners.get(event);

    if (!listeners || listeners.size === 0) {
      logger.debug(`[EventBus] No listeners for "${event}"`);
      return;
    }

    // Convert to array and sort by priority
    const priorityOrder = { high: 3, normal: 2, low: 1 };
    const listenersArray = Array.from(listeners).sort(
      (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority],
    );

    for (const listener of listenersArray) {
      try {
        await listener.callback(...args);

        // Remove one-time listeners
        if (listener.once) {
          listeners.delete(listener);
        }
      } catch (error) {
        logger.error(`[EventBus] Error in listener for "${event}"`, {
          error,
          context: listener.context,
        });
        // Continue processing other listeners even if one fails
      }
    }
  }

  /**
   * Remove all listeners for an event
   */
  off(event: string): void {
    this.listeners.delete(event);
    logger.debug(`[EventBus] Removed all listeners for "${event}"`);
  }

  /**
   * Remove all listeners for all events
   */
  removeAll(): void {
    this.listeners.clear();
    this.eventQueue = [];
    logger.info("[EventBus] Cleared all listeners and event queue");
  }

  /**
   * Get event statistics
   */
  getStats(): {
    totalEvents: number;
    eventQueueSize: number;
    listenersCount: number;
    recentEvents: QueuedEvent[];
  } {
    const listenersCount = Array.from(this.listeners.values()).reduce(
      (sum, set) => sum + set.size,
      0,
    );

    return {
      totalEvents: this.eventHistory.length,
      eventQueueSize: this.eventQueue.length,
      listenersCount,
      recentEvents: this.eventHistory.slice(-10).reverse(),
    };
  }

  /**
   * Get listener count for a specific event
   */
  listenerCount(event: string): number {
    return this.listeners.get(event)?.size || 0;
  }

  /**
   * Check if there are any listeners for an event
   */
  hasListeners(event: string): boolean {
    return (this.listeners.get(event)?.size || 0) > 0;
  }
}

// Singleton instance
export const eventBus = new EventEmitter();

// Define event names
export const AppEvents = {
  PLUGINS_CHANGED: "app:plugins-changed",
  THEME_CHANGED: "app:theme-changed",
  SETTINGS_CHANGED: "app:settings-changed",
  WINDOW_STATE_CHANGED: "app:window-state-changed",
  ERROR_OCCURRED: "app:error-occurred",
} as const;

export type AppEventName = keyof typeof AppEvents;

// Log stats every 60 seconds for debugging
if (process.env.NODE_ENV === "development") {
  setInterval(() => {
    const stats = eventBus.getStats();
    logger.debug("[EventBus] Stats:", stats);
  }, 60000);
}
