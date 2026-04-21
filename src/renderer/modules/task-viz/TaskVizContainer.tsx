import { useTaskStore } from '@stores/taskStore';
import { TaskViz } from './TaskViz';
import { useTaskDemo } from './hooks/useTaskDemo';

export function TaskVizContainer() {
  const { activeGroup } = useTaskStore();

  // 启用演示（仅在开发环境）
  // @ts-ignore - import.meta.env 是 Vite 特性
  if (import.meta.env?.DEV) {
    useTaskDemo();
  }

  // 只在有活动任务组时显示
  if (!activeGroup) {
    return null;
  }

  return <TaskViz />;
}
