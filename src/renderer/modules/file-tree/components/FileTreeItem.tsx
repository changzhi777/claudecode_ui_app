import { File, Folder, FolderOpen } from 'lucide-react';
import type { FileNode } from '@shared/types/files';

interface FileTreeItemProps {
  node: FileNode;
  level: number;
  isExpanded: boolean;
  isSelected: boolean;
  onToggle: (path: string) => void;
  onSelect: (path: string) => void;
}

export function FileTreeItem({
  node,
  level,
  isExpanded,
  isSelected,
  onToggle,
  onSelect,
}: FileTreeItemProps) {
  const isDirectory = node.type === 'directory';
  const paddingLeft = level * 16 + 12;

  const handleClick = () => {
    if (isDirectory) {
      onToggle(node.path);
    } else {
      onSelect(node.path);
    }
  };

  const getIcon = () => {
    if (isDirectory) {
      return isExpanded ? (
        <FolderOpen size={16} className="text-text-secondary" />
      ) : (
        <Folder size={16} className="text-text-secondary" />
      );
    }
    // TODO: 根据文件类型返回不同图标
    return <File size={16} className="text-text-tertiary" />;
  };

  return (
    <div>
      <div
        onClick={handleClick}
        className={`
          flex items-center gap-2 py-1.5 px-2 cursor-pointer
          hover:bg-bg-tertiary transition-colors
          ${isSelected ? 'bg-bg-tertiary' : ''}
        `}
        style={{ paddingLeft: `${paddingLeft}px` }}
      >
        {getIcon()}
        <span
          className={`text-sm truncate ${
            isSelected ? 'text-text-primary font-medium' : 'text-text-secondary'
          }`}
        >
          {node.name}
        </span>
        {node.metadata?.modified && (
          <span className="ml-auto w-2 h-2 rounded-full bg-color-primary" />
        )}
      </div>

      {isDirectory && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeItem
              key={child.id}
              node={child}
              level={level + 1}
              isExpanded={false}
              isSelected={false}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
