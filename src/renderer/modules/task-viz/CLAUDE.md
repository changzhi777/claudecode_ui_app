# 任务可视化模块

[根目录](../../../CLAUDE.md) > [src/renderer](../../) > **modules/task-viz**

---

## 变更记录 (Changelog)

| 日期 | 操作 | 说明 |
|------|------|------|
| 2026-04-22 07:00:00 | 初始化 | 创建任务可视化与成本统计模块 |

---

## 模块职责

提供 CLI 任务执行的可视化和成本统计：

1. **任务可视化**：实时显示工具调用状态
2. **成本统计**：API 调用成本和 Token 使用分析
3. **性能监控**：响应时间和请求频率统计
4. **模型使用**：不同模型的使用分布

---

## 入口与启动

### 主组件

**TaskVisualization** - 任务可视化组件：
```typescript
import { TaskVisualization } from '@renderer/modules/task-viz';

<TaskVisualization sessionId="session-123" />
```

**CostStatistics** - 成本统计组件：
```typescript
import { CostStatistics } from '@renderer/modules/task-viz';

<CostStatistics />
```

---

## 下一步行动

1. ✅ 实现任务可视化
2. ✅ 实现成本统计
3. ⬜ 添加图表可视化（Chart.js）
4. ⬜ 支持数据导出（CSV/JSON）
5. ⬜ 添加成本预警功能

---

**模块状态**: ✅ 核心功能完成
**最后更新**: 2026-04-22 07:00:00
