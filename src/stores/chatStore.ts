import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Message, ChatSession } from '@shared/types/chat';

interface ChatState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  isLoading: boolean;
}

interface ChatActions {
  // 会话管理
  createSession: (title?: string) => string;
  deleteSession: (sessionId: string) => void;
  switchSession: (sessionId: string) => void;
  updateSessionTitle: (sessionId: string, title: string) => void;

  // 消息管理
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateMessage: (messageId: string, content: string) => void;
  deleteMessage: (messageId: string) => void;

  // 状态管理
  setLoading: (loading: boolean) => void;

  // 辅助方法
  getCurrentSession: () => ChatSession | null;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useChatStore = create<ChatState & ChatActions>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSessionId: null,
      isLoading: false,

      createSession: (title = '新对话') => {
        const newSession: ChatSession = {
          id: generateId(),
          title,
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set((state) => ({
          sessions: [newSession, ...state.sessions],
          currentSessionId: newSession.id,
        }));

        return newSession.id;
      },

      deleteSession: (sessionId: string) => {
        set((state) => {
          const sessions = state.sessions.filter((s) => s.id !== sessionId);
          const currentSessionId =
            state.currentSessionId === sessionId
              ? sessions[0]?.id || null
              : state.currentSessionId;

          return { sessions, currentSessionId };
        });
      },

      switchSession: (sessionId: string) => {
        set({ currentSessionId: sessionId });
      },

      updateSessionTitle: (sessionId: string, title: string) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId ? { ...s, title, updatedAt: Date.now() } : s
          ),
        }));
      },

      addMessage: (message) => {
        const newMessage: Message = {
          ...message,
          id: generateId(),
          timestamp: Date.now(),
        };

        set((state) => {
          const sessions = state.sessions.map((session) => {
            if (session.id === state.currentSessionId) {
              return {
                ...session,
                messages: [...session.messages, newMessage],
                updatedAt: Date.now(),
              };
            }
            return session;
          });

          // 如果是第一条用户消息，更新会话标题
          if (newMessage.role === 'user') {
            const currentSession = sessions.find((s) => s.id === state.currentSessionId);
            if (currentSession && currentSession.messages.length === 0) {
              const title = newMessage.content.slice(0, 30) + (newMessage.content.length > 30 ? '...' : '');
              return {
                sessions: sessions.map((s) =>
                  s.id === state.currentSessionId ? { ...s, title, updatedAt: Date.now() } : s
                ),
              };
            }
          }

          return { sessions };
        });
      },

      updateMessage: (messageId: string, content: string) => {
        set((state) => ({
          sessions: state.sessions.map((session) => ({
            ...session,
            messages: session.messages.map((msg) =>
              msg.id === messageId ? { ...msg, content } : msg
            ),
          })),
        }));
      },

      deleteMessage: (messageId: string) => {
        set((state) => ({
          sessions: state.sessions.map((session) => ({
            ...session,
            messages: session.messages.filter((msg) => msg.id !== messageId),
            updatedAt: Date.now(),
          })),
        }));
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      getCurrentSession: () => {
        const { sessions, currentSessionId } = get();
        return sessions.find((s) => s.id === currentSessionId) || null;
      },
    }),
    {
      name: 'claudecode-ui-chat',
      partialize: (state) => ({
        sessions: state.sessions,
        currentSessionId: state.currentSessionId,
      }),
    }
  )
);
