import type { IPCMessage, IPCResponse } from '@shared/types/ipc';

export interface ElectronAPI {
  platform: string;
  send: (message: IPCMessage) => void;
  onMessage: (callback: (response: IPCResponse) => void) => void;
  removeListener: () => void;
  // 扩展方法（用于 CLI 通信）
  invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
  on: (channel: string, callback: (...args: unknown[]) => void) => void;
  removeChannelListener: (channel: string) => void;
  once: (channel: string, callback: (...args: unknown[]) => void) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
