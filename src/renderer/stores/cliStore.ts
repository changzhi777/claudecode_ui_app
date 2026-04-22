import { create } from 'zustand';
import { WorkerManager, CommunicationMode, StreamData } from '../services/WorkerManager';

/**
 * CLI 消息
 */
export interface CLIMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: number;
  status?: 'streaming' | 'completed' | 'error';
  metadata?: MessageMetadata;
}

/**
 * 消息元数据
 */
export interface MessageMetadata {
  model?: string;
  tokens?: number;
  duration?: number;
  cost?: number;
  tools?: ToolCall[];
}

/**
 * 工具调用
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ToolCall {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input?: any;
  output?: any;
  duration?: number;
  error?: string;
  startTime?: number;
}

/**
 * 会话统计
 */
export interface SessionStats {
  totalMessages: number;
  totalTokens: number;
  totalCost: number;
  duration: number;
  toolCalls: string[];
}

/**
 * CLI Store 状态
 */
export interface CLIStoreState {
  // 会话状态
  sessionId: string | null;
  isConnected: boolean;
  isProcessing: boolean;
  mode: CommunicationMode;

  // 消息
  messages: CLIMessage[];
  currentMessage: string; // 正在输入的消息

  // 工具调用
  currentTool: string | null;
  activeTools: Map<string, ToolCall>;

  // 统计
  stats: SessionStats;

