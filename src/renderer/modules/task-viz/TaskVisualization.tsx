import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader, Clock, Play, Pause } from 'lucide-react';
import { useCLIStore } from '../../stores/cliStore';

interface TaskVisualizationProps {
  sessionId?: string;
}

/**
 * 任务可视化组件
 * 实时显示 CLI 执行的任务状态
 */
export function TaskVisualization({ sessionId }: TaskVisualizationProps) {
  const { messages, activeTools } = useCLIStore();
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  // 从消息中提取任务信息
  const tasks = messages
    .filter((msg) => msg.metadata?.tools && msg.metadata.tools.length > 0)
    .flatMap((msg) => msg.metadata?.tools || [])
    .map((tool) => ({
      id: tool.id,
      name: tool.name,
      status: tool.status,
      duration: tool.duration,
      input: tool.input,
      output: tool.output,
      error: tool.error,
      timestamp: Date.now(),
    }));

  const activeCount = tasks.filter((t) => t.status === 'running').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const failedCount = tasks.filter((t) => t.status === 'failed').length;

  const toggleExpand = (taskId: string) => {
    setExpandedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} className="text-text-tertiary" />;
      case 'running':
        return <Loader size={16} className="text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'failed':
        return <XCircle size={16} className="text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '等待中';
      case 'running':
        return '运行中';
      case 'completed':
        return '已完成';
      case 'failed':
        return '失败';
      default:
        return '未知';
    }
  };

  return (
    <div className="h-full flex flex-col bg-bg-secondary">
      {/* 标题栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-bg-tertiary">
        <div className="flex items-center gap-2">
          <Play size={18} className="text-color-primary" />
          <h3 className="text-sm font-semibold text-text-primary">任务管理</h3>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <Loader size={12} className="text-blue-500" />
            <span className="text-text-secondary">{activeCount} 运行中</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle size={12} className="text-green-500" />
            <span className="text-text-secondary">{completedCount} 完成</span>
          </div>
          <div className="flex items-center gap-1">
            <XCircle size={12} className="text-red-500" />
            <span className="text-text-secondary">{failedCount} 失败</span>
          </div>
        </div>
      </div>

      {/* 任务列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text-tertiary">
            <Clock size={32} className="mb-2 opacity-50" />
            <p className="text-sm">暂无任务</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                task.status === 'running'
                  ? 'bg-blue-500/5 border-blue-500/20'
                  : task.status === 'completed'
                    ? 'bg-green-500/5 border-green-500/20'
                    : task.status === 'failed'
                      ? 'bg-red-500/5 border-red-500/20'
                      : 'bg-bg-tertiary border-bg-tertiary'
              }`}
              onClick={() => toggleExpand(task.id)}
            >
              {/* 任务头部 */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(task.status)}
                  <span className="text-sm font-medium text-text-primary font-mono">
                    {task.name}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-xs rounded ${
                      task.status === 'running'
                        ? 'bg-blue-500/10 text-blue-500'
                        : task.status === 'completed'
                          ? 'bg-green-500/10 text-green-500'
                          : task.status === 'failed'
                            ? 'bg-red-500/10 text-red-500'
                            : 'bg-text-tertiary/10 text-text-tertiary'
                    }`}
                  >
                    {getStatusText(task.status)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-text-tertiary">
                  {task.duration && (
                    <span>{task.duration}ms</span>
                  )}
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      expandedTasks.has(task.id) ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {/* 任务详情（可展开） */}
              {expandedTasks.has(task.id) && (
                <div className="space-y-2 mt-3 pt-3 border-t border-bg-tertiary">
                  {/* 输入 */}
                  {task.input && (
                    <div>
                      <div className="text-xs text-text-tertiary mb-1">输入参数:</div>
                      <div className="p-2 bg-bg-tertiary rounded text-xs font-mono overflow-x-auto">
                        <pre className="whitespace-pre-wrap break-all">
                          {JSON.stringify(task.input, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* 输出 */}
                  {task.output && (
                    <div>
                      <div className="text-xs text-text-tertiary mb-1">输出结果:</div>
                      <div className="p-2 bg-bg-tertiary rounded text-xs font-mono overflow-x-auto max-h-40 overflow-y-auto">
                        <pre className="whitespace-pre-wrap break-all">
                          {JSON.stringify(task.output, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* 错误 */}
                  {task.error && (
                    <div>
                      <div className="text-xs text-red-500 mb-1">错误信息:</div>
                      <div className="p-2 bg-red-500/10 rounded text-xs font-mono text-red-500 overflow-x-auto">
                        <pre className="whitespace-pre-wrap break-all">
                          {String(task.error)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* 时间戳 */}
                  <div className="text-xs text-text-tertiary">
                    {new Date(task.timestamp).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
