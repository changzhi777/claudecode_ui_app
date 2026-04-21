/**
 * 导出功能组件
 */

import { useState } from 'react';
import { Download, FileText, FileJson } from 'lucide-react';
import { useChatStore } from '@stores/chatStore';
import type { ChatSession } from '@shared/types/chat';

interface ExportOptions {
  format: 'markdown' | 'json' | 'txt';
  includeMetadata: boolean;
}

export function ExportButton() {
  const [showMenu, setShowMenu] = useState(false);
  const [options, setOptions] = useState<ExportOptions>({
    format: 'markdown',
    includeMetadata: true,
  });

  const { sessions, currentSessionId } = useChatStore();

  const handleExport = () => {
    const session = sessions.find((s) => s.id === currentSessionId);
    if (!session) return;

    let content = '';
    let filename = '';
    let mimeType = 'text/plain';

    switch (options.format) {
      case 'markdown':
        content = exportToMarkdown(session);
        filename = `${session.title}.md`;
        mimeType = 'text/markdown';
        break;
      case 'json':
        content = exportToJSON(session);
        filename = `${session.title}.json`;
        mimeType = 'application/json';
        break;
      case 'txt':
        content = exportToText(session);
        filename = `${session.title}.txt`;
        mimeType = 'text/plain';
        break;
    }

    // 创建下载链接
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setShowMenu(false);
  };

  const exportToMarkdown = (session: ChatSession) => {
    let md = `# ${session.title}\n\n`;
    md += `**导出时间**: ${new Date().toLocaleString('zh-CN')}\n\n`;
    md += `**消息数量**: ${session.messages.length}\n\n`;
    md += `---\n\n`;

    session.messages.forEach((msg) => {
      const role = msg.role === 'user' ? '用户' : msg.role === 'assistant' ? 'Claude' : '系统';
      md += `## ${role}\n\n`;
      md += `${msg.content}\n\n`;
      if (options.includeMetadata && msg.metadata) {
        md += `*元数据*: ${JSON.stringify(msg.metadata)}\n\n`;
      }
      md += `---\n\n`;
    });

    return md;
  };

  const exportToJSON = (session: ChatSession) => {
    return JSON.stringify(session, null, 2);
  };

  const exportToText = (session: ChatSession) => {
    let txt = `${session.title}\n`;
    txt += `${'='.repeat(session.title.length)}\n\n`;
    txt += `导出时间: ${new Date().toLocaleString('zh-CN')}\n\n`;

    session.messages.forEach((msg, index: number) => {
      const role = msg.role === 'user' ? '用户' : msg.role === 'assistant' ? 'Claude' : '系统';
      txt += `[${index + 1}] ${role}:\n`;
      txt += `${msg.content}\n\n`;
    });

    return txt;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors flex items-center gap-2"
        title="导出对话"
      >
        <Download size={16} className="text-text-secondary" />
        <span className="text-sm text-text-secondary hidden sm:inline">导出</span>
      </button>

      {showMenu && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-bg-secondary border border-bg-tertiary rounded-lg shadow-lg overflow-hidden z-50">
          {/* 格式选择 */}
          <div className="p-2 border-b border-bg-tertiary">
            <p className="text-xs text-text-tertiary mb-2 px-2">导出格式</p>
            <div className="space-y-1">
              <button
                onClick={() => setOptions({ ...options, format: 'markdown' })}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  options.format === 'markdown'
                    ? 'bg-bg-tertiary text-text-primary'
                    : 'text-text-secondary hover:bg-bg-tertiary/50'
                }`}
              >
                <FileText size={16} />
                Markdown
              </button>
              <button
                onClick={() => setOptions({ ...options, format: 'json' })}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  options.format === 'json'
                    ? 'bg-bg-tertiary text-text-primary'
                    : 'text-text-secondary hover:bg-bg-tertiary/50'
                }`}
              >
                <FileJson size={16} />
                JSON
              </button>
              <button
                onClick={() => setOptions({ ...options, format: 'txt' })}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  options.format === 'txt'
                    ? 'bg-bg-tertiary text-text-primary'
                    : 'text-text-secondary hover:bg-bg-tertiary/50'
                }`}
              >
                <FileText size={16} />
                纯文本
              </button>
            </div>
          </div>

          {/* 选项 */}
          <div className="p-2 border-b border-bg-tertiary">
            <label className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary cursor-pointer hover:bg-bg-tertiary/50 rounded-lg">
              <input
                type="checkbox"
                checked={options.includeMetadata}
                onChange={(e) => setOptions({ ...options, includeMetadata: e.target.checked })}
                className="rounded"
              />
              包含元数据
            </label>
          </div>

          {/* 导出按钮 */}
          <div className="p-2">
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-color-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Download size={16} />
              导出
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
