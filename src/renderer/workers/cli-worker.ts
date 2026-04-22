/**
 * CLI Worker 线程
 *
 * 负责处理 CLI 通信的业务逻辑
 * 通过 postMessage 与主线程通信
 */

import type {
  WorkerMessage,
  InitializePayload,
  SendMessagePayload,
  SwitchModePayload,
  IPCResponsePayload,
  WorkerState,
} from '@shared/types/worker';

// 流式数据消息
interface StreamDataMessage {
  type: 'STREAM_DATA' | 'SINGLE_RESPONSE' | 'ERROR' | 'INITIALIZED' | 'MODE_SWITCHED' | 'DISPOSED';
  payload?: unknown;
}

// 超时配置
interface TimeoutConfig {
  duration: number
  timer: number | null
}

// 重试配置
interface RetryConfig {
  maxRetries: number
  currentAttempt: number
  baseDelay: number
}

const state: WorkerState = {
  sessionId: null,
  mode: 'stream',
  isInitialized: false
};

// 超时状态
const timeoutState: TimeoutConfig = {
  duration: 30000, // 30秒超时
  timer: null
};

// 重试状态
const retryState: RetryConfig = {
  maxRetries: 3,
  currentAttempt: 0,
  baseDelay: 1000 // 1秒基础延迟
};

/**
 * 初始化 Worker
 */
async function initialize(payload: InitializePayload): Promise<void> {
  const { sessionId } = payload;
  state.sessionId = sessionId;
  state.isInitialized = true;

  console.log('[CLI Worker] 初始化成功，会话:', sessionId);
}

/**
 * 启动超时检测
 */
function startTimeoutDetector(): void {
  // 清除现有定时器
  if (timeoutState.timer !== null) {
    clearTimeout(timeoutState.timer);
  }

  // 启动新的超时检测
  timeoutState.timer = setTimeout(() => {
    console.error('[CLI Worker] 响应超时:', timeoutState.duration);

    postMessage({
      type: 'ERROR',
      payload: { error: 'API响应超时，请重试' }
    });

    // 尝试重试
    if (retryState.currentAttempt < retryState.maxRetries) {
      retryWithBackoff();
    } else {
      console.error('[CLI Worker] 已达到最大重试次数');
      retryState.currentAttempt = 0;
    }
  }, timeoutState.duration) as unknown as number;

  console.log('[CLI Worker] 超时检测已启动:', timeoutState.duration);
}

/**
 * 停止超时检测
 */
function stopTimeoutDetector(): void {
  if (timeoutState.timer !== null) {
    clearTimeout(timeoutState.timer);
    timeoutState.timer = null;
    console.log('[CLI Worker] 超时检测已停止');
  }
}

/**
 * 指数退避重试
 */
function retryWithBackoff(): Promise<void> {
  return new Promise((resolve) => {
    const delay = retryState.baseDelay * Math.pow(2, retryState.currentAttempt);

    console.log(`[CLI Worker] 指数退避重试 (${retryState.currentAttempt + 1}/${retryState.maxRetries}), 延迟: ${delay}ms`);

    setTimeout(() => {
      retryState.currentAttempt++;

      postMessage({
        type: 'SEND_MESSAGE',
        payload: { sessionId: state.sessionId, content: '[自动重试中...]' }
      });

      resolve();
    }, delay);
  });
}

/**
 * 重置重试状态（收到响应时调用）
 */
function resetRetryState(): void {
  retryState.currentAttempt = 0;
  stopTimeoutDetector();
}

/**
 * 发送消息到 CLI
 */
async function sendMessage(payload: SendMessagePayload): Promise<void> {
  if (!state.isInitialized || !state.sessionId) {
    throw new Error('Worker 未初始化');
  }

  const { content } = payload;

  // 重置重试状态
  resetRetryState();

  // 启动超时检测
  startTimeoutDetector();

  // 通过主线程发送到主进程
  postMessage({
    type: 'SEND_MESSAGE',
    payload: { sessionId: state.sessionId, content }
  });

  console.log('[CLI Worker] 消息已发送:', content.substring(0, 50));
}

/**
 * 切换通信模式
 */
async function switchMode(payload: SwitchModePayload): Promise<void> {
  const { mode } = payload;

  if (state.mode === mode) {
    console.log('[CLI Worker] 模式已是:', mode);
    return;
  }

  console.log('[CLI Worker] 切换模式:', state.mode, '->', mode);
  state.mode = mode;
}

/**
 * 清理资源
 */
function dispose(): void {
  console.log('[CLI Worker] 清理资源');

  if (state.sessionId) {
    // 通知主线程释放进程
    postMessage({
      type: 'DISPOSE',
      payload: { sessionId: state.sessionId }
    });
  }

  state.sessionId = null;
  state.isInitialized = false;
}

/**
 * 处理来自主线程的 IPC 响应
 */
function handleIPCResponse(payload: IPCResponsePayload): void {
  const startTime = performance.now();

  const { channel, args } = payload;

  // 处理流式数据
  if (channel === 'cli:streamData') {
    const data = args[0] as { sessionId: string; data: unknown };
    if (data.sessionId === state.sessionId) {
      // 收到响应，重置超时和重试状态
      resetRetryState();

      postMessage({
        type: 'STREAM_DATA',
        payload: data.data
      } as StreamDataMessage);

      // 性能监控：记录处理时间
      const duration = performance.now() - startTime;
      if (duration > 10) { // 超过10ms记录警告
        console.warn(`[CLI Worker] IPC响应处理耗时: ${duration.toFixed(2)}ms`);
      }
    }
  }
}

// Worker 消息处理
self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { type, payload } = e.data;

  try {
    switch (type) {
      case 'INITIALIZE':
        await initialize(payload as InitializePayload);
        postMessage({ type: 'INITIALIZED', payload: { sessionId: state.sessionId } });
        break;

      case 'SEND_MESSAGE':
        await sendMessage(payload as SendMessagePayload);
        break;

      case 'SWITCH_MODE':
        await switchMode(payload as SwitchModePayload);
        postMessage({ type: 'MODE_SWITCHED', payload: { mode: state.mode } });
        break;

      case 'DISPOSE':
        dispose();
        postMessage({ type: 'DISPOSED' });
        break;

      case 'IPC_RESPONSE':
        handleIPCResponse(payload as IPCResponsePayload);
        break;

      default:
        console.warn('[CLI Worker] 未知消息类型:', type);
    }
  } catch (error) {
    console.error('[CLI Worker] 错误:', error);
    postMessage({
      type: 'ERROR',
      payload: { error: (error as Error).message }
    });
  }
};

console.log('[CLI Worker] 已加载');

// 导出空对象以避免模块错误
export {};

// 导出空对象以避免模块错误
export {};
