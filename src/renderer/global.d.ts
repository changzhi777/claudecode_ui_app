/**
 * 全局类型声明
 * 扩展现有的 ElectronAPI 类型
 */

import type { IPCMessage, IPCResponse } from '@shared/types/ipc';

declare global {
  interface Window {
    electronAPI: {
      platform: string
      send: (message: IPCMessage) => void
      onMessage: (callback: (response: IPCResponse) => void) => void
      removeListener: () => void
      // 扩展方法（用于 CLI 通信）
      invoke?: (channel: string, ...args: unknown[]) => Promise<unknown>
      on?: (channel: string, callback: (...args: unknown[]) => void) => void
      once?: (channel: string, callback: (...args: unknown[]) => void) => void
    }
  }
}

export {}

