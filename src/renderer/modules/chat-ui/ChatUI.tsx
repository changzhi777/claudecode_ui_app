import { useEffect, useState } from 'react';
import { ChatMessageList } from './components/ChatMessageList';
import { ChatInput } from './components/ChatInput';
import { EmptyState } from './components/EmptyState';
import { useChatStore } from '@stores';
import { Plus, Trash2, Download, History } from 'lucide-react';
import { toast } from '@components/Toast';

export function ChatUI() {
  const { getCurrentSession, createSession, addMessage, setLoading, clearMessages } = useChatStore();
  const session = getCurrentSession();
  const [showHistory, setShowHistory] = useState(false);
  const [exporting, setExporting] = useState(false);

  // 初始化：如果没有会话，创建一个
  useEffect(() => {
    if (!session) {
      createSession();
    }
  }, [session, createSession]);

  const handleSendMessage = async (content: string) => {
    // 添加用户消息
    addMessage({
      role: 'user',
      content,
    });

    // 设置加载状态
    setLoading(true);

    try {
      // 通过 IPC 调用真实的 ClaudeCode CLI
      if (window.electronAPI) {
        const response = await window.electronAPI.invoke('cli:sendMessageReal', content);

        if (response.success) {
          // 添加 AI 响应
          addMessage({
            role: 'assistant',
            content: response.data.response,
            metadata: {
              model: response.data.model,
              tokens: response.data.tokens,
              thinkingTime: response.data.duration,
            },
          });
        } else {
          // 处理错误
          addMessage({
            role: 'assistant',
            content: `抱歉，遇到了一些问题：${response.error}`,
            metadata: {
              model: response.data?.model || 'unknown',
              tokens: 0,
              thinkingTime: 0,
            },
          });
        }
      } else {
        throw new Error('electronAPI 不可用');
      }
    } catch (error) {
      // 降级到模拟响应
      console.error('CLI 调用失败，使用模拟响应:', error);

      setTimeout(() => {
        addMessage({
          role: 'assistant',
          content: `我收到了你的消息："${content}"\n\n[模拟响应 - CLI 集成中]\n\n错误信息: ${(error as Error).message}`,
          metadata: {
            model: 'unknown',
            tokens: 42,
            thinkingTime: 1000,
          },
        });
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!session || session.messages.length === 0) return;

    setExporting(true);
    try {
      const response = await window.electronAPI.invoke('chat:saveAsMarkdown', {
        sessionId: session.id,
        title: session.title,
        messages: session.messages,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      });

      if (response.success) {
        toast.success('导出成功', `对话已保存到 ${response.filename}`);
      } else {
        toast.error('导出失败', response.error);
      }
    } catch (error) {
      toast.error('导出异常', (error as Error).message);
    } finally {
      setExporting(false);
    }
  };

  const handleShowHistory = async () => {
    setShowHistory(!showHistory);
    if (!showHistory) {
      try {
        const response = await window.electronAPI.invoke('chat:getHistory');
        if (response.success) {
          console.log('历史记录:', response.chats);
        }
      } catch (error) {
        console.error('获取历史失败:', error);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg-primary">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-bg-tertiary bg-bg-secondary">
        <div className="flex items-center gap-2">
          <button
            onClick={() => createSession()}
            className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors"
            title="新建对话"
          >
            <Plus size={20} className="text-text-primary" />
          </button>
          {session && (
            <div className="px-3 py-1 bg-bg-tertiary rounded-lg">
              <span className="text-sm font-medium text-text-primary">{session.title}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShowHistory}
            className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors flex items-center gap-1"
            title="历史记录"
          >
            <History size={14} />
            历史
          </button>

          {session && session.messages.length > 0 && (
            <>
              <button
                onClick={() => clearMessages()}
                className="px-3 py-1.5 text-sm text-text-secondary hover:text-red-500 hover:bg-bg-tertiary rounded-lg transition-colors flex items-center gap-1"
                title="清空对话"
              >
                <Trash2 size={14} />
                清空
              </button>

              <button
                onClick={handleExport}
                disabled={exporting}
                className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                title="导出对话为 Markdown"
              >
                <Download size={14} />
                {exporting ? '导出中...' : '导出'}
              </button>
            </>
          )}

          <button
            className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors"
            title="设置（即将推出）"
          >
            设置
          </button>
        </div>
      </div>

      {/* 消息列表 */}
      {session && session.messages.length > 0 ? (
        <ChatMessageList />
      ) : (
        <EmptyState onCreateNew={() => createSession()} />
      )}

      {/* 输入框 */}
      <ChatInput
        onSend={handleSendMessage}
        disabled={useChatStore((state) => state.isLoading)}
        placeholder="发送消息给 Claude..."
      />
    </div>
  );
}
