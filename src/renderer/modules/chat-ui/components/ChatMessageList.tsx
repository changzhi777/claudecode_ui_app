import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { useChatStore } from '@stores';
import { Loader2 } from 'lucide-react';

export function ChatMessageList() {
  const { getCurrentSession, isLoading } = useChatStore();
  const session = getCurrentSession();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session?.messages, isLoading]);

  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-display mb-2 text-text-primary">开始新对话</h2>
          <p className="text-text-secondary">点击下方输入框开始与 Claude 对话</p>
        </div>
      </div>
    );
  }

  if (session.messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-3xl font-display mb-4 text-text-primary">👋 你好！</h2>
          <p className="text-text-secondary mb-6">
            我是 Claude，Anthropic 的 AI 助手。有什么可以帮助你的吗？
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <button className="p-3 bg-bg-secondary rounded-lg hover:bg-bg-tertiary transition-colors text-left">
              <div className="font-medium text-text-primary mb-1">💡 解释概念</div>
              <div className="text-text-tertiary">帮我理解复杂的技术概念</div>
            </button>
            <button className="p-3 bg-bg-secondary rounded-lg hover:bg-bg-tertiary transition-colors text-left">
              <div className="font-medium text-text-primary mb-1">🔧 编写代码</div>
              <div className="text-text-tertiary">帮助我编写和调试代码</div>
            </button>
            <button className="p-3 bg-bg-secondary rounded-lg hover:bg-bg-tertiary transition-colors text-left">
              <div className="font-medium text-text-primary mb-1">📝 分析文本</div>
              <div className="text-text-tertiary">总结和改进我的写作</div>
            </button>
            <button className="p-3 bg-bg-secondary rounded-lg hover:bg-bg-tertiary transition-colors text-left">
              <div className="font-medium text-text-primary mb-1">🎯 回答问题</div>
              <div className="text-text-tertiary">解答我的疑问和问题</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
        {session.messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-chat-ai-bubble rounded-2xl px-4 py-3 flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm text-text-secondary">Claude 正在思考...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
