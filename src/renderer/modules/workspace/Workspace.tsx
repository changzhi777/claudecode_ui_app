import { FileTree } from '../file-tree/FileTree';
import { CodeEditor } from '../code-editor/CodeEditor';

export function Workspace() {
  return (
    <div className="flex h-full">
      {/* 文件树 - 可调整宽度 */}
      <div className="w-64 flex-shrink-0">
        <FileTree />
      </div>

      {/* 代码编辑器 */}
      <div className="flex-1">
        <CodeEditor />
      </div>
    </div>
  );
}
