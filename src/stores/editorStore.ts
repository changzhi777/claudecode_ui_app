import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FileNode, EditorTab, EditorState, EditorActions } from '@shared/types/files';

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
