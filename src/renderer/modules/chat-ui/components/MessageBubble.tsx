import type { Message } from '@shared/types/chat';
import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  if (isSystem) {
    return (
      <div className="flex justify-center my-4 animate-fade-in">
        <div className="px-4 py-2 bg-bg-tertiary/60 backdrop-blur-sm rounded-lg text-sm text-text-tertiary border border-bg-tertiary/30">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 group animate-fade-in`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 relative backdrop-blur-sm transition-all duration-200 hover:shadow-lg ${
          isUser
            ? 'bg-chat-user-bubble text-white shadow-md'
            : 'bg-chat-ai-bubble/80 text-text-primary shadow-sm border border-white/5'
        }`}
      >
        {/* 复制按钮 */}
        {!isUser && (
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 p-1.5 rounded-lg bg-black/10 hover:bg-black/20 backdrop-blur-sm"
            title={copied ? '已复制' : '复制'}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        )}

        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words pr-8">
          {message.content}
        </div>

        {/* 元数据 */}
        {message.metadata && (
          <div className="mt-2 pt-2 border-t border-white/10 text-xs opacity-70 flex flex-wrap gap-2">
            {message.metadata.model && (
              <span className="px-2 py-0.5 bg-black/5 rounded-full font-mono">
                {message.metadata.model}
              </span>
            )}
            {message.metadata.thinkingTime && (
              <span className="px-2 py-0.5 bg-black/5 rounded-full">
                ⏱️ {parseFloat((message.metadata.thinkingTime / 1000).toFixed(1))}s
              </span>
            )}
            {message.metadata.tokens && (
              <span className="px-2 py-0.5 bg-black/5 rounded-full">
                📊 {message.metadata.tokens} tokens
              </span>
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
