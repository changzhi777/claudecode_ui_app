import { contextBridge, ipcRenderer } from 'electron';
import type { IPCMessage, IPCResponse } from '@shared/types/ipc';

// 暴露安全的 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,

  // 发送消息到主进程
  send: (message: IPCMessage) => {
    ipcRenderer.send('ipc-message', message);
  },

  // 监听来自主进程的响应
  onMessage: (callback: (response: IPCResponse) => void) => {
    ipcRenderer.on('ipc-response', (_event, response: IPCResponse) => {
      callback(response);
    });
  },

  // 移除监听器
  removeListener: () => {
    ipcRenderer.removeAllListeners('ipc-response');
  },
});
