import { MessageSquare, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  onCreateNew?: () => void;
}

export function EmptyState({ onCreateNew }: EmptyStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-color-primary opacity-20 blur-2xl rounded-full"></div>
            <MessageSquare size={64} className="relative text-color-primary" />
          </div>
        </div>

        <h2 className="text-2xl font-display font-medium text-text-primary mb-3">
          开始新对话
        </h2>

        <p className="text-text-secondary mb-8">
          向 AI 助手提问，开始你的编程之旅
        </p>

        <div className="space-y-3 text-left mb-8">
          <div className="flex items-start gap-3 p-4 bg-bg-tertiary/50 rounded-lg hover:bg-bg-tertiary transition-colors cursor-pointer group">
            <Sparkles size={20} className="text-color-accent mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-text-primary mb-1 group-hover:text-color-accent transition-colors">
                解释代码
              </h3>
              <p className="text-xs text-text-secondary">
                &ldquo;解释这个 React 组件是如何工作的&rdquo;
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-bg-tertiary/50 rounded-lg hover:bg-bg-tertiary transition-colors cursor-pointer group">
            <Sparkles size={20} className="text-color-accent mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-text-primary mb-1 group-hover:text-color-accent transition-colors">
                生成代码
              </h3>
              <p className="text-xs text-text-secondary">
                &ldquo;创建一个 TypeScript 接口定义用户信息&rdquo;
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-bg-tertiary/50 rounded-lg hover:bg-bg-tertiary transition-colors cursor-pointer group">
            <Sparkles size={20} className="text-color-accent mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-text-primary mb-1 group-hover:text-color-accent transition-colors">
                调试问题
              </h3>
              <p className="text-xs text-text-secondary">
                &ldquo;帮我找出这个函数的 bug&rdquo;
              </p>
            </div>
          </div>
        </div>

        {onCreateNew && (
          <button
            onClick={onCreateNew}
            className="px-6 py-3 bg-color-primary text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
          >
            开始对话
          </button>
        )}
      </div>
    </div>
  );
}
