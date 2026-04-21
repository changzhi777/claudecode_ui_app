# 任务可视化模块

[根目录](../../../CLAUDE.md) > [src/renderer](../../) > **modules/task-viz**

---

## 变更记录 (Changelog)

| 日期 | 操作 | 说明 |
|------|------|------|
| 2026-04-22 04:03:38 | 初始化 | 创建任务可视化模块文档 |

---

## 模块职责

可视化展示 ClaudeCode CLI 的执行任务：

1. **任务列表**：展示当前运行的所有任务
2. **进度追踪**：实时显示任务进度与状态
3. **日志输出**：显示任务执行日志
4. **任务控制**：暂停、恢复、取消任务
5. **错误提示**：任务失败时的错误信息展示
6. **性能监控**：CPU、内存使用情况（可选）

---

## 入口与启动

### 主组件
**文件路径**: `src/renderer/modules/task-viz/index.tsx`

```typescript
// 组件结构（待实现）
export function TaskVisualization() {
  return (
    <div className="h-full flex flex-col">
      <TaskList />
      <TaskDetail />
      <TaskLogs />
    </div>
  );
}
```

### 子组件
- `TaskList.tsx` - 任务列表（侧边栏）
- `TaskCard.tsx` - 单个任务卡片
- `TaskProgressBar.tsx` - 进度条
- `TaskLogs.tsx` - 日志输出窗口
- `TaskControls.tsx` - 控制按钮（暂停/取消）

---

## 对外接口

### Props 接口

```typescript
interface TaskVisualizationProps {
  tasks: Task[];
  activeTaskId: string | null;
  onTaskSelect: (taskId: string) => void;
  onTaskCancel: (taskId: string) => void;
  onTaskPause: (taskId: string) => void;
}

interface TaskCardProps {
  task: Task;
  isActive: boolean;
  onClick: () => void;
}

interface TaskProgressBarProps {
  progress: number;        // 0-100
  status: TaskStatus;
  message?: string;
}
```

### 数据结构

```typescript
type TaskStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';

interface Task {
  id: string;
  name: string;
  description?: string;
  status: TaskStatus;
  progress: number;
  startTime: number;
  endTime?: number;
  logs: TaskLog[];
  metadata?: {
    type: 'file-read' | 'file-write' | 'cli-command' | 'ai-generation';
    target?: string;
  };
}

interface TaskLog {
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
}
```

---

## 关键依赖与配置

### 核心依赖
- `date-fns`: 时间格式化
- `lucide-react`: 状态图标

### 状态管理
使用 `src/stores/task.ts`：

```typescript
// 从 Zustand store 获取数据
const tasks = useTaskStore(state => state.tasks);
const activeTask = useTaskStore(state => state.activeTask);
const cancelTask = useTaskStore(state => state.cancelTask);
```

### 颜色配置
```css
/* 任务状态颜色 */
.status-pending { @apply text-gray-500; }
.status-running { @apply text-blue-500 animate-pulse; }
.status-completed { @apply text-green-500; }
.status-failed { @apply text-red-500; }
.status-paused { @apply text-yellow-500; }
```

---

## UI/UX 设计要点

### 布局结构
```
┌─────────────────────────────────────┐
│ 📋 Tasks (3)                        │ <- 任务列表标题
├─────────────────────────────────────┤
│ ▶ Reading src/...           [▓▓░] 80%│ <- 任务卡片
│ ▶ Generating code...        [▓░░] 30%│
│ ✔ File written              [███] 100%│
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Task: Reading src/...               │ <- 任务详情
├─────────────────────────────────────┤
│ Progress: 80% (800/1000 lines)      │
│ Status: Running                     │
│ Started: 2 min ago                  │
├─────────────────────────────────────┤
│ [⏸️ Pause] [⏹️ Cancel]              │ <- 控制按钮
├─────────────────────────────────────┤
│ 📋 Logs                             │
│ 10:30:15 [INFO] Starting task...    │ <- 日志
│ 10:30:16 [INFO] Reading file...     │
│ 10:30:17 [WARN] Large file detected │
└─────────────────────────────────────┘
```

### 状态图标
```typescript
const STATUS_ICONS: Record<TaskStatus, React.ReactNode> = {
  pending: <ClockIcon className="text-gray-500" />,
  running: <LoaderIcon className="text-blue-500 animate-spin" />,
  paused: <PauseIcon className="text-yellow-500" />,
  completed: <CheckCircleIcon className="text-green-500" />,
  failed: <XCircleIcon className="text-red-500" />,
  cancelled: <BanIcon className="text-gray-400" />,
};
```

### 交互规范
1. **单击任务卡片**：查看任务详情
2. **暂停按钮**：暂停正在运行的任务
3. **取消按钮**：终止任务执行
4. **日志自动滚动**：显示最新日志
5. **日志搜索**：过滤特定级别日志

---

## 测试与质量

### 单元测试
- 任务状态转换测试
- 进度条渲染测试
- 日志过滤测试

### 集成测试
- 任务创建与更新流程测试
- IPC 消息接收测试

### 测试文件
```
task-viz/
├── __tests__/
│   ├── TaskVisualization.test.tsx
│   ├── TaskCard.test.tsx
│   └── TaskProgressBar.test.tsx
```

---

## 常见问题 (FAQ)

### Q: 如何处理大量任务？
A: 使用虚拟滚动列表，限制最多显示 100 个任务，旧任务自动归档。

### Q: 如何实现实时日志更新？
A: 通过 IPC 监听 CLI 的 `log` 事件，将日志追加到当前任务的 `logs` 数组。

### Q: 如何显示长时间运行的任务？
A: 显示已用时间（`Date.now() - startTime`），预计剩余时间（基于进度估算）。

---

## 相关文件清单

- `src/renderer/modules/task-viz/index.tsx` - 主组件
- `src/renderer/modules/task-viz/TaskList.tsx` - 任务列表
- `src/renderer/modules/task-viz/TaskCard.tsx` - 任务卡片
- `src/renderer/modules/task-viz/TaskLogs.tsx` - 日志窗口

---

## 下一步行动

1. ⬜ 创建基础组件结构
2. ⬜ 实现任务列表与状态展示
3. ⬜ 添加进度条动画
4. ⬜ 实现日志实时更新
5. ⬜ 集成任务控制逻辑

---

**模块状态**: 🟡 规划中
**负责人**: 待分配
**最后更新**: 2026-04-22 04:03:38
