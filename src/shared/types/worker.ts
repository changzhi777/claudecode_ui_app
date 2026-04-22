/**
 * Worker 线程共享类型定义
 *
 * 统一管理主线程和Worker线程之间的通信类型
 */

/**
 * 通信模式
 */
export type CommunicationMode = 'stream' | 'single';

/**
 * Worker 消息类型（主线程 -> Worker）
 */
export interface WorkerMessage {
  type: 'INITIALIZE' | 'SEND_MESSAGE' | 'SWITCH_MODE' | 'DISPOSE' | 'IPC_RESPONSE';
  payload?: unknown;
}

/**
 * Worker 响应类型（Worker -> 主线程）
 */
export interface WorkerResponse {
  type: 'INITIALIZED' | 'STREAM_DATA' | 'SINGLE_RESPONSE' | 'MODE_SWITCHED' | 'DISPOSED' | 'SEND_MESSAGE' | 'ERROR';
  payload?: unknown;
}

/**
 * 初始化参数
 */
export interface InitializePayload {
  sessionId: string;
}

/**
 * 发送消息参数
 */
export interface SendMessagePayload {
  content: string;
}

/**
 * 切换模式参数
 */
export interface SwitchModePayload {
  mode: CommunicationMode;
}

/**
 * IPC 响应参数
 */
export interface IPCResponsePayload {
  channel: string;
  args: unknown[];
}

/**
 * 流式数据
 */
export interface StreamData {
  type: string;
  subtype?: string;
  content?: string;
  sessionId: string;
  timestamp: number;
  [key: string]: unknown;
}

/**
 * Worker 状态
 */
export interface WorkerState {
  sessionId: string | null;
  mode: CommunicationMode;
  isInitialized: boolean;
}

/**
 * Worker 配置
 */
export interface WorkerConfig {
  sessionId: string;
  defaultMode?: CommunicationMode;
}
