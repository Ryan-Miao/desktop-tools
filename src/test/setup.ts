import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// 每个测试后清理
afterEach(() => {
  cleanup();
});

// 模拟 Electron API（用于 Web 模式测试）
if (typeof window !== 'undefined' && !window.electron) {
  (window as any).electron = {
    ipcRenderer: {
      send: () => {},
      on: () => {},
      removeListener: () => {},
      invoke: async () => ({}),
    },
  };
}
