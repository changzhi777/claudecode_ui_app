import { useEffect, useRef, useState } from 'react';
import { Command, GitBranch, Code, Shield, Cpu, Activity, Zap } from 'lucide-react';

interface CommandItem {
  command: string;
  description: string;
  category: string;
  label: string;
  hint: string;
}

// 类别配置
const CATEGORY_CONFIG: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
  '核心': {
    icon: <Zap size={14} />,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20'
  },
  'Git': {
    icon: <GitBranch size={14} />,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20'
  },
  '开发': {
    icon: <Code size={14} />,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20'
  },
  '审查': {
    icon: <Shield size={14} />,
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-900/20'
  },
  'AI': {
    icon: <Cpu size={14} />,
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-900/20'
  },
  'GLM': {
    icon: <Activity size={14} />,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-50 dark:bg-cyan-900/20'
  },
};

interface CommandAutocompleteProps {
  query: string;
  commands: CommandItem[];
  onSelect: (command: string) => void;
  onClose: () => void;
}

export function CommandAutocomplete({ query, commands, onSelect, onClose }: CommandAutocompleteProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 过滤匹配的命令
  const filteredCommands = commands.filter(cmd =>
    cmd.command.toLowerCase().includes(query.toLowerCase()) ||
    cmd.label.toLowerCase().includes(query.toLowerCase()) ||
    cmd.description.toLowerCase().includes(query.toLowerCase())
  );

  // 按类别分组
  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) {
      acc[cmd.category] = [];
    }
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  // 处理键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter' && filteredCommands.length > 0) {
        e.preventDefault();
        onSelect(filteredCommands[selectedIndex].command);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredCommands.length, selectedIndex, onSelect, onClose]);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (filteredCommands.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="absolute bottom-full left-0 right-0 mb-2 glass-dropdown rounded-lg overflow-hidden z-50 max-h-80 backdrop-blur-xl"
    >
      {Object.entries(groupedCommands).map(([category, commands]) => {
        const config = CATEGORY_CONFIG[category];
        return (
          <div key={category}>
            <div className={`px-3 py-1.5 text-xs font-medium flex items-center gap-2 ${
              config ? config.color + ' ' + config.bgColor : 'text-text-tertiary bg-bg-secondary'
            }`}>
              {config?.icon}
              <span>{category}</span>
              <span className="text-xs opacity-70">({commands.length})</span>
            </div>
            {commands.map((cmd) => {
              const globalIndex = filteredCommands.indexOf(cmd);
              const isSelected = globalIndex === selectedIndex;

              return (
                <button
                  key={cmd.command}
                  onClick={() => onSelect(cmd.command)}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-left transition-colors ${
                    isSelected ? 'bg-color-primary text-white' : 'hover:bg-bg-tertiary text-text-primary'
                  }`}
                >
                  <span className={`${isSelected ? 'text-white' : CATEGORY_CONFIG[cmd.category]?.color || 'text-text-secondary'} flex-shrink-0`}>
                    {CATEGORY_CONFIG[cmd.category]?.icon || <Command size={14} />}
                  </span>
                  <span className={`text-sm font-medium flex-shrink-0 ${isSelected ? 'text-white' : 'text-text-primary'}`}>
                    {cmd.command}
                  </span>
                  <span className={`px-1.5 py-0.5 text-xs rounded-full font-medium flex-shrink-0 ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : CATEGORY_CONFIG[cmd.category]?.bgColor + ' ' + CATEGORY_CONFIG[cmd.category]?.color
                  }`}>
                    {cmd.label}
                  </span>
                  <span className={`text-xs truncate ${isSelected ? 'text-white/80' : 'text-text-secondary'}`}>
                    {cmd.description} · {cmd.hint}
                  </span>
                </button>
              );
            })}
          </div>
        );
      })}

      {/* 底部帮助提示 */}
      <div className="px-3 py-1 bg-bg-secondary/60 backdrop-blur-md border-t border-bg-tertiary/30 text-xs text-text-secondary sticky bottom-0">
        <div className="flex items-center justify-between">
          <span>💡 使用 ↑↓ 选择 · Enter 确认 · Tab 补全</span>
          <span className="text-text-tertiary">Esc 关闭</span>
        </div>
      </div>
    </div>
  );
}
