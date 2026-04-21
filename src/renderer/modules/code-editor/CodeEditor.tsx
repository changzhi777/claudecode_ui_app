import { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useEditorStore } from '@stores/editorStore';
import { EditorTabBar } from './components/EditorTabBar';
import { Save, RefreshCw } from 'lucide-react';
import { getFileOperationHandler } from '../../services/FileOperationHandler';
import type { ElectronAPI } from '../../global.d.ts';

export function CodeEditor() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Monaco Editor 类型未完全导出
  const editorRef = useRef<any>(null);
  const { tabs, activeTabId, updateContent, saveFile } = useEditorStore();

  // 监听 CLI 流式数据事件
  useEffect(() => {
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
  }, []);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Monaco Editor 类型未完全导出
  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;

    // 设置编辑器主题
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'warp') {
      // monaco.editor.setTheme('vs-dark');
    } else {
      // monaco.editor.setTheme('vs');
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      updateContent(value);
    }
  };

  const handleSave = () => {
    saveFile();
  };

  if (!activeTab) {
    return (
      <div className="flex-1 flex items-center justify-center bg-editor-bg">
        <div className="text-center text-text-tertiary">
          <p className="text-lg mb-2">👋 你好！</p>
          <p className="text-sm">从左侧文件树选择一个文件开始编辑</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-editor-bg">
      {/* 标签页栏 */}
      <EditorTabBar />

      {/* 工具栏 */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-bg-tertiary bg-bg-secondary">
        <div className="flex items-center gap-4">
          <span className="text-sm text-text-tertiary">{activeTab.filePath}</span>
          {activeTab.isModified && (
            <span className="text-xs px-2 py-0.5 bg-color-primary/10 text-color-primary rounded">
              已修改
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded transition-colors"
            title="保存 (⌘S)"
          >
            <Save size={16} />
            保存
          </button>
          <button
            className="p-1.5 hover:bg-bg-tertiary rounded transition-colors"
            title="格式化代码"
          >
            <RefreshCw size={16} className="text-text-secondary" />
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={activeTab.language}
          value={activeTab.content}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          theme="vs"
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            formatOnPaste: true,
            formatOnType: true,
          }}
        />
      </div>

      {/* 状态栏 */}
      <div className="flex items-center justify-between px-4 py-1 border-t border-bg-tertiary bg-bg-secondary text-xs text-text-tertiary">
        <div className="flex items-center gap-4">
          <span>{activeTab.language}</span>
          <span>UTF-8</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Ln 1, Col 1</span>
          <span>Spaces: 2</span>
        </div>
      </div>
    </div>
  );
}
