/**
 * IPC 服务器 - 主进程使用
 */

import { ipcMain } from 'electron';
import type {
  IPCMessage,
  IPCResponse,
  ClaudeCodeExecutePayload,
} from '@shared/types/ipc';

export class IPCServer {
  constructor() {
    this.setupListeners();
  }

  private setupListeners() {
    // 监听来自渲染进程的消息
    ipcMain.on('ipc-message', async (event, message: IPCMessage) => {
      try {
        const response = await this.handleMessage(message);
        event.reply('ipc-response', response);
      } catch (error) {
        const response: IPCResponse = {
          id: message.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: Date.now(),
        };
        event.reply('ipc-response', response);
      }
    });
  }

  /**
   * 处理消息
   */
  private async handleMessage(message: IPCMessage): Promise<IPCResponse> {
    console.log('[IPC Server] Received:', message.channel, message.payload);

    switch (message.channel) {
      case 'claudecode:execute':
        return this.handleClaudeCodeExecute(message as IPCMessage<ClaudeCodeExecutePayload>);

      case 'file:read':
        return this.handleFileRead(message);

      case 'file:write':
        return this.handleFileWrite(message);

      case 'file:delete':
        return this.handleFileDelete(message);

      case 'file:list':
        return this.handleFileList(message);

      default:
        return {
          id: message.id,
          success: false,
          error: `Unknown channel: ${message.channel}`,
          timestamp: Date.now(),
        };
    }
  }

  /**
   * 处理 ClaudeCode 执行
   */
  private async handleClaudeCodeExecute(
    message: IPCMessage<ClaudeCodeExecutePayload>
  ): Promise<IPCResponse> {
    // TODO: 实际调用 ClaudeCode CLI
    console.log('[IPC Server] Executing ClaudeCode:', message.payload);

    return {
      id: message.id,
      success: true,
      data: {
        response: '模拟 AI 响应',
        sessionId: 'session-' + Date.now(),
        tasks: [],
      },
      timestamp: Date.now(),
    };
  }

  /**
   * 处理文件读取
   */
  private async handleFileRead(message: IPCMessage): Promise<IPCResponse> {
    // TODO: 实际读取文件
    console.log('[IPC Server] Reading file:', message.payload);

    return {
      id: message.id,
      success: true,
      data: '// 文件内容',
      timestamp: Date.now(),
    };
  }

  /**
   * 处理文件写入
   */
  private async handleFileWrite(message: IPCMessage): Promise<IPCResponse> {
    // TODO: 实际写入文件
    console.log('[IPC Server] Writing file:', message.payload);

    return {
      id: message.id,
      success: true,
      data: undefined,
      timestamp: Date.now(),
    };
  }

  /**
   * 处理文件删除
   */
  private async handleFileDelete(message: IPCMessage): Promise<IPCResponse> {
    // TODO: 实际删除文件
    console.log('[IPC Server] Deleting file:', message.payload);

    return {
      id: message.id,
      success: true,
      data: undefined,
      timestamp: Date.now(),
    };
  }

  /**
   * 处理文件列表
   */
  private async handleFileList(message: IPCMessage): Promise<IPCResponse> {
    // TODO: 实际列出文件
    console.log('[IPC Server] Listing files:', message.payload);

    return {
      id: message.id,
      success: true,
      data: [],
      timestamp: Date.now(),
    };
  }
}
