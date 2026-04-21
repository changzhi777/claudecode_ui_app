/**
 * CLI Worker 线程
 *
 * 负责处理 CLI 通信的业务逻辑
 * 通过 postMessage 与主线程通信
 */

// Worker 消息类型
interface WorkerMessage {
  type: 'INITIALIZE' | 'SEND_MESSAGE' | 'SWITCH_MODE' | 'DISPOSE' | 'IPC_RESPONSE'
  payload?: unknown
}

interface InitializePayload {
  sessionId: string
}

interface SendMessagePayload {
  content: string
}

interface SwitchModePayload {
  mode: 'stream' | 'single'
}

interface IPCResponsePayload {
  channel: string
  args: unknown[]
}

// 流式数据消息
interface StreamDataMessage {
  type: 'STREAM_DATA' | 'SINGLE_RESPONSE' | 'ERROR' | 'INITIALIZED' | 'MODE_SWITCHED' | 'DISPOSED'
  payload?: unknown
}

// Worker 状态
interface WorkerState {
  sessionId: string | null
  mode: 'stream' | 'single'
  isInitialized: boolean
}

const state: WorkerState = {
  sessionId: null,
  mode: 'stream',
  isInitialized: false
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
 * 发送消息到 CLI
 */
async function sendMessage(payload: SendMessagePayload): Promise<void> {
  if (!state.isInitialized || !state.sessionId) {
    throw new Error('Worker 未初始化');
  }

  const { content } = payload;

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
  const { channel, args } = payload;

  // 处理流式数据
  if (channel === 'cli:streamData') {
    const data = args[0] as { sessionId: string; data: unknown };
    if (data.sessionId === state.sessionId) {
      postMessage({
        type: 'STREAM_DATA',
        payload: data.data
      } as StreamDataMessage);
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
