import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { CommandAutocomplete } from './CommandAutocomplete';
import { useCommandsCache } from '../../../hooks/useCommandsCache';

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
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteQuery, setAutocompleteQuery] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 预加载命令列表（使用缓存）
  const { commands: cachedCommands } = useCommandsCache();

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

  // 检测斜杠命令并自动显示补全
  useEffect(() => {
    const cursorPosition = textareaRef.current?.selectionStart || content.length;
    const textBeforeCursor = content.substring(0, cursorPosition);
    const lastWord = textBeforeCursor.split(/\s+/).pop() || '';

    if (lastWord.startsWith('/')) {
      setAutocompleteQuery(lastWord);
      setShowAutocomplete(true);
    } else {
      setShowAutocomplete(false);
      setAutocompleteQuery('');
    }
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

  const handleSelectCommand = (command: string) => {
    const cursorPosition = textareaRef.current?.selectionStart || content.length;
    const textBeforeCursor = content.substring(0, cursorPosition);
    const textAfterCursor = content.substring(cursorPosition);

    // 找到最后一个空格的位置
    const lastSpaceIndex = textBeforeCursor.lastIndexOf(' ');
    const newText = textBeforeCursor.substring(0, lastSpaceIndex + 1) + command + ' ' + textAfterCursor;

    setContent(newText);
    setShowAutocomplete(false);
    setAutocompleteQuery('');

    // 聚焦回输入框并设置光标位置
    setTimeout(() => {
      const newCursorPosition = lastSpaceIndex + command.length + 2;
      textareaRef.current?.setSelectionRange(newCursorPosition, newCursorPosition);
      textareaRef.current?.focus();
    }, 0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // 触发自动补全
      const cursorPosition = textareaRef.current?.selectionStart || 0;
      const textBeforeCursor = content.substring(0, cursorPosition);
      const lastWord = textBeforeCursor.split(/\s+/).pop() || '';

      if (lastWord.startsWith('/')) {
        setAutocompleteQuery(lastWord);
        setShowAutocomplete(true);
      }
    } else if (e.key === 'Escape') {
      setShowAutocomplete(false);
      setAutocompleteQuery('');
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
          {/* 命令自动补全 */}
          {showAutocomplete && (
            <CommandAutocomplete
              query={autocompleteQuery}
              commands={cachedCommands}
              onSelect={handleSelectCommand}
              onClose={() => {
                setShowAutocomplete(false);
                setAutocompleteQuery('');
              }}
            />
          )}

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
