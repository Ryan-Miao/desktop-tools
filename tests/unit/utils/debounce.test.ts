/**
 * Debounce Utility Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce, throttle } from '@renderer/utils/debounce';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should delay function execution', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 1000);

    debouncedFn();

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should reset timer on subsequent calls', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 1000);

    debouncedFn();
    vi.advanceTimersByTime(500);

    debouncedFn();
    vi.advanceTimersByTime(500);

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should pass arguments to debounced function', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 1000);

    debouncedFn('arg1', 'arg2');

    vi.advanceTimersByTime(1000);

    expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('should maintain context', () => {
    const obj = {
      value: 'test',
      method: vi.fn(function(this: any) {
        return this.value;
      }),
    };

    const debouncedMethod = debounce(obj.method, 1000);
    debouncedMethod.call(obj);

    vi.advanceTimersByTime(1000);

    expect(obj.method).toHaveBeenCalledTimes(1);
  });
});

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should execute function immediately', () => {
    const fn = vi.fn();
    const throttledFn = throttle(fn, 1000);

    throttledFn();

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should throttle subsequent calls', () => {
    const fn = vi.fn();
    const throttledFn = throttle(fn, 1000);

    throttledFn();
    throttledFn();
    throttledFn();

    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1000);

    throttledFn();

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should pass arguments to throttled function', () => {
    const fn = vi.fn();
    const throttledFn = throttle(fn, 1000);

    throttledFn('arg1', 'arg2');

    expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('should execute last call after delay', () => {
    const fn = vi.fn();
    const throttledFn = throttle(fn, 1000);

    throttledFn();
    vi.advanceTimersByTime(500);
    throttledFn();
    vi.advanceTimersByTime(2000);

    expect(fn).toHaveBeenCalledTimes(2);
  });
});
