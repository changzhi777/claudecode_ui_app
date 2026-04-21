/**
 * 测试环境全局类型定义
 */

import type { IPCMessage, IPCResponse } from '@shared/types/ipc';

declare global {
  interface Window {
    electronAPI: {
      platform: string;
      send: (message: IPCMessage) => void;
      onMessage: (callback: (response: IPCResponse) => void) => void;
      removeListener: () => void;
      invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
      on: (channel: string, callback: (...args: unknown[]) => void) => void;
      removeChannelListener: (channel: string) => void;
      once: (channel: string, callback: (...args: unknown[]) => void) => void;
    };
  }

  namespace Vi {
    // 扩展 Vitest 类型
    // 如果需要的话
  }
}

export {};
