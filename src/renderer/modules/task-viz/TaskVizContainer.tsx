import { useTaskStore } from '@stores';
import { TaskViz } from './TaskViz';
import { useTaskDemo } from './hooks/useTaskDemo';

export function TaskVizContainer() {
  const { activeGroup } = useTaskStore();

  // 启用演示（仅在开发环境）
  // @ts-expect-error - import.meta.env 是 Vite 特性
  const isDev = import.meta.env?.DEV;

  // React Hooks 必须无条件调用，在 hook 内部决定是否执行
  useTaskDemo(isDev);

  // 只在有活动任务组时显示
  if (!activeGroup) {
    return null;
  }

  return <TaskViz />;
}
