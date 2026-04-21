/**
 * IPC 通信类型定义
 */

export type IPCChannel =
  | 'claudecode:execute'
  | 'claudecode:cancel'
  | 'file:read'
  | 'file:write'
  | 'file:delete'
  | 'file:list'
  | 'task:create'
  | 'task:update'
  | 'task:complete'
  | 'task:fail'
  // CLI 相关频道
  | 'cli:initializePool'
  | 'cli:acquire'
  | 'cli:release'
  | 'cli:sendMessage'
  | 'cli:getStats'
  | 'cli:dispose'
  | 'cli:streamData'
  // 配置相关频道
  | 'config:readClaude'
  | 'config:readModels'
  | 'config:readAll'
  | 'config:getCurrentModel'
  | 'config:getApiKey';

export interface IPCMessage<T = unknown> {
  id: string;
  channel: IPCChannel;
  payload: T;
  timestamp: number;
}

export interface IPCResponse<T = unknown> {
  id: string;
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

// ClaudeCode 执行相关
export interface ClaudeCodeExecutePayload {
  prompt: string;
  sessionId?: string;
  context?: {
    filePath?: string;
    lineNumber?: number;
    selectedText?: string;
  };
}

export interface ClaudeCodeExecuteResponse {
  response: string;
  sessionId: string;
  tasks?: TaskInfo[];
}

export interface TaskInfo {
  id: string;
  type: string;
  title: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
}

// 文件操作相关
export interface FileReadPayload {
  path: string;
  encoding?: string;
}

export interface FileReadResponse {
  content: string;
  encoding: string;
}

export interface FileWritePayload {
  path: string;
  content: string;
  encoding?: string;
}

export interface FileWriteResponse {
  success: boolean;
  path: string;
}

export interface FileDeletePayload {
  path: string;
}

export interface FileDeleteResponse {
  success: boolean;
  path: string;
}

export interface FileListPayload {
  path: string;
  recursive?: boolean;
}

export interface FileListResponse {
  files: FileNodeInfo[];
}

export interface FileNodeInfo {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  modified?: number;
}