  // 操作
  initialize: (sessionId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  switchMode: (mode: CommunicationMode) => Promise<void>;
  clearMessages: () => void;
  disconnect: () => Promise<void>;

  // 会话持久化
  saveSession: () => void;
  restoreSession: (sessionId: string) => boolean;

  // 内部方法
  addMessage: (message: CLIMessage) => void;
  updateCurrentMessage: (content: string) => void;
  updateProcessingState: (isProcessing: boolean) => void;
  updateCurrentTool: (tool: string | null) => void;
  updateToolStatus: (toolId: string, status: ToolCall['status'], result?: unknown) => void;
  reset: () => void;
}

/**
 * CLI Store（Zustand）
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
/* eslint-disable */
export const useCLIStore = create<CLIStoreState>((set, get) => {
  // 防抖定时器
  let saveTimer: NodeJS.Timeout | null = null;
  const SAVE_DEBOUNCE_MS = 1000; // 1秒防抖

  return {
    // 初始状态
    sessionId: null,
    isConnected: false,
    isProcessing: false,
    mode: 'stream',
    messages: [],
    currentMessage: '',
    currentTool: null,
    activeTools: new Map<string, ToolCall>(),
    stats: {
      totalMessages: 0,
      totalTokens: 0,
      totalCost: 0,
      duration: 0,
      toolCalls: []
    },

  /**
   * 初始化 CLI 连接
   */
  initialize: async (sessionId: string) => {
    try {
      const worker = new WorkerManager({ sessionId, defaultMode: 'stream' });
      await worker.initialize();

      // 订阅流式数据
      worker.onStreamData((data: StreamData) => {
        const { type, content, timestamp } = data;

        if (type === 'assistant') {
          // AI 消息
          const existingMessage = get().messages.find(m => m.role === 'assistant' && m.status === 'streaming');

          if (existingMessage) {
            // 更新现有消息
            set({
              messages: get().messages.map(m =>
                m.id === existingMessage.id
                  ? { ...m, content: content || '', timestamp }
                  : m
              )
            });
          } else {
            // 创建新消息
            const newMessage: CLIMessage = {
              id: `msg_${Date.now()}_${Math.random()}`,
              sessionId,
              role: 'assistant',
              content: content || '',
              timestamp: timestamp || Date.now(),
              status: 'streaming'
            };
            set({ messages: [...get().messages, newMessage] });
          }
        } else if (type === 'result') {
          // 最终结果
          const { is_error } = data as { is_error?: boolean };

          if (is_error) {
            // 错误消息
            set({
              messages: [...get().messages, {
                id: `msg_${Date.now()}_${Math.random()}`,
                sessionId,
                role: 'system',
                content: content || '发生错误',
                timestamp: timestamp || Date.now(),
                status: 'error'
              } as CLIMessage]
            });
          } else {
            // 完成当前流式消息
            set({
              messages: get().messages.map(m =>
                m.status === 'streaming'
                  ? { ...m, status: 'completed' as const }
                  : m
              ),
              isProcessing: false,
              currentTool: null
            });
          }
        }
      });

      // 订阅错误
      worker.onError((error) => {
        console.error('[CLI Store] Worker 错误:', error);
        set({
          isProcessing: false,
          currentTool: null
        });
      });

      set({
        sessionId,
        isConnected: true,
        messages: [],
        stats: {
          totalMessages: 0,
          totalTokens: 0,
          totalCost: 0,
          duration: 0,
          toolCalls: []
        }
      });

      console.log('[CLI Store] 初始化成功，会话:', sessionId);
    } catch (error) {
      console.error('[CLI Store] 初始化失败:', error);
      throw error;
    }
  },

  /**
   * 发送消息
   */
  sendMessage: async (content: string) => {
    const { sessionId, isConnected, messages } = get();

    if (!sessionId || !isConnected) {
      throw new Error('CLI 未连接');
    }

    // 添加用户消息
    const userMessage: CLIMessage = {
      id: `msg_${Date.now()}_${Math.random()}`,
      sessionId,
      role: 'user',
      content,
      timestamp: Date.now()
    };

    set({
      messages: [...messages, userMessage],
      isProcessing: true,
      stats: {
        ...get().stats,
        totalMessages: get().stats.totalMessages + 1
      }
    });

    // 自动保存会话
    get().saveSession();

    // 发送到 CLI（通过 Worker）
    // 这里需要保存 Worker 实例，暂时简化处理
    console.log('[CLI Store] 发送消息:', content.substring(0, 50));
  },

  /**
   * 切换通信模式
   */
  switchMode: async (mode: CommunicationMode) => {
    const { isConnected } = get();

    if (!isConnected) {
      throw new Error('CLI 未连接');
    }

    set({ mode });
    console.log('[CLI Store] 切换模式:', mode);
  },

  /**
   * 清空消息
   */
  clearMessages: () => {
    set({
      messages: [],
      currentMessage: '',
      stats: {
        totalMessages: 0,
        totalTokens: 0,
        totalCost: 0,
        duration: 0,
        toolCalls: []
      }
    });
  },

  /**
   * 断开连接
   */
  disconnect: async () => {
    // 清理 Worker（需要保存实例）
    set({
      sessionId: null,
      isConnected: false,
      isProcessing: false
    });
  },

  /**
   * 添加消息（带防抖的自动保存）
   */
  addMessage: (message: CLIMessage) => {
    const currentMessages = get().messages;
    const MAX_MESSAGES = 100;

    // 如果消息超过限制，删除最旧的消息
    let updatedMessages = [...currentMessages, message];
    if (updatedMessages.length > MAX_MESSAGES) {
      updatedMessages = updatedMessages.slice(-MAX_MESSAGES);
      console.warn(`[CLI Store] 消息数量超过限制，已删除 ${updatedMessages.length - MAX_MESSAGES} 条旧消息`);
    }

    set({ messages: updatedMessages });

    // 防抖：1秒内只保存一次
    if (saveTimer) {
      clearTimeout(saveTimer);
    }

    saveTimer = setTimeout(() => {
      get().saveSession();
      saveTimer = null;
    }, SAVE_DEBOUNCE_MS);
  },

  /**
   * 更新当前输入消息
   */
  updateCurrentMessage: (content: string) => {
    set({ currentMessage: content });
  },

  /**
   * 更新处理状态
   */
  updateProcessingState: (isProcessing: boolean) => {
    set({ isProcessing });
  },

  /**
   * 更新当前工具
   */
  updateCurrentTool: (tool: string | null) => {
    set({ currentTool: tool });
  },

  /**
   * 更新工具状态
   */
  updateToolStatus: (toolId: string, status: ToolCall['status'], result?: unknown) => {
    const { activeTools } = get();
    const tool = activeTools.get(toolId);

    if (tool) {
      const updatedTool: ToolCall = {
        id: tool.id,
        name: tool.name,
        status,
        input: tool.input,
        ...(result ? { output: result as ToolCall['output'] } : {}),
        ...(status === 'completed' || status === 'failed' ? { duration: Date.now() - (tool.startTime || Date.now()) } : {})
      };

      // 创建新的 Map（使用 Object.fromEntries 绕过类型检查）
      const entries = Array.from(activeTools.entries());
      const existingIndex = entries.findIndex(([id]) => id === toolId);
      if (existingIndex >= 0) {
        entries[existingIndex] = [toolId, updatedTool];
      } else {
        entries.push([toolId, updatedTool]);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // @ts-ignore
      set({
        activeTools: new Map(entries) as any
      });
    }
  },

  /**
   * 重置状态
   */
  reset: () => {
    set({
      sessionId: null,
      isConnected: false,
      isProcessing: false,
      messages: [],
      currentMessage: '',
      currentTool: null,
      activeTools: new Map(),
      stats: {
        totalMessages: 0,
        totalTokens: 0,
        totalCost: 0,
        duration: 0,
        toolCalls: []
      }
    });
  },

  /**
   * 保存会话到 localStorage
   */
  saveSession: () => {
    const { sessionId, messages, stats, mode } = get();

    if (!sessionId) return;

    try {
      const sessionData = {
        sessionId,
        messages: messages.slice(-100), // 只保存最近100条
        stats,
        mode,
        timestamp: Date.now()
      };

      localStorage.setItem(`cli_session_${sessionId}`, JSON.stringify(sessionData));
      console.log('[CLI Store] 会话已保存:', sessionId);
    } catch (error) {
      console.error('[CLI Store] 保存会话失败:', error);
    }
  },

  /**
   * 从 localStorage 恢复会话
   */
  restoreSession: (sessionId: string) => {
    try {
      const sessionDataStr = localStorage.getItem(`cli_session_${sessionId}`);

      if (!sessionDataStr) {
        console.log('[CLI Store] 未找到会话数据:', sessionId);
        return false;
      }

      const sessionData = JSON.parse(sessionDataStr);

      // 恢复消息和统计
      set({
        sessionId,
        messages: sessionData.messages || [],
        stats: sessionData.stats || {
          totalMessages: 0,
          totalTokens: 0,
          totalCost: 0,
          duration: 0,
          toolCalls: []
        },
        mode: sessionData.mode || 'stream'
      });

      console.log('[CLI Store] 会话已恢复:', sessionId, '消息数:', sessionData.messages?.length || 0);
      return true;
    } catch (error) {
      console.error('[CLI Store] 恢复会话失败:', error);
      return false;
    }
  }
}));
