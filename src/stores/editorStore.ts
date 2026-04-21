import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FileNode, EditorTab, EditorState, EditorActions } from '@shared/types/files';
import type { ElectronAPI } from '../renderer/global.d.ts';

const generateId = () => Math.random().toString(36).substring(2, 9);

const getLanguageFromFileName = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    py: 'python',
    rs: 'rust',
    go: 'go',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    cs: 'csharp',
    php: 'php',
    rb: 'ruby',
    vue: 'vue',
    svelte: 'svelte',
    json: 'json',
    xml: 'xml',
    html: 'html',
    css: 'css',
    scss: 'scss',
    md: 'markdown',
    txt: 'plaintext',
    sh: 'shell',
    yaml: 'yaml',
    yml: 'yaml',
    toml: 'toml',
  };
  return languageMap[ext || ''] || 'plaintext';
};

/**
 * 递归构建文件树节点
 */
async function buildFileTree(
  dirPath: string,
  maxDepth = 3,
  currentDepth = 0
): Promise<FileNode[]> {
  try {
    if (currentDepth >= maxDepth) {
      return [];
    }

    const result = await (window.electronAPI as unknown as ElectronAPI).invoke('file:list', {
      path: dirPath,
      recursive: false,
    }) as { success: boolean; data?: { files: Array<{ name: string; path: string; type: 'file' | 'directory'; size?: number; modified?: number }> } };

    if (!result?.success || !result?.data) {
      return [];
    }

    const nodes: FileNode[] = [];

    for (const item of result.data.files) {
      const node: FileNode = {
        id: item.path,
        name: item.name,
        path: item.path,
        type: item.type,
        metadata: {
          size: item.size,
          modified: item.modified,
        },
      };

      // 如果是目录，递归加载子节点（有限深度）
      if (item.type === 'directory' && currentDepth < maxDepth - 1) {
        try {
          node.children = await buildFileTree(item.path, maxDepth, currentDepth + 1);
        } catch (error) {
          console.error(`[buildFileTree] 加载子目录失败: ${item.path}`, error);
          node.children = [];
        }
      }

      nodes.push(node);
    }

    return nodes;
  } catch (error) {
    console.error('[buildFileTree] 构建文件树失败:', error);
    return [];
  }
}

export const useEditorStore = create<EditorState & EditorActions>()(
  persist(
    (set, get) => ({
      // 初始状态
      fileTree: [],
      expandedPaths: new Set<string>(),
      selectedPath: null,
      tabs: [],
      activeTabId: null,
      isDirty: false,

      // 文件树操作
      setFileTree: (tree: FileNode[]) => {
        set({ fileTree: tree });
      },

      toggleExpand: (path: string) => {
        set((state) => {
          const expandedPaths = new Set(state.expandedPaths);
          if (expandedPaths.has(path)) {
            expandedPaths.delete(path);
          } else {
            expandedPaths.add(path);
          }
          return { expandedPaths };
        });
      },

      selectFile: (path: string) => {
        set({ selectedPath: path });
      },

      // 标签页操作
      openTab: (file: FileNode) => {
        const existingTab = get().tabs.find((t) => t.filePath === file.path);

        if (existingTab) {
          // 切换到已存在的标签页
          set({ activeTabId: existingTab.id });
        } else {
          // 创建新标签页
          const newTab: EditorTab = {
            id: generateId(),
            filePath: file.path,
            fileName: file.name,
            language: getLanguageFromFileName(file.name),
            content: '', // TODO: 从文件系统加载
            isModified: false,
            isActive: true,
          };

          set((state) => ({
            tabs: [...state.tabs.map((t) => ({ ...t, isActive: false })), newTab],
            activeTabId: newTab.id,
          }));
        }
      },

      closeTab: (tabId: string) => {
        set((state) => {
          const tabs = state.tabs.filter((t) => t.id !== tabId);
          let activeTabId = state.activeTabId;

          // 如果关闭的是当前激活的标签页，切换到相邻的标签页
          if (state.activeTabId === tabId) {
            const closedIndex = state.tabs.findIndex((t) => t.id === tabId);
            const newActiveIndex = Math.max(0, closedIndex - 1);
            activeTabId = tabs[newActiveIndex]?.id || null;
          }

          return { tabs, activeTabId };
        });
      },

      switchTab: (tabId: string) => {
        set((state) => ({
          tabs: state.tabs.map((t) => ({
            ...t,
            isActive: t.id === tabId,
          })),
          activeTabId: tabId,
        }));
      },

      // 编辑器操作
      updateContent: (content: string) => {
        set((state) => ({
          tabs: state.tabs.map((t) =>
            t.id === state.activeTabId ? { ...t, content, isModified: true } : t
          ),
          isDirty: true,
        }));
      },

      saveFile: () => {
        set((state) => ({
          tabs: state.tabs.map((t) =>
            t.id === state.activeTabId ? { ...t, isModified: false } : t
          ),
          isDirty: false,
        }));
        // TODO: 实际保存到文件系统
      },

      // 刷新文件树
      refreshFileTree: async () => {
        try {
          // 获取项目根路径（从第一个标签页推断，或使用默认值）
          const { tabs } = get();
          let rootPath = '/Users/mac/cz_code/claudecode_ui_app'; // 默认项目路径

          if (tabs.length > 0 && tabs[0].filePath) {
            // 从文件路径推断项目根
            const pathParts = tabs[0].filePath.split('/');
            const srcIndex = pathParts.indexOf('src');
            if (srcIndex > 0) {
              rootPath = pathParts.slice(0, srcIndex).join('/');
            }
          }

          // 构建文件树
          const tree = await buildFileTree(rootPath, 3, 0);

          // 更新文件树
          set({ fileTree: tree });
        } catch (error) {
          console.error('[refreshFileTree] 刷新文件树失败:', error);
        }
      },
    }),
    {
      name: 'claudecode-ui-editor',
      partialize: (state) => ({
        tabs: state.tabs,
        activeTabId: state.activeTabId,
      }),
    }
  )
);
