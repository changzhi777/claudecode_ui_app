import { useEffect } from 'react';
import { useEditorStore } from '@stores/editorStore';
import { FileTreeItem } from './components/FileTreeItem';
import { Files } from 'lucide-react';
import { getFileOperationHandler } from '../../services/FileOperationHandler';
import type { ElectronAPI } from '../../global.d.ts';

export function FileTree() {
  const { fileTree, expandedPaths, selectedPath, toggleExpand, selectFile, setFileTree, refreshFileTree } =
    useEditorStore();

  // 初始化文件树和 CLI 事件监听
  useEffect(() => {
    // 初始化文件树
    const initializeFileTree = async () => {
      await refreshFileTree();
    };

    initializeFileTree();

    // 监听 CLI 流式数据事件
    const handleStreamData = (_event: unknown, data: any) => {
      const handler = getFileOperationHandler();
      const events = handler.handleStreamData(data);

      // 处理文件操作事件
      for (const event of events) {
        handler.handleFileOperation(event);
      }
    };

    // 订阅 CLI 流式数据
    (window.electronAPI as ElectronAPI).on('cli:streamData', handleStreamData);

    // 清理
    return () => {
      (window.electronAPI as ElectronAPI).removeChannelListener('cli:streamData');
    };
  }, [refreshFileTree]);

  if (fileTree.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-text-tertiary p-6">
        <Files size={32} className="mb-2 opacity-50" />
        <p className="text-sm text-center">暂无文件</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-bg-secondary border-r border-bg-tertiary">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-bg-tertiary">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text-primary">📁 文件</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="p-1.5 hover:bg-bg-tertiary rounded transition-colors"
            title="新建文件"
          >
            <span className="text-xs text-text-secondary">+</span>
          </button>
          <button
            className="p-1.5 hover:bg-bg-tertiary rounded transition-colors"
            title="刷新"
          >
            <span className="text-xs text-text-secondary">↻</span>
          </button>
        </div>
      </div>

      {/* 文件树 */}
      <div className="flex-1 overflow-y-auto py-2">
        {fileTree.map((node) => (
          <FileTreeItem
            key={node.id}
            node={node}
            level={0}
            isExpanded={expandedPaths.has(node.path)}
            isSelected={selectedPath === node.path}
            onToggle={toggleExpand}
            onSelect={(path) => {
              selectFile(path);
              // 如果是文件，打开标签页
              if (node.type === 'file') {
                useEditorStore.getState().openTab(node);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}
