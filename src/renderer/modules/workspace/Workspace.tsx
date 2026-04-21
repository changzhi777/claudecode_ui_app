import { lazy, Suspense } from 'react';
import { FileTree } from '../file-tree/FileTree';
import { InlineLoading } from '../../components/Loading';

// 懒加载代码编辑器（Monaco Editor 很大）
const CodeEditor = lazy(() =>
  import('../code-editor/CodeEditor').then((m) => ({ default: m.CodeEditor }))
);

export function Workspace() {
  return (
    <div className="flex h-full">
      {/* 文件树 - 可调整宽度 */}
      <div className="w-64 flex-shrink-0">
        <FileTree />
      </div>

      {/* 代码编辑器 - 懒加载 */}
      <div className="flex-1">
        <Suspense fallback={<InlineLoading text="加载编辑器..." />}>
          <CodeEditor />
        </Suspense>
      </div>
    </div>
  );
}
