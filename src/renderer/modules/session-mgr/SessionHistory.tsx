/**
 * 会话历史侧边栏
 */

import { useChatStore } from '@stores';
import { MessageSquare, Trash2, Plus, Clock, Search } from 'lucide-react';
import { useState } from 'react';
import { ExportButton } from '../../components/ExportButton';

export function SessionHistory() {
  const { sessions, currentSessionId, createSession, deleteSession, switchSession } =
    useChatStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSessions = sessions.filter((session) =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 360000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins} 分钟前`;
    if (diffHours < 24) return `${diffHours} 小时前`;
    if (diffDays < 7) return `${diffDays} 天前`;
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <div className="w-64 border-r border-bg-tertiary bg-bg-secondary flex flex-col">
      {/* 头部 */}
      <div className="p-4 border-b border-bg-tertiary">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-text-primary">对话历史</h2>
          <span className="text-xs text-text-tertiary">{sessions.length}</span>
        </div>

        {/* 搜索框 */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索对话..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-bg-tertiary border border-transparent rounded-lg focus:border-color-accent focus:outline-none focus:bg-bg-elevated transition-colors"
          />
        </div>
      </div>

      {/* 新建对话按钮 */}
      <div className="p-3">
        <button
          onClick={() => createSession()}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-color-primary text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
        >
          <Plus size={16} />
          新建对话
        </button>
      </div>

      {/* 对话列表 */}
      <div className="flex-1 overflow-y-auto px-3">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-8 text-text-tertiary">
            <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">{searchQuery ? '未找到匹配的对话' : '暂无对话'}</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredSessions.map((session) => {
              const isActive = session.id === currentSessionId;
              const messageCount = session.messages.length;

              return (
                <div
                  key={session.id}
                  className={`
                    group relative p-3 rounded-lg cursor-pointer transition-all
                    ${isActive ? 'bg-bg-tertiary' : 'hover:bg-bg-tertiary/50'}
                  `}
                  onClick={() => switchSession(session.id)}
                >
                  {/* 对话标题 */}
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3
                      className={`text-sm font-medium truncate flex-1 ${
                        isActive ? 'text-text-primary' : 'text-text-secondary'
                      }`}
                    >
                      {session.title}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`确定删除对话"${session.title}"吗？`)) {
                          deleteSession(session.id);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-bg-primary rounded transition-all"
                      title="删除对话"
                    >
                      <Trash2 size={14} className="text-text-tertiary hover:text-color-error" />
                    </button>
                  </div>

                  {/* 元信息 */}
                  <div className="flex items-center gap-2 text-xs text-text-tertiary">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {formatTime(session.updatedAt)}
                    </span>
                    <span>•</span>
                    <span>{messageCount} 条消息</span>
                  </div>

                  {/* 最后一条消息预览 */}
                  {session.messages.length > 0 && (
                    <p className="mt-2 text-xs text-text-tertiary truncate line-clamp-2">
                      {session.messages[session.messages.length - 1].content}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 底部操作 */}
      <div className="p-3 border-t border-bg-tertiary">
        <ExportButton />
      </div>
    </div>
  );
}
