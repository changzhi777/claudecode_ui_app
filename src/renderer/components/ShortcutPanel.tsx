/**
 * 快捷键面板组件
 */

import { useState, useEffect } from 'react';
import { Command } from 'lucide-react';

interface Shortcut {
  key: string;
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  { key: '⌘T / Ctrl+T', description: '切换主题', category: '主题' },
  { key: '⌘K / Ctrl+K', description: '切换视图', category: '视图' },
  { key: '⌘N / Ctrl+N', description: '新建对话', category: '对话' },
  { key: 'Enter', description: '发送消息', category: '对话' },
  { key: 'Shift+Enter', description: '换行', category: '对话' },
  { key: '⌘S / Ctrl+S', description: '保存文件', category: '编辑器' },
  { key: '⌘W / Ctrl+W', description: '关闭标签', category: '编辑器' },
  { key: '⌘1 / Ctrl+1', description: '切换到第1个标签', category: '编辑器' },
  { key: '⌘2 / Ctrl+2', description: '切换到第2个标签', category: '编辑器' },
  { key: '⌘3 / Ctrl+3', description: '切换到第3个标签', category: '编辑器' },
  { key: '⌘F / Ctrl+F', description: '搜索', category: '通用' },
  { key: 'Escape', description: '关闭面板', category: '通用' },
];

export function ShortcutPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K / Ctrl+K 打开快捷键面板
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
      // Escape 关闭面板
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors"
        title="快捷键 (⌘K)"
      >
        <Command size={16} className="text-text-tertiary" />
      </button>
    );
  }

  const categories = Array.from(new Set(shortcuts.map((s) => s.category)));
  const filteredShortcuts = shortcuts.filter(
    (s) =>
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsOpen(false)}>
      <div
        className="w-full max-w-2xl bg-bg-secondary rounded-2xl shadow-2xl border border-bg-tertiary overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="p-4 border-b border-bg-tertiary">
          <div className="relative">
            <Command size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索快捷键..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-bg-tertiary border border-transparent rounded-lg focus:border-color-accent focus:outline-none"
              autoFocus
            />
          </div>
        </div>

        {/* 快捷键列表 */}
        <div className="max-h-96 overflow-y-auto p-4">
          {filteredShortcuts.length === 0 ? (
            <div className="text-center py-8 text-text-tertiary">
              未找到匹配的快捷键
            </div>
          ) : (
            <div className="space-y-6">
              {categories.map((category) => {
                const categoryShortcuts = filteredShortcuts.filter((s) => s.category === category);
                if (categoryShortcuts.length === 0) return null;

                return (
                  <div key={category}>
                    <h3 className="text-xs font-medium text-text-tertiary uppercase tracking-wide mb-2">
                      {category}
                    </h3>
                    <div className="space-y-1">
                      {categoryShortcuts.map((shortcut) => (
                        <div
                          key={shortcut.key}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-bg-tertiary transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <kbd className="px-2 py-1 text-xs bg-bg-tertiary border border-bg-primary rounded font-mono">
                              {shortcut.key}
                            </kbd>
                            <span className="text-sm text-text-primary">{shortcut.description}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 底部 */}
        <div className="p-4 border-t border-bg-tertiary text-center text-xs text-text-tertiary">
          按 Escape 关闭
        </div>
      </div>
    </div>
  );
}
