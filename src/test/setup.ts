/**
 * Vitest 测试设置文件
 */

import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// 扩展 Vitest 的expect 断言
expect.extend(matchers);

// 每个测试后清理
afterEach(() => {
  cleanup();
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
global.localStorage = localStorageMock as any;

// Mock window.electronAPI
const mockElectronAPI = {
  platform: 'darwin',
  send: vi.fn(),
  onMessage: vi.fn(),
  removeListener: vi.fn(),
  invoke: vi.fn(),
  on: vi.fn(),
  removeChannelListener: vi.fn(),
  once: vi.fn(),
};

global.window.electronAPI = mockElectronAPI;

// Mock IPC Main
vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn(),
    on: vi.fn(),
    removeHandler: vi.fn(),
  },
  ipcRenderer: {
    send: vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn(),
    invoke: vi.fn(),
    once: vi.fn(),
  },
}));

