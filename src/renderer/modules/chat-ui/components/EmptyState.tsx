import { MessageSquare, Sparkles, Keyboard, ArrowRight } from 'lucide-react';

interface EmptyStateProps {
  onCreateNew?: () => void;
}

export function EmptyState({ onCreateNew }: EmptyStateProps) {
  const examplePrompts = [
    { icon: '🔍', title: '解释代码', prompt: '解释这个 React 组件是如何工作的' },
    { icon: '✨', title: '生成代码', prompt: '创建一个 TypeScript 接口定义用户信息' },
    { icon: '🐛', title: '调试问题', prompt: '帮我找出这个函数的 bug' },
  ];

  const shortcuts = [
    { key: '⌘ + N', desc: '新建对话' },
    { key: '⌘ + S', desc: '保存对话' },
    { key: '⌘ + T', desc: '切换主题' },
  ];

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-color-primary opacity-20 blur-2xl rounded-full"></div>
            <MessageSquare size={64} className="relative text-color-primary" />
          </div>
        </div>

        <h2 className="text-3xl font-display font-medium text-text-primary mb-3">
          开始新对话
        </h2>

        <p className="text-text-secondary mb-8 text-lg">
          使用 Claude Sonnet 4.6 模型 · 智能代码助手
        </p>

        {/* 示例提示 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
          {examplePrompts.map((example, index) => (
            <button
              key={index}
              onClick={() => onCreateNew?.()}
              className="flex items-start gap-3 p-4 bg-bg-tertiary/50 rounded-lg hover:bg-bg-tertiary transition-all cursor-pointer group text-left"
            >
              <span className="text-2xl">{example.icon}</span>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-text-primary mb-1 group-hover:text-color-accent transition-colors">
                  {example.title}
                </h3>
                <p className="text-xs text-text-secondary truncate">
                  {example.prompt}
                </p>
              </div>
              <ArrowRight size={14} className="text-text-tertiary group-hover:text-color-accent transition-colors flex-shrink-0 mt-1" />
            </button>
          ))}
        </div>

        {/* 快捷键提示 */}
        <div className="flex justify-center gap-6 mb-8 text-sm text-text-secondary">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center gap-2">
              <Keyboard size={14} />
              <span className="font-mono text-xs bg-bg-tertiary px-2 py-1 rounded">{shortcut.key}</span>
              <span>{shortcut.desc}</span>
            </div>
          ))}
        </div>

        {onCreateNew && (
          <button
            onClick={onCreateNew}
            className="px-8 py-3 bg-color-primary text-white rounded-lg hover:opacity-90 transition-opacity font-medium flex items-center gap-2 mx-auto"
          >
            <Sparkles size={18} />
            开始对话
          </button>
        )}
      </div>
    </div>
  );
}
