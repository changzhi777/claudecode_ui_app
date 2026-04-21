/**
 * IPC 客户端 - 渲染进程使用
 */

import type {
  IPCMessage,
  IPCResponse,
  IPCChannel,
  ClaudeCodeExecutePayload,
  ClaudeCodeExecuteResponse,
} from '@shared/types/ipc';

export class IPCClient {
  private pendingRequests = new Map<string, (response: IPCResponse) => void>();
  private messageId = 0;

  constructor() {
    // 监听来自主进程的响应
    if (window.electronAPI?.onMessage) {
      window.electronAPI.onMessage((response: IPCResponse) => {
        const resolver = this.pendingRequests.get(response.id);
        if (resolver) {
          resolver(response);
          this.pendingRequests.delete(response.id);
        }
      });
    }
  }

  /**
   * 发送消息到主进程
   */
  async send<T = unknown>(
    channel: IPCChannel,
    payload: unknown
  ): Promise<IPCResponse<T>> {
    const message: IPCMessage = {
      id: this.generateId(),
      channel,
      payload,
      timestamp: Date.now(),
    };

    return new Promise<IPCResponse<T>>((resolve, reject) => {
      // 设置超时
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(message.id);
        reject(new Error(`IPC timeout: ${channel}`));
      }, 30000); // 30 秒超时

      // 等待响应
      this.pendingRequests.set(message.id, (response: IPCResponse) => {
        clearTimeout(timeout);
        if (response.success) {
          resolve(response as IPCResponse<T>);
        } else {
          reject(new Error(response.error || 'IPC request failed'));
        }
      });

      // 发送消息
      if (window.electronAPI?.send) {
        window.electronAPI.send(message);
      } else {
        // 开发环境模拟
        console.warn('[IPC] Electron API not available, using mock');
        this.mockResponse<T>(message).then((response) => {
          resolve(response as IPCResponse<T>);
        });
      }
    });
  }

  /**
   * ClaudeCode 执行
   */
  async executeClaudeCode(
    payload: ClaudeCodeExecutePayload
  ): Promise<IPCResponse<ClaudeCodeExecuteResponse>> {
    return this.send<ClaudeCodeExecuteResponse>('claudecode:execute', payload);
  }

  /**
   * 取消 ClaudeCode 执行
   */
  async cancelClaudeCode(sessionId: string): Promise<IPCResponse<void>> {
    return this.send('claudecode:cancel', { sessionId });
  }

  /**
   * 读取文件
   */
  async readFile(path: string, encoding = 'utf-8'): Promise<IPCResponse<string>> {
    return this.send('file:read', { path, encoding });
  }

  /**
   * 写入文件
   */
  async writeFile(path: string, content: string, encoding = 'utf-8'): Promise<IPCResponse<void>> {
    return this.send('file:write', { path, content, encoding });
  }

  /**
   * 删除文件
   */
  async deleteFile(path: string): Promise<IPCResponse<void>> {
    return this.send('file:delete', { path });
  }

  /**
   * 列出文件
   */
  async listFiles(path: string, recursive = false): Promise<IPCResponse<string[]>> {
    return this.send('file:list', { path, recursive });
  }

  /**
   * 生成消息 ID
   */
  private generateId(): string {
    return `msg_${Date.now()}_${this.messageId++}`;
  }

  /**
   * 开发环境模拟响应
   */
  private async mockResponse<T>(message: IPCMessage): Promise<IPCResponse<T>> {
    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 100));

    switch (message.channel) {
      case 'claudecode:execute':
        return {
          id: message.id,
          success: true,
          data: {
            response: '模拟响应：收到你的消息',
            sessionId: 'mock-session',
            tasks: [],
          } as T,
          timestamp: Date.now(),
        };

      case 'file:read':
        return {
          id: message.id,
          success: true,
          data: '// 模拟文件内容' as T,
          timestamp: Date.now(),
        };

      default:
        return {
          id: message.id,
          success: true,
          data: undefined as T,
          timestamp: Date.now(),
        };
    }
  }
}

// 导出单例
export const ipcClient = new IPCClient();
