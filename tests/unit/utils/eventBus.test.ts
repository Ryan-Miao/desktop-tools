/**
 * EventBus Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { eventBus } from "@renderer/utils/eventBus";

describe("EventBus", () => {
  beforeEach(() => {
    // Clear all listeners before each test
    eventBus.removeAll();
  });

  describe("on", () => {
    it("should register event listener", () => {
      const callback = vi.fn();
      eventBus.on("test-event", callback);

      eventBus.emit("test-event");

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should return unsubscribe function", () => {
      const callback = vi.fn();
      const unsubscribe = eventBus.on("test-event", callback);

      unsubscribe();
      eventBus.emit("test-event");

      expect(callback).not.toHaveBeenCalled();
    });

    it("should pass arguments to callback", () => {
      const callback = vi.fn();
      eventBus.on("test-event", callback);

      eventBus.emit("test-event", "arg1", "arg2");

      expect(callback).toHaveBeenCalledWith("arg1", "arg2");
    });

    it("should support priority listeners", async () => {
      const order: number[] = [];
      const callback1 = vi.fn(() => order.push(1));
      const callback2 = vi.fn(() => order.push(2));
      const callback3 = vi.fn(() => order.push(3));

      eventBus.on("test-event", callback1, { priority: "low" });
      eventBus.on("test-event", callback2, { priority: "high" });
      eventBus.on("test-event", callback3, { priority: "normal" });

      eventBus.emit("test-event");

      // Wait for async processing
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(order).toEqual([2, 3, 1]); // high, normal, low
    });
  });

  describe("once", () => {
    it("should only call listener once", () => {
      const callback = vi.fn();
      eventBus.once("test-event", callback);

      eventBus.emit("test-event");
      eventBus.emit("test-event");

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe("emit", () => {
    it("should emit to all listeners", async () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      eventBus.on("test-event", callback1);
      eventBus.on("test-event", callback2);

      eventBus.emit("test-event");

      // Wait for async processing
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    it("should handle priority in emit options", async () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      eventBus.on("test-event", callback1);
      eventBus.on("test-event", callback2);

      eventBus.emit("test-event", { priority: "normal" });

      // Wait for async processing
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    it("should handle async callbacks", async () => {
      const callback = vi.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      eventBus.on("test-event", callback);
      eventBus.emit("test-event");

      // Wait for async callback to complete
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe("error isolation", () => {
    it("should continue processing if one listener throws", async () => {
      const callback1 = vi.fn(() => {
        throw new Error("Test error");
      });
      const callback2 = vi.fn();

      eventBus.on("test-event", callback1);
      eventBus.on("test-event", callback2);

      eventBus.emit("test-event");

      // Wait for async processing
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });
  });

  describe("listenerCount", () => {
    it("should return 0 for non-existent event", () => {
      expect(eventBus.listenerCount("non-existent")).toBe(0);
    });

    it("should return correct count", () => {
      eventBus.on("test-event", vi.fn());
      eventBus.on("test-event", vi.fn());
      eventBus.on("test-event", vi.fn());

      expect(eventBus.listenerCount("test-event")).toBe(3);
    });
  });

  describe("hasListeners", () => {
    it("should return false for non-existent event", () => {
      expect(eventBus.hasListeners("non-existent")).toBe(false);
    });

    it("should return true when listeners exist", () => {
      eventBus.on("test-event", vi.fn());

      expect(eventBus.hasListeners("test-event")).toBe(true);
    });
  });

  describe("off", () => {
    it("should remove all listeners for event", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      eventBus.on("test-event", callback1);
      eventBus.on("test-event", callback2);

      eventBus.off("test-event");
      eventBus.emit("test-event");

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
    });
  });

  describe("getStats", () => {
    it("should return event statistics", () => {
      const callback = vi.fn();
      eventBus.on("test-event", callback);
      eventBus.emit("test-event");

      const stats = eventBus.getStats();

      expect(stats.listenersCount).toBe(1);
      expect(stats.totalEvents).toBeGreaterThan(0);
    });
  });
});
