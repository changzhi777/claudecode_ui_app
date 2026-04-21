import { X } from 'lucide-react';
import type { EditorTab as EditorTabType } from '@shared/types/files';

interface EditorTabProps {
  tab: EditorTabType;
  isActive: boolean;
  onClose: (tabId: string) => void;
  onSwitch: (tabId: string) => void;
}

export function EditorTab({ tab, isActive, onClose, onSwitch }: EditorTabProps) {
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose(tab.id);
  };

  return (
    <div
      onClick={() => onSwitch(tab.id)}
      className={`
        flex items-center gap-2 px-4 py-2 border-r border-bg-tertiary cursor-pointer
        transition-colors min-w-[120px] max-w-[200px]
        ${isActive ? 'bg-bg-primary' : 'bg-bg-secondary hover:bg-bg-tertiary'}
      `}
    >
      <span className="text-sm truncate flex-1">{tab.fileName}</span>
      {tab.isModified && (
        <span className="w-2 h-2 rounded-full bg-color-primary flex-shrink-0" />
      )}
      <button
        onClick={handleClose}
        className="p-0.5 hover:bg-bg-tertiary rounded transition-colors flex-shrink-0"
        title="关闭标签页"
      >
        <X size={14} className="text-text-tertiary hover:text-text-primary" />
      </button>
    </div>
  );
}
