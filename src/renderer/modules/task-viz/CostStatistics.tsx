import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, Activity, Zap } from 'lucide-react';
import { useCLIStore } from '../../stores/cliStore';

interface CostData {
  totalCost: number;
  totalTokens: number;
  totalRequests: number;
  averageResponseTime: number;
  modelUsage: Record<string, { tokens: number; cost: number; requests: number }>;
  timeline: Array<{ timestamp: number; tokens: number; cost: number }>;
}

/**
 * 成本统计面板
 * 显示 API 调用的成本和 Token 使用情况
 */
export function CostStatistics() {
  const { messages, stats } = useCLIStore();
  const [costData, setCostData] = useState<CostData>({
    totalCost: 0,
    totalTokens: 0,
    totalRequests: 0,
    averageResponseTime: 0,
    modelUsage: {},
    timeline: [],
  });

  useEffect(() => {
    calculateCosts();
  }, [messages, stats]);

  const calculateCosts = () => {
    // 定价（示例，实际需要根据官方定价）
    const PRICING = {
      'claude-opus-4-20250514': { input: 15.0, output: 75.0, per: 1_000_000 },
      'claude-sonnet-4-20250514': { input: 3.0, output: 15.0, per: 1_000_000 },
      'claude-haiku-4-20250514': { input: 0.8, output: 4.0, per: 1_000_000 },
    };

    let totalCost = 0;
    let totalTokens = 0;
    let totalRequests = 0;
    let totalTime = 0;
    const modelUsage: Record<string, { tokens: number; cost: number; requests: number }> = {};
    const timeline: Array<{ timestamp: number; tokens: number; cost: number }> = [];

    messages.forEach((msg) => {
      if (msg.metadata) {
        const { tokens, duration, model } = msg.metadata;
        const modelName = model || 'claude-sonnet-4-20250514';

        if (tokens) {
          totalTokens += tokens;
          totalRequests += 1;

          if (duration) {
            totalTime += duration;
          }

          // 估算成本（简化计算）
          const pricing = PRICING[modelName as keyof typeof PRICING] || PRICING['claude-sonnet-4-20250514'];
          const estimatedCost = (tokens / pricing.per) * pricing.input;
          totalCost += estimatedCost;

          // 模型使用统计
          if (!modelUsage[modelName]) {
            modelUsage[modelName] = { tokens: 0, cost: 0, requests: 0 };
          }
          modelUsage[modelName].tokens += tokens;
          modelUsage[modelName].cost += estimatedCost;
          modelUsage[modelName].requests += 1;

          // 时间线数据
          timeline.push({
            timestamp: msg.timestamp,
            tokens,
            cost: estimatedCost,
          });
        }
      }
    });

    setCostData({
      totalCost,
      totalTokens,
      totalRequests,
      averageResponseTime: totalRequests > 0 ? totalTime / totalRequests : 0,
      modelUsage,
      timeline: timeline.sort((a, b) => a.timestamp - b.timestamp),
    });
  };

  const formatCost = (cost: number) => {
    return `$${cost.toFixed(4)}`;
  };

  const formatTokens = (tokens: number) => {
    if (tokens >= 1_000_000) {
      return `${(tokens / 1_000_000).toFixed(2)}M`;
    }
    if (tokens >= 1_000) {
      return `${(tokens / 1_000).toFixed(2)}K`;
    }
    return tokens.toString();
  };

  const formatDuration = (ms: number) => {
    if (ms >= 1000) {
      return `${(ms / 1000).toFixed(2)}s`;
    }
    return `${ms.toFixed(0)}ms`;
  };

  return (
    <div className="h-full flex flex-col bg-bg-secondary">
      {/* 标题栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-bg-tertiary">
        <div className="flex items-center gap-2">
          <DollarSign size={18} className="text-color-primary" />
          <h3 className="text-sm font-semibold text-text-primary">成本统计</h3>
        </div>
        <div className="text-xs text-text-tertiary">实时更新</div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 gap-3 p-4">
        {/* 总成本 */}
        <div className="p-3 bg-bg-tertiary rounded-lg border border-bg-tertiary">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={14} className="text-green-500" />
            <span className="text-xs text-text-secondary">总成本</span>
          </div>
          <div className="text-lg font-semibold text-text-primary">
            {formatCost(costData.totalCost)}
          </div>
        </div>

        {/* 总 Token */}
        <div className="p-3 bg-bg-tertiary rounded-lg border border-bg-tertiary">
          <div className="flex items-center gap-2 mb-1">
            <Activity size={14} className="text-blue-500" />
            <span className="text-xs text-text-secondary">总 Token</span>
          </div>
          <div className="text-lg font-semibold text-text-primary">
            {formatTokens(costData.totalTokens)}
          </div>
        </div>

        {/* 总请求数 */}
        <div className="p-3 bg-bg-tertiary rounded-lg border border-bg-tertiary">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} className="text-purple-500" />
            <span className="text-xs text-text-secondary">总请求</span>
          </div>
          <div className="text-lg font-semibold text-text-primary">
            {costData.totalRequests}
          </div>
        </div>

        {/* 平均响应时间 */}
        <div className="p-3 bg-bg-tertiary rounded-lg border border-bg-tertiary">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={14} className="text-yellow-500" />
            <span className="text-xs text-text-secondary">平均响应</span>
          </div>
          <div className="text-lg font-semibold text-text-primary">
            {formatDuration(costData.averageResponseTime)}
          </div>
        </div>
      </div>

      {/* 模型使用统计 */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-text-secondary mb-2">模型使用</h4>
          <div className="space-y-2">
            {Object.entries(costData.modelUsage).map(([model, data]) => (
              <div
                key={model}
                className="p-3 bg-bg-tertiary rounded-lg border border-bg-tertiary"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-mono text-text-primary">{model}</span>
                  <span className="text-xs text-text-secondary">
                    {data.requests} 次请求
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-text-tertiary">Token: </span>
                    <span className="text-text-primary font-mono">
                      {formatTokens(data.tokens)}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-tertiary">成本: </span>
                    <span className="text-text-primary font-mono">
                      {formatCost(data.cost)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 时间线 */}
        {costData.timeline.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-text-secondary mb-2">使用趋势</h4>
            <div className="p-3 bg-bg-tertiary rounded-lg border border-bg-tertiary">
              <div className="space-y-1">
                {costData.timeline.slice(-10).map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-text-tertiary font-mono">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-text-secondary">
                        {formatTokens(item.tokens)}
                      </span>
                      <span className="text-text-primary font-mono">
                        {formatCost(item.cost)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
