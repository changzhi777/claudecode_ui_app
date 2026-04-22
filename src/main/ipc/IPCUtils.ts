/**
 * IPC 工具函数
 *
 * 简化 IPC 处理器注册
 */

import { ipcMain, IpcMainInvokeEvent } from 'electron';

/**
 * IPC 处理器函数类型
 */
type IPCHandler<T = any> = (event: IpcMainInvokeEvent, ...args: any[]) => Promise<T>;

/**
 * 注册 IPC 处理器
 *
 * @param channel IPC 频道名称
 * @param handler 处理器函数
 */
export function ipcHandler<T = any>(channel: string, handler: IPCHandler<T>): void {
  ipcMain.handle(channel, handler);
}

/**
 * 注册单向 IPC 监听器
 *
 * @param channel IPC 频道名称
 * @param listener 监听器函数
 */
export function ipcListener(channel: string, listener: (event: Electron.IpcMainEvent, ...args: any[]) => void): void {
  ipcMain.on(channel, listener);
}

/**
 * 一次性 IPC 监听器
 *
 * @param channel IPC 频道名称
 * @param listener 监听器函数
 */
export function ipcOnce(channel: string, listener: (event: Electron.IpcMainEvent, ...args: any[]) => void): void {
  ipcMain.once(channel, listener);
}

/**
 * 移除 IPC 监听器
 *
 * @param channel IPC 频道名称
 * @param listener 要移除的监听器函数
 */
export function removeIPCListener(channel: string, listener: (...args: any[]) => void): void {
  ipcMain.removeListener(channel, listener);
}

/**
 * 移除所有 IPC 监听器
 *
 * @param channel IPC 频道名称
 */
export function removeAllIPCListeners(channel: string): void {
  ipcMain.removeAllListeners(channel);
}
