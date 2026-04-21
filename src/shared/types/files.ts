export type FileType = 'file' | 'directory' | 'symlink';

export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: FileType;
  children?: FileNode[];
  isExpanded?: boolean;
  // 可选的元数据
  metadata?: {
    size?: number;
    modified?: number;
    language?: string;
    isIgnored?: boolean;
  };
}

export interface EditorTab {
  id: string;
  filePath: string;
  fileName: string;
  language: string;
  content: string;
  isModified: boolean;
  isActive: boolean;
}

export interface EditorState {
  // 文件树
  fileTree: FileNode[];
  expandedPaths: Set<string>;
  selectedPath: string | null;

  // 编辑器标签页
  tabs: EditorTab[];
  activeTabId: string | null;

  // 编辑器状态
  isDirty: boolean;
}

export interface EditorActions {
  // 文件树操作
  setFileTree: (tree: FileNode[]) => void;
  toggleExpand: (path: string) => void;
  selectFile: (path: string) => void;

  // 标签页操作
  openTab: (file: FileNode) => void;
  closeTab: (tabId: string) => void;
  switchTab: (tabId: string) => void;

  // 编辑器操作
  updateContent: (content: string) => void;
  saveFile: () => void;
}
