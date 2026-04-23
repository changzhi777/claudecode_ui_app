import { useState, useRef, useEffect } from 'react';
import { useThemeStore } from '@stores';
import type { ThemeID } from '@shared/types/theme';
import { themes } from '@shared/themes';
import { ChevronDown, Palette, Check } from 'lucide-react';

const themeMeta: Record<
  ThemeID,
  { name: string; description: string; icon: string; designer: string }
> = {
  claude: {
    name: 'Claude',
    description: '温暖人文，适合深度思考与阅读',
    icon: '📖',
    designer: 'Anthropic',
  },
  cursor: {
    name: 'Cursor',
    description: '精密工程，适合编码与调试',
    icon: '⚡',
    designer: 'Cursor Team',
  },
  warp: {
    name: 'Warp',
    description: '极简深色，适合夜间工作',
    icon: '🌙',
    designer: 'Warp Team',
  },
  professional: {
    name: 'Professional',
    description: '专业深色，高效开发工作流',
    icon: '🎯',
    designer: 'ClaudeCode UI',
  },
};

export function ThemeSwitcher() {
  const { currentTheme, setTheme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentMeta = themeMeta[currentTheme];

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
        className="flex items-center gap-2 px-3 py-2 bg-bg-secondary hover:bg-bg-tertiary rounded-lg transition-colors shadow-sm border border-bg-tertiary"
        title="切换主题"
      >
        <Palette size={16} className="text-text-secondary" />
        <span className="text-sm font-medium text-text-primary">{currentMeta.name}</span>
        <ChevronDown
          size={14}
          className={`text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-bg-elevated border border-bg-tertiary rounded-lg shadow-xl overflow-hidden z-50 animate-scale-in">
          {/* 菜单标题 */}
          <div className="px-4 py-3 border-b border-bg-tertiary bg-bg-secondary">
            <div className="flex items-center gap-2">
              <Palette size={16} className="text-primary" />
              <span className="text-sm font-semibold text-text-primary">选择主题</span>
            </div>
            <p className="text-xs text-text-secondary mt-1">选择最适合你的工作风格</p>
          </div>

          {/* 主题列表 */}
          <div className="max-h-[400px] overflow-y-auto py-2">
            {(Object.keys(themeMeta) as ThemeID[]).map((themeId) => {
              const meta = themeMeta[themeId];
              const theme = themes[themeId];
              const isActive = currentTheme === themeId;

              return (
                <button
                  key={themeId}
                  onClick={() => {
                    setTheme(themeId);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 flex items-start gap-3 transition-colors ${
                    isActive ? 'bg-bg-tertiary' : 'hover:bg-bg-tertiary/50'
                  }`}
                >
                  {/* 主题图标 */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                       style={{ backgroundColor: theme.colors.bg.secondary }}>
                    {meta.icon}
                  </div>

                  {/* 主题信息 */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text-primary">{meta.name}</span>
                      {isActive && (
                        <Check size={14} className="text-primary flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5">{meta.description}</p>
                    <p className="text-xs text-text-tertiary mt-0.5">设计师: {meta.designer}</p>
                  </div>

                  {/* 颜色预览 */}
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <div
                      className="w-4 h-4 rounded-full border border-bg-tertiary"
                      style={{ backgroundColor: theme.colors.primary }}
                      title="主色"
                    />
                    <div
                      className="w-4 h-4 rounded-full border border-bg-tertiary"
                      style={{ backgroundColor: theme.colors.secondary }}
                      title="次要色"
                    />
                    <div
                      className="w-4 h-4 rounded-full border border-bg-tertiary"
                      style={{ backgroundColor: theme.colors.accent }}
                      title="强调色"
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* 底部提示 */}
          <div className="px-4 py-2 bg-bg-secondary border-t border-bg-tertiary text-xs text-text-tertiary">
            <div className="flex items-center justify-between">
              <span>💡 提示：使用 ⌘T 快速切换</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
