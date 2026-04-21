import { useEffect } from 'react';
import { ChatMessageList } from './components/ChatMessageList';
import { ChatInput } from './components/ChatInput';
import { EmptyState } from './components/EmptyState';
import { useChatStore } from '@stores/chatStore';
import { Plus } from 'lucide-react';

export function ChatUI() {
  const { getCurrentSession, createSession, addMessage, setLoading } = useChatStore();
  const session = getCurrentSession();

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

    // TODO: 这里将来会通过 IPC 调用 ClaudeCode CLI
    // 现在先模拟 AI 响应
    setTimeout(() => {
      addMessage({
        role: 'assistant',
        content: `我收到了你的消息："${content}"\n\n这是一个模拟响应。将来这里会连接到真正的 ClaudeCode CLI，让你能够与 Claude AI 进行真实的对话。\n\n你可以切换主题来体验不同的界面风格！`,
        metadata: {
          model: 'claude-3.5-sonnet',
          tokens: 42,
          thinkingTime: 1234,
        },
      });
      setLoading(false);
    }, 1000);
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
            className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors"
            title="导出对话（即将推出）"
          >
            导出
          </button>
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
