import type { Message } from '@shared/types/chat';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="px-4 py-2 bg-bg-tertiary rounded-lg text-sm text-text-tertiary">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-chat-user-bubble text-white'
            : 'bg-chat-ai-bubble text-text-primary'
        }`}
      >
        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </div>

        {/* 元数据 */}
        {message.metadata && (
          <div className="mt-2 pt-2 border-t border-white/10 text-xs opacity-70">
            {message.metadata.model && (
              <span className="mr-3">{message.metadata.model}</span>
            )}
            {message.metadata.tokens && (
              <span className="mr-3">{message.metadata.tokens} tokens</span>
            )}
            {message.metadata.thinkingTime && (
              <span>{(message.metadata.thinkingTime / 1000).toFixed(1)}s</span>
            )}
          </div>
        )}

        {/* 时间戳 */}
        <div className="mt-1 text-xs opacity-50">
          {new Date(message.timestamp).toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
}
