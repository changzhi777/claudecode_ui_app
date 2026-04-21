import { useState, useEffect } from 'react';
import { useCLIStore, CLIMessage } from '../../../stores/cliStore';

interface StreamMessageProps {
  message: CLIMessage;
}

/**
 * 流式消息组件
 * 实时显示 AI 回复内容
 */
export function StreamMessage({ message }: StreamMessageProps) {
  const [displayContent, setDisplayContent] = useState(message.content);
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    if (message.status === 'streaming') {
      setIsThinking(true);

      // 监听消息更新
      const unsubscribe = useCLIStore.subscribe((state: { messages: CLIMessage[] }) => {
        const updated = state.messages.find((m: CLIMessage) => m.id === message.id);
        if (updated) {
          setDisplayContent(updated.content);
          if (updated.status !== 'streaming') {
            setIsThinking(false);
          }
        }
      });

      return unsubscribe;
    }
  }, [message.id, message.status]);

  return (
    <div className={`message message-${message.role} ${message.status || ''}`}>
      {/* 思考指示器 */}
      {isThinking && (
        <div className="thinking-indicator">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      )}

      {/* 消息内容 */}
      <div className="message-content">
        {displayContent}
      </div>

      {/* 工具调用可视化 */}
      {message.metadata?.tools && message.metadata.tools.length > 0 && (
        <div className="tool-calls">
          {message.metadata.tools.map((tool: ToolCall) => (
            <ToolCallCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * 工具调用卡片
 */
interface ToolCallCardProps {
  tool: ToolCall;
}

function ToolCallCard({ tool }: ToolCallCardProps) {
  const getStatusIcon = () => {
    switch (tool.status) {
      case 'pending':
        return '⏳';
      case 'running':
        return '🔄';
      case 'completed':
        return '✅';
      case 'failed':
        return '❌';
    }
  };

  return (
    <div className={`tool-card status-${tool.status}`}>
      <div className="tool-header">
        <span className="tool-icon">{getStatusIcon()}</span>
        <span className="tool-name">{tool.name}</span>
        {tool.duration && (
          <span className="tool-duration">{tool.duration}ms</span>
        )}
      </div>

      {tool.input && (
        <details className="tool-input">
          <summary>输入</summary>
          <pre>{JSON.stringify(tool.input, null, 2)}</pre>
        </details>
      )}

      {tool.output && (
        <details className="tool-output">
          <summary>输出</summary>
          {/* @ts-ignore */}
          <pre>{JSON.stringify(tool.output, null, 2)}</pre>
        </details>
      )}

      {tool.error && (
        <div className="tool-error">
          错误: {String(tool.error)}
        </div>
      )}
    </div>
  );
}

// 类型导入
type ToolCall = {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input?: Record<string, unknown>;
  output?: unknown;
  duration?: number;
  error?: string;
};
