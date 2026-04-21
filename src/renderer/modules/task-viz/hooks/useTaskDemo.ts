import { useEffect, useRef } from 'react';
import { useTaskStore } from '@stores/taskStore';

/**
 * Hook 用于演示任务可视化
 * TODO: 移除这个 Hook，改用真实的 IPC 通信
 *
 * @param enabled - 是否启用演示（默认仅在开发环境启用）
 */
export function useTaskDemo(enabled: boolean = true) {
  const { createGroup, addTask, updateTask, completeGroup } = useTaskStore();
  const taskIdsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!enabled) return;

    // 演示：创建一个示例任务组
    const groupId = createGroup('演示任务组');

    // 添加示例任务
    const tasks = [
      {
        groupId,
        task: {
          type: 'thinking' as const,
          status: 'pending' as const,
          title: '分析用户需求',
          description: '理解用户想要实现的功能',
          progress: 0,
        },
      },
      {
        groupId,
        task: {
          type: 'reading' as const,
          status: 'pending' as const,
          title: '读取项目文件',
          description: '分析现有代码结构',
          progress: 0,
          metadata: { filePath: 'src/App.tsx' },
        },
      },
      {
        groupId,
        task: {
          type: 'searching' as const,
          status: 'pending' as const,
          title: '搜索相关代码',
          description: '查找相关的函数和组件',
          progress: 0,
        },
      },
      {
        groupId,
        task: {
          type: 'editing' as const,
          status: 'pending' as const,
          title: '编辑代码',
          description: '实现新功能',
          progress: 0,
          metadata: { filePath: 'src/components/NewFeature.tsx' },
        },
      },
    ];

    // 模拟任务执行
    let taskIndex = 0;

    const runNextTask = () => {
      if (taskIndex >= tasks.length) {
        // 所有任务完成
        setTimeout(() => {
          completeGroup(groupId);
        }, 1000);
        return;
      }

      const { groupId, task } = tasks[taskIndex];
      addTask(groupId, task);

      // 获取刚添加的任务 ID
      const currentGroup = useTaskStore.getState().activeGroup;
      const currentTask = currentGroup?.tasks[currentGroup.tasks.length - 1];
      if (!currentTask) return;

      taskIdsRef.current.push(currentTask.id);

      // 更新为运行中
      setTimeout(() => {
        updateTask(groupId, currentTask.id, { status: 'running', progress: 50 });

        // 模拟进度更新
        const progressInterval = setInterval(() => {
          const group = useTaskStore.getState().activeGroup;
          const task = group?.tasks.find((t) => t.id === currentTask.id);
          if (task && task.progress < 100) {
            const newProgress = Math.min(task.progress + 10, 100);
            updateTask(groupId, task.id, { progress: newProgress });
          } else if (task) {
            clearInterval(progressInterval);
            // 标记为完成
            updateTask(groupId, task.id, { status: 'completed', progress: 100 });
            taskIndex++;
            setTimeout(runNextTask, 500);
          }
        }, 200);
      }, 500);
    };

    // 延迟启动演示
    const timeoutId = setTimeout(() => {
      runNextTask();
    }, 2000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [enabled, createGroup, addTask, updateTask, completeGroup]);
}
