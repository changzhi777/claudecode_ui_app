import { useCLIStore } from '../../../stores/cliStore';

/**
 * 工具调用可视化组件
 * 显示 AI 正在使用的工具
 */
export function ToolVisualization() {
  const { currentTool, activeTools } = useCLIStore();

  if (!currentTool && activeTools.size === 0) {
    return null;
  }

  return (
    <div className="tool-visualization">
      {/* 当前工具 */}
      {currentTool && (
        <div className="current-tool">
          <span className="tool-label">正在执行:</span>
          <span className="tool-name">{currentTool}</span>
          <span className="tool-spinner">⏳</span>
        </div>
      )}

      {/* 工具列表 */}
      {activeTools.size > 0 && (
        <div className="active-tools">
          <span className="tools-title">工具调用:</span>
          {Array.from(activeTools.values()).map(tool => (
            <ToolBadge key={tool.id} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * 工具徽章
 */
interface ToolBadgeProps {
  tool: {
    id: string;
    name: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    startTime?: number;
  };
}

function ToolBadge({ tool }: ToolBadgeProps) {
  const getStatusColor = () => {
    switch (tool.status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
    }
  };

  const getStatusIcon = () => {
    switch (tool.status) {
      case 'pending':
        return '⏳';
      case 'running':
        return '🔄';
      case 'completed':
        return '✅';
      case 'failed':
        return '❌';
    }
  };

  return (
    <div className={`tool-badge ${getStatusColor()}`}>
      <span className="badge-icon">{getStatusIcon()}</span>
      <span className="badge-name">{tool.name}</span>
    </div>
  );
}
