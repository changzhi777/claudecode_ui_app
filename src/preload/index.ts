import { contextBridge, ipcRenderer } from 'electron';

// 暴露安全的 API 给渲染进程（最小化版本）
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,

  // 发送消息到主进程
  send: (channel: string, ...args: unknown[]) => {
    ipcRenderer.send(channel, ...args);
  },

  // 发送消息到主进程（带回调）
  invoke: (channel: string, ...args: unknown[]) => {
    return ipcRenderer.invoke(channel, ...args);
  },

  // 监听来自主进程的响应
  on: (channel: string, callback: (...args: unknown[]) => void) => {
    ipcRenderer.on(channel, (_event, ...args) => callback(...args));
  },

  // 移除监听器
  removeListener: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },

  // 一次性监听器
  once: (channel: string, callback: (...args: unknown[]) => void) => {
    ipcRenderer.once(channel, (_event, ...args) => callback(...args));
  },
});
