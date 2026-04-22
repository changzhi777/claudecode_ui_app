import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send, AlertCircle, CheckCircle, Loader } from 'lucide-react';

/**
 * 连接状态
 */
type ConnectionState = 'connected' | 'connecting' | 'disconnected';

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
  connectionState?: ConnectionState; // 新增：连接状态
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = '输入消息...',
  connectionState = 'connected' // 默认已连接
}: ChatInputProps) {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 根据连接状态判断是否禁用
  const isDisabled = disabled || connectionState === 'disconnected' || connectionState === 'connecting';

  const autoResize = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  };

  useEffect(() => {
    autoResize();
  }, [content]);

  const handleSend = () => {
    const trimmed = content.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setContent('');
      // 重置高度
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 连接状态配置
  const getConnectionConfig = () => {
    switch (connectionState) {
      case 'connected':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          text: '已连接',
          color: 'text-green-500',
          bgColor: 'bg-green-50'
        };
      case 'connecting':
        return {
          icon: <Loader className="w-4 h-4 animate-spin" />,
          text: '连接中...',
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-50'
        };
      case 'disconnected':
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          text: '连接断开',
          color: 'text-red-500',
          bgColor: 'bg-red-50'
        };
    }
  };

  const connectionConfig = getConnectionConfig();

  return (
    <div className="border-t border-bg-tertiary p-4 bg-chat-input-bg">
      {/* 连接状态指示 */}
      <div className="max-w-4xl mx-auto mb-2">
        <div className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg ${connectionConfig.bgColor} ${connectionConfig.color}`}>
          {connectionConfig.icon}
          <span>{connectionConfig.text}</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full px-4 py-3 bg-bg-elevated border border-bg-tertiary rounded-xl resize-none focus:outline-none focus:border-color-accent transition-colors"
            style={{ minHeight: '48px', maxHeight: '200px' }}
            rows={1}
          />
          <div className="absolute bottom-3 right-3 text-xs text-text-tertiary">
            {disabled ? '发送中...' : 'Enter 发送，Shift+Enter 换行'}
          </div>
        </div>

        <button
          onClick={handleSend}
          disabled={disabled || !content.trim()}
          className="px-4 py-3 bg-color-primary text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center"
          style={{ minHeight: '48px' }}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
