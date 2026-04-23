import { useTaskStore } from '@stores';
import { TaskItem } from './components/TaskItem';
import { ChevronDown, ChevronUp, Trash2, MinusCircle, CheckCircle2 } from 'lucide-react';

export function TaskViz() {
  const { activeGroup, completedGroups, isExpanded, toggleExpanded, clearCompleted } =
    useTaskStore();

  if (!activeGroup && completedGroups.length === 0) {
    return null;
  }

  return (
    <div
      className={`border-l border-bg-tertiary bg-bg-secondary transition-all duration-300 ${
        isExpanded ? 'w-80' : 'w-12'
      }`}
    >
      {/* 头部 */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-bg-tertiary">
        {isExpanded ? (
          <span className="text-sm font-medium text-text-primary">任务</span>
        ) : (
          <span className="text-lg">📋</span>
        )}
        <div className="flex items-center gap-1">
          {completedGroups.length > 0 && (
            <button
              onClick={clearCompleted}
              className="p-1 hover:bg-bg-tertiary rounded transition-colors"
              title="清除已完成"
            >
              <Trash2 size={14} className="text-text-tertiary hover:text-text-secondary" />
            </button>
          )}
          <button
            onClick={toggleExpanded}
            className="p-1 hover:bg-bg-tertiary rounded transition-colors"
            title={isExpanded ? '收起' : '展开'}
          >
            {isExpanded ? (
              <ChevronDown size={14} className="text-text-secondary" />
            ) : (
              <ChevronUp size={14} className="text-text-secondary" />
            )}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {/* 活跃任务组 */}
          {activeGroup && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-medium text-text-tertiary uppercase tracking-wide">
                  {activeGroup.title}
                </h3>
                <span className="text-xs text-text-tertiary">
                  {activeGroup.tasks.filter((t) => t.status === 'running').length} 运行中
                </span>
              </div>
              <div className="space-y-1">
                {activeGroup.tasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}

          {/* 已完成的任务组 */}
          {completedGroups.length > 0 && (
            <div>
              <h3 className="text-xs font-medium text-text-tertiary uppercase tracking-wide mb-2">
                已完成 ({completedGroups.length})
              </h3>
              <div className="space-y-3">
                {completedGroups.slice(0, 5).map((group) => (
                  <div key={group.id} className="border border-bg-tertiary rounded-lg p-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-text-primary">{group.title}</span>
                      <span className="text-xs text-text-tertiary">
                        {group.tasks.length} 个任务
                      </span>
                    </div>
                    <div className="space-y-1">
                      {group.tasks.slice(0, 3).map((task) => (
                        <div key={task.id} className="flex items-center gap-2 text-xs">
                          <span>{getTaskIcon(task.type)}</span>
                          <span className="text-text-secondary truncate flex-1">{task.title}</span>
                          <CheckCircle2 size={12} className="text-color-success flex-shrink-0" />
                        </div>
                      ))}
                      {group.tasks.length > 3 && (
                        <div className="text-xs text-text-tertiary text-center pt-1">
                          还有 {group.tasks.length - 3} 个任务...
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 空状态 */}
          {!activeGroup && completedGroups.length === 0 && (
            <div className="text-center py-8 text-text-tertiary">
              <MinusCircle size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">暂无任务</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function getTaskIcon(type: string) {
  const icons: Record<string, string> = {
    thinking: '🤔',
    reading: '📖',
    searching: '🔍',
    editing: '✏️',
    executing: '⚡',
    analyzing: '🔬',
  };
  return icons[type] || '📋';
}
