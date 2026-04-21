import type { IPCMessage, IPCResponse } from '@shared/types/ipc';

export interface ElectronAPI {
  platform: string;
  send: (message: IPCMessage) => void;
  onMessage: (callback: (response: IPCResponse) => void) => void;
  removeListener: () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
