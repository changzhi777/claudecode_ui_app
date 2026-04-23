import { useState, useRef, useEffect } from 'react';
import { useViewStore } from '@stores';
import { MessageSquare, Code2, ChevronDown, Layout } from 'lucide-react';
import type { ViewID } from '@stores';

const viewMeta: Record<
  ViewID,
  { name: string; icon: React.ReactNode; description: string; detail: string }
> = {
  chat: {
    name: '对话',
    icon: <MessageSquare size={18} />,
    description: 'AI 对话界面',
    detail: '与 Claude 对话，获取帮助',
  },
  workspace: {
    name: '工作区',
    icon: <Code2 size={18} />,
    description: '代码编辑器',
    detail: '编辑代码，管理文件',
  },
};

export function ViewSwitcher() {
  const { currentView, setView } = useViewStore();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentMeta = viewMeta[currentView];

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {/* 触发按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-bg-secondary/80 hover:bg-bg-tertiary/80 rounded-lg transition-all duration-300 shadow-sm border border-bg-tertiary/50 backdrop-blur-md glass-hover glass-active"
        title="切换视图"
      >
        <Layout size={16} className="text-text-secondary" />
        <span className="text-sm font-medium text-text-primary">{currentMeta.name}</span>
        <ChevronDown
          size={14}
          className={`text-text-secondary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 glass-dropdown rounded-lg overflow-hidden z-50 animate-scale-in">
          {/* 菜单标题 */}
          <div className="px-4 py-3 border-b border-bg-tertiary/30 bg-bg-secondary/40 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Layout size={16} className="text-primary" />
              <span className="text-sm font-semibold text-text-primary">切换视图</span>
            </div>
            <p className="text-xs text-text-secondary mt-1">选择你想要的工作界面</p>
          </div>

          {/* 视图列表 */}
          <div className="py-2">
            {(Object.keys(viewMeta) as ViewID[]).map((viewId) => {
              const meta = viewMeta[viewId];
              const isActive = currentView === viewId;

              return (
                <button
                  key={viewId}
                  onClick={() => {
                    setView(viewId);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 flex items-center gap-3 transition-all duration-200 ${
                    isActive
                      ? 'bg-bg-tertiary/60 backdrop-blur-sm'
                      : 'hover:bg-bg-tertiary/30 hover:backdrop-blur-xs'
                  } glass-active`}
                >
                  {/* 图标 */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-bg-secondary/60 backdrop-blur-sm border border-white/10 shadow-sm">
                    <span className="text-primary">{meta.icon}</span>
                  </div>

                  {/* 视图信息 */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text-primary">{meta.name}</span>
                      {isActive && (
                        <svg
                          className="w-4 h-4 text-primary flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5">{meta.description}</p>
                    <p className="text-xs text-text-tertiary">{meta.detail}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* 底部提示 */}
          <div className="px-4 py-2 bg-bg-secondary/40 backdrop-blur-sm border-t border-bg-tertiary/30 text-xs text-text-tertiary">
            <div className="flex items-center justify-between">
              <span>💡 提示：使用 ⌘K 快速切换</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
