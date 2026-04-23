import { CheckCircle2, Clock, AlertCircle, XCircle, Loader2 } from 'lucide-react';
import type { Task } from '@shared/types/task';
import { getTaskIcon, getTaskColor } from '@stores';

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const getStatusIcon = () => {
    switch (task.status) {
      case 'pending':
        return <Clock size={14} className="text-text-tertiary" />;
      case 'running':
        return <Loader2 size={14} className="animate-spin text-color-primary" />;
      case 'completed':
        return <CheckCircle2 size={14} className="text-color-success" />;
      case 'failed':
        return <AlertCircle size={14} className="text-color-error" />;
      case 'cancelled':
        return <XCircle size={14} className="text-text-tertiary" />;
    }
  };

  const taskColor = getTaskColor(task.type);

  return (
    <div className="flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-bg-tertiary transition-colors">
      {/* 状态图标 */}
      <div className="flex-shrink-0 mt-0.5">{getStatusIcon()}</div>

      {/* 任务内容 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm">{getTaskIcon(task.type)}</span>
          <span className="text-sm font-medium text-text-primary truncate">{task.title}</span>
        </div>

        {task.description && (
          <p className="text-xs text-text-secondary truncate">{task.description}</p>
        )}

        {/* 元数据 */}
        {task.metadata && (
          <div className="flex items-center gap-2 mt-1 text-xs text-text-tertiary">
            {task.metadata.filePath && (
              <span className="truncate">{task.metadata.filePath}</span>
            )}
            {task.metadata.lineNumber && <span>:{task.metadata.lineNumber}</span>}
          </div>
        )}

        {/* 进度条 */}
        {task.status === 'running' && task.progress > 0 && (
          <div className="mt-2 h-1 bg-bg-tertiary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${task.progress}%`,
                backgroundColor: taskColor,
              }}
            />
          </div>
        )}

        {/* 错误信息 */}
        {task.status === 'failed' && task.metadata?.error && (
          <p className="mt-2 text-xs text-color-error bg-color-error/10 px-2 py-1 rounded">
            {task.metadata.error}
          </p>
        )}
      </div>

      {/* 时间戳 */}
      <div className="flex-shrink-0 text-xs text-text-tertiary">
        {task.endTime
          ? `${((task.endTime - task.startTime) / 1000).toFixed(1)}s`
          : `${((Date.now() - task.startTime) / 1000).toFixed(1)}s`}
      </div>
    </div>
  );
}
