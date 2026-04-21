import { useEditorStore } from '@stores/editorStore';
import { FileTreeItem } from './components/FileTreeItem';
import { Files } from 'lucide-react';

export function FileTree() {
  const { fileTree, expandedPaths, selectedPath, toggleExpand, selectFile, setFileTree } =
    useEditorStore();

  // 初始化示例文件树
  // TODO: 从实际文件系统加载
  if (fileTree.length === 0) {
    const demoTree = [
      {
        id: 'root',
        name: 'claudecode-ui-app',
        path: '/claudecode-ui-app',
        type: 'directory' as const,
        isExpanded: true,
        children: [
          {
            id: 'src',
            name: 'src',
            path: '/claudecode-ui-app/src',
            type: 'directory' as const,
            children: [
              {
                id: 'renderer',
                name: 'renderer',
                path: '/claudecode-ui-app/src/renderer',
                type: 'directory' as const,
                children: [
                  {
                    id: 'App.tsx',
                    name: 'App.tsx',
                    path: '/claudecode-ui-app/src/renderer/App.tsx',
                    type: 'file' as const,
                  },
                  {
                    id: 'main.tsx',
                    name: 'main.tsx',
                    path: '/claudecode-ui-app/src/renderer/main.tsx',
                    type: 'file' as const,
                  },
                ],
              },
              {
                id: 'stores',
                name: 'stores',
                path: '/claudecode-ui-app/src/stores',
                type: 'directory' as const,
                children: [
                  {
                    id: 'chatStore.ts',
                    name: 'chatStore.ts',
                    path: '/claudecode-ui-app/src/stores/chatStore.ts',
                    type: 'file' as const,
                  },
                  {
                    id: 'themeStore.ts',
                    name: 'themeStore.ts',
                    path: '/claudecode-ui-app/src/stores/themeStore.ts',
                    type: 'file' as const,
                  },
                ],
              },
            ],
          },
          {
            id: 'package.json',
            name: 'package.json',
            path: '/claudecode-ui-app/package.json',
            type: 'file' as const,
          },
          {
            id: 'README.md',
            name: 'README.md',
            path: '/claudecode-ui-app/README.md',
            type: 'file' as const,
          },
        ],
      },
    ];
    setFileTree(demoTree);
  }

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
