/**
 * CLI Worker 管理器
 *
 * 简化 Worker 使用接口
 * 管理 Worker 生命周期
 * 桥接 Worker 和主进程 IPC 通信
 */

import type {
  CommunicationMode,
  StreamData,
  WorkerResponse,
  WorkerConfig,
} from '@shared/types/worker';

export type { CommunicationMode, StreamData };

/**
 * Worker 管理器
 */
export class WorkerManager {
  private worker: Worker | null = null;
  private sessionId: string;
  private mode: CommunicationMode;
  private streamCallback?: (data: StreamData) => void;
  private responseCallback?: (data: StreamData) => void;
  private errorCallback?: (error: Error) => void;
  private isInitialized = false;

  // 消息重发机制
  private retryQueue: Array<{ content: string; retries: number; timestamp: number }> = [];
  private maxRetries = 3;
  private isConnected = true;
  private readonly MAX_RETRY_QUEUE_SIZE = 50; // 最大重试队列大小

  constructor(config: WorkerConfig) {
    this.sessionId = config.sessionId;
    this.mode = config.defaultMode || 'stream';
  }

  /**
   * 初始化 Worker
   */
  async initialize(): Promise<void> {
    if (this.worker) {
      throw new Error('Worker 已存在');
    }

    if (!window.electronAPI) {
      throw new Error('electronAPI 未定义');
    }

    // 监听主进程的流式数据（使用 onMessage）
    window.electronAPI.onMessage((response) => {
      // IPCResponse 结构：{ id, success, data?, error?, timestamp }
      // 我们通过 channel 字段区分不同的响应
      if (response.success && response.data) {
        const data = response.data as { channel: string; payload: unknown };
        if (data.channel === 'cli:streamData') {
          this.handleStreamData(data.payload as { sessionId: string; data: unknown });
        }
      }
    });

    return new Promise((resolve, reject) => {
      try {
        // 创建 Worker
        this.worker = new Worker(
          new URL('../workers/cli-worker.ts', import.meta.url),
          { type: 'module' }
        );

        // 监听 Worker 消息
        this.worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
          const { type, payload } = e.data;

          switch (type) {
            case 'INITIALIZED':
              this.isInitialized = true;
              console.log('[WorkerManager] Worker 已初始化');
              resolve();
              break;

            case 'STREAM_DATA':
              if (this.streamCallback) {
                this.streamCallback(payload as StreamData);
              }
              break;

            case 'SINGLE_RESPONSE':
              if (this.responseCallback) {
                this.responseCallback(payload as StreamData);
              }
              break;

            case 'MODE_SWITCHED':
              console.log('[WorkerManager] 模式已切换:', payload);
              break;

            case 'DISPOSED':
              console.log('[WorkerManager] Worker 已清理');
              break;

            case 'SEND_MESSAGE':
              // Worker 请求发送消息到主进程
              this.handleSendMessage(payload as { sessionId: string; content: string });
              break;

            case 'ERROR':
              const error = new Error((payload as { error: string }).error);
              if (this.errorCallback) {
                this.errorCallback(error);
              } else {
                console.error('[WorkerManager] Worker 错误:', error);
              }
              break;
          }
        };

        // Worker 错误处理
        this.worker.onerror = (error) => {
          const err = new Error(`Worker 错误: ${error.message}`);
          if (this.errorCallback) {
            this.errorCallback(err);
          }
          reject(err);
        };

        // 初始化 Worker
        this.postMessage({
          type: 'INITIALIZE',
          payload: { sessionId: this.sessionId }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 处理主进程的流式数据
   */
  private handleStreamData(data: { sessionId: string; data: unknown }): void {
    // 转发给 Worker
    this.postMessage({
      type: 'IPC_RESPONSE',
      payload: { channel: 'cli:streamData', args: [data] }
    });
  }

  /**
   * 处理 Worker 的发送消息请求
   */
  private handleSendMessage(payload: { sessionId: string; content: string }): void {
    if (!window.electronAPI) {
      console.error('[WorkerManager] electronAPI 未定义');
      return;
    }

    // 发送到主进程（使用现有的 IPCMessage 格式）
    window.electronAPI.send({
      id: `msg_${Date.now()}_${Math.random()}`,
      channel: 'cli:sendMessage',
      payload: [payload.sessionId, payload.content],
      timestamp: Date.now()
    });
  }

  /**
   * 发送消息
   */
  async sendMessage(content: string): Promise<void> {
    if (!this.worker || !this.isInitialized) {
      throw new Error('Worker 未初始化');
    }

    if (!this.isConnected) {
      // 连接断开，加入重试队列
      if (this.retryQueue.length >= this.MAX_RETRY_QUEUE_SIZE) {
        console.warn('[WorkerManager] 重试队列已满，丢弃最旧的消息');
        this.retryQueue.shift(); // 移除最旧的消息
      }

      this.retryQueue.push({
        content,
        retries: 0,
        timestamp: Date.now()
      });
      console.warn('[WorkerManager] 连接断开，消息已加入重试队列');
      return;
    }

    try {
      this.postMessage({
        type: 'SEND_MESSAGE',
        payload: { content }
      });
    } catch (error) {
      // 发送失败，加入重试队列
      if (this.retryQueue.length >= this.MAX_RETRY_QUEUE_SIZE) {
        console.warn('[WorkerManager] 重试队列已满，丢弃最旧的消息');
        this.retryQueue.shift();
      }

      this.retryQueue.push({
        content,
        retries: 0,
        timestamp: Date.now()
      });
      console.error('[WorkerManager] 发送失败，已加入重试队列:', error);
      throw error;
    }
  }

  /**
   * 处理重试队列
   */
  private processRetryQueue(): void {
    if (this.retryQueue.length === 0) return;

    console.log(`[WorkerManager] 处理重试队列，待重发消息: ${this.retryQueue.length}`);

    const failedMessages: typeof this.retryQueue = [];

    for (const item of this.retryQueue) {
      if (item.retries >= this.maxRetries) {
        console.error('[WorkerManager] 消息重试次数已达上限:', item.content.substring(0, 50));
        continue;
      }

      try {
        this.postMessage({
          type: 'SEND_MESSAGE',
          payload: { content: item.content }
        });

        console.log(`[WorkerManager] 消息重发成功 (${item.retries + 1}/${this.maxRetries})`);
      } catch (error) {
        item.retries++;
        failedMessages.push(item);
        console.error('[WorkerManager] 消息重发失败:', error);
      }
    }

    this.retryQueue = failedMessages;
  }

  /**
   * 标记连接状态
   */
  setConnectedState(connected: boolean): void {
    const wasDisconnected = !this.isConnected;
    this.isConnected = connected;

    if (wasDisconnected && connected) {
      // 从断开恢复，处理重试队列
      this.processRetryQueue();
    }
  }

  /**
   * 切换通信模式
   */
  async switchMode(mode: CommunicationMode): Promise<void> {
    if (!this.worker || !this.isInitialized) {
      throw new Error('Worker 未初始化');
    }

    this.mode = mode;

    this.postMessage({
      type: 'SWITCH_MODE',
      payload: { mode }
    });
  }

  /**
   * 订阅流式数据
   */
  onStreamData(callback: (data: StreamData) => void): void {
    this.streamCallback = callback;
  }

  /**
   * 订阅单次响应
   */
  onResponse(callback: (data: StreamData) => void): void {
    this.responseCallback = callback;
  }

  /**
   * 订阅错误
   */
  onError(callback: (error: Error) => void): void {
    this.errorCallback = callback;
  }

  /**
   * 取消订阅
   */
  unsubscribe(): void {
    this.streamCallback = undefined;
    this.responseCallback = undefined;
    this.errorCallback = undefined;
  }

  /**
   * 获取当前模式
   */
  getMode(): CommunicationMode {
    return this.mode;
  }

  /**
   * 检查是否已初始化
   */
  ready(): boolean {
    return this.isInitialized;
  }

  /**
   * 清理 Worker
   */
  async dispose(): Promise<void> {
    if (!this.worker) {
      return;
    }

    this.postMessage({ type: 'DISPOSE' });

    // 等待 Worker 清理完成
    await new Promise(resolve => setTimeout(resolve, 100));

    this.worker.terminate();
    this.worker = null;
    this.isInitialized = false;
    this.unsubscribe();

    // 移除主进程监听器
    if (window.electronAPI) {
      window.electronAPI.removeListener();
    }

    console.log('[WorkerManager] Worker 已终止');
  }

  /**
   * 发送消息到 Worker
   */
  private postMessage(message: { type: string; payload?: unknown }): void {
    this.worker?.postMessage(message);
  }
}
