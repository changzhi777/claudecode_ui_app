/**
 * CLI 文件操作事件处理器
 * 监听 CLI 流式数据中的文件操作事件并同步到 UI
 */

import { StoreApi } from 'zustand';
import { useEditorStore } from '@stores/editorStore';
import type { ElectronAPI } from '../global.d.ts';

export interface FileOperationEvent {
  type: 'read' | 'write' | 'edit' | 'delete' | 'bash';
  tool?: string;
  path?: string;
  paths?: string[];
  timestamp: number;
}

export class FileOperationHandler {
  private editorStore: StoreApi<ReturnType<typeof useEditorStore.getState>>;
  private lastRefreshTime = 0;
  private readonly REFRESH_COOLDOWN = 1000; // 1秒冷却时间

  constructor() {
    this.editorStore = useEditorStore;
  }

  /**
   * 处理 CLI 流式数据，提取文件操作事件
   */
  handleStreamData(data: { type: string; content?: string; timestamp?: number; tool_calls?: any[] }): FileOperationEvent[] {
    const events: FileOperationEvent[] = [];

    // 检查工具调用
    if (data.tool_calls && Array.isArray(data.tool_calls)) {
      for (const tool of data.tool_calls) {
        const event = this.parseToolCall(tool);
        if (event) {
          events.push(event);
        }
      }
    }

    return events;
  }

  /**
   * 解析工具调用
   */
  private parseToolCall(tool: any): FileOperationEvent | null {
    const { name, input, status } = tool;

    // 只处理运行中或已完成的工具调用
    if (status === 'pending' || !input) {
      return null;
    }

    const timestamp = Date.now();

    switch (name) {
      case 'Read':
        if (input.file_path) {
          return {
            type: 'read',
            tool: name,
            path: input.file_path,
            timestamp,
          };
        }
        break;

      case 'Write':
        if (input.file_path) {
          return {
            type: 'write',
            tool: name,
            path: input.file_path,
            timestamp,
          };
        }
        break;

      case 'Edit':
        if (input.file_path) {
          return {
            type: 'edit',
            tool: name,
            path: input.file_path,
            timestamp,
          };
        }
        break;

      case 'Bash':
        // 检测可能影响文件系统的命令
        if (input.command && this.isFileAffectingCommand(input.command)) {
          return {
            type: 'bash',
            tool: name,
            path: undefined,
            timestamp,
          };
        }
        break;

      default:
        break;
    }

    return null;
  }

  /**
   * 检测是否是影响文件系统的 Bash 命令
   */
  private isFileAffectingCommand(command: string): boolean {
    const fileAffectingPatterns = [
      /\bgit\s+(checkout|clone|pull|push|merge|rebase|stash|reset)/,
      /\bnpm\s+(install|uninstall|update)/,
      /\bpnpm\s+(install|remove|update)/,
      /\byarn\s+(add|remove|upgrade)/,
      /\b(rm|mv|cp|mkdir|touch)\b/,
      /\b(cmake|make|gradle)/,
    ];

    return fileAffectingPatterns.some((pattern) => pattern.test(command));
  }

  /**
   * 处理文件操作事件
   */
  async handleFileOperation(event: FileOperationEvent): Promise<void> {
    const now = Date.now();

    switch (event.type) {
      case 'read':
        // 自动打开文件到编辑器
        if (event.path) {
          await this.openFileInEditor(event.path);
        }
        break;

      case 'write':
      case 'edit':
        // 刷新文件树 + 自动打开文件
        if (event.path) {
          await this.openFileInEditor(event.path);
          await this.refreshFileTree(now);
        }
        break;

      case 'bash':
        // 刷新文件树
        await this.refreshFileTree(now);
        break;

      default:
        break;
    }
  }

  /**
   * 打开文件到编辑器
   */
  private async openFileInEditor(filePath: string): Promise<void> {
    try {
      // 通过 IPC 读取文件内容
      const content = await (window.electronAPI as ElectronAPI).invoke('file:read', { path: filePath }) as string;

      // 检测语言类型
      const language = this.detectLanguage(filePath);

      // 创建 FileNode 对象（匹配 store 的 openTab 签名）
      const fileNode = {
        id: filePath,
        name: filePath.split('/').pop() || filePath,
        path: filePath,
        type: 'file' as const,
        metadata: {
          language,
        },
      };

      // 打开标签页
      this.editorStore.getState().openTab(fileNode);

      // 更新标签页内容（因为 openTab 中 content 是空的）
      const { tabs, activeTabId } = this.editorStore.getState();
      const activeTab = tabs.find((t) => t.id === activeTabId);
      if (activeTab && activeTab.filePath === filePath) {
        this.editorStore.getState().updateContent(content);
      }
    } catch (error) {
      console.error('[FileOperationHandler] 打开文件失败:', error);
    }
  }

  /**
   * 刷新文件树（带冷却时间）
   */
  private async refreshFileTree(now: number): Promise<void> {
    if (now - this.lastRefreshTime < this.REFRESH_COOLDOWN) {
      return; // 冷却中，跳过刷新
    }

    this.lastRefreshTime = now;

    try {
      // 触发文件树刷新
      const { refreshFileTree } = this.editorStore.getState();
      if (refreshFileTree) {
        await refreshFileTree();
      }
    } catch (error) {
      console.error('[FileOperationHandler] 刷新文件树失败:', error);
    }
  }

  /**
   * 检测文件语言类型
   */
  private detectLanguage(filePath: string): string {
    const ext = filePath.split('.').pop();
    const languageMap: Record<string, string> = {
      ts: 'typescript',
      tsx: 'typescript',
      js: 'javascript',
      jsx: 'javascript',
      py: 'python',
      rs: 'rust',
      go: 'go',
      json: 'json',
      md: 'markdown',
      txt: 'plaintext',
      html: 'html',
      css: 'css',
      scss: 'scss',
      yaml: 'yaml',
      yml: 'yaml',
      toml: 'toml',
      xml: 'xml',
    };

    return languageMap[ext || ''] || 'plaintext';
  }
}

/**
 * 单例实例
 */
let fileOperationHandlerInstance: FileOperationHandler | null = null;

export function getFileOperationHandler(): FileOperationHandler {
  if (!fileOperationHandlerInstance) {
    fileOperationHandlerInstance = new FileOperationHandler();
  }
  return fileOperationHandlerInstance;
}
