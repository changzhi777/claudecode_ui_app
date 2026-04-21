/**
 * CLI Worker 管理器
 *
 * 简化 Worker 使用接口
 * 管理 Worker 生命周期
 * 桥接 Worker 和主进程 IPC 通信
 */

export type CommunicationMode = 'stream' | 'single';

export interface StreamData {
  type: string;
  subtype?: string;
  content?: string;
  sessionId: string;
  timestamp: number;
  [key: string]: unknown;
}

interface WorkerResponse {
  type: 'INITIALIZED' | 'STREAM_DATA' | 'SINGLE_RESPONSE' | 'MODE_SWITCHED' | 'DISPOSED' | 'SEND_MESSAGE' | 'ERROR'
  payload?: unknown
}

interface WorkerConfig {
  sessionId: string
  defaultMode?: CommunicationMode
}

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

    this.postMessage({
      type: 'SEND_MESSAGE',
      payload: { content }
    });
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
