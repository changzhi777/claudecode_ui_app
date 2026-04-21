import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, TaskGroup, TaskState, TaskActions } from '@shared/types/task';

const generateId = () => Math.random().toString(36).substring(2, 9);

const getTaskIcon = (type: Task['type']) => {
  const icons = {
    thinking: '🤔',
    reading: '📖',
    searching: '🔍',
    editing: '✏️',
    executing: '⚡',
    analyzing: '🔬',
  };
  return icons[type];
};

const getTaskColor = (type: Task['type']) => {
  const colors = {
    thinking: '#dfa88f', // 暖桃色
    reading: '#9fbbe0', // 软蓝
    searching: '#9fc9a2', // 鼠尾草绿
    editing: '#c0a8dd', // 淡紫
    executing: '#f54e00', // 橙色
    analyzing: '#3898ec', // 蓝色
  };
  return colors[type];
};

export const useTaskStore = create<TaskState & TaskActions>()(
  persist(
    (set) => ({
      activeGroup: null,
      completedGroups: [],
      isExpanded: true,

      createGroup: (title: string) => {
        const newGroup: TaskGroup = {
          id: generateId(),
          title,
          tasks: [],
          startTime: Date.now(),
        };

        set({ activeGroup: newGroup });
        return newGroup.id;
      },

      addTask: (groupId: string, task: Omit<Task, 'id' | 'startTime'>) => {
        const newTask: Task = {
          ...task,
          id: generateId(),
          startTime: Date.now(),
        };

        set((state) => {
          if (state.activeGroup?.id === groupId) {
            return {
              activeGroup: {
                ...state.activeGroup,
                tasks: [...state.activeGroup.tasks, newTask],
              },
            };
          }
          return state;
        });
      },

      updateTask: (groupId: string, taskId: string, updates: Partial<Task>) => {
        set((state) => {
          if (state.activeGroup?.id === groupId) {
            return {
              activeGroup: {
                ...state.activeGroup,
                tasks: state.activeGroup.tasks.map((task) =>
                  task.id === taskId ? { ...task, ...updates } : task
                ),
              },
            };
          }
          return state;
        });
      },

      completeGroup: (groupId: string) => {
        set((state) => {
          if (state.activeGroup?.id === groupId) {
            const completedGroup = {
              ...state.activeGroup,
              endTime: Date.now(),
            };
            return {
              activeGroup: null,
              completedGroups: [completedGroup, ...state.completedGroups].slice(0, 50), // 保留最近 50 个
            };
          }
          return state;
        });
      },

      clearCompleted: () => {
        set({ completedGroups: [] });
      },

      toggleExpanded: () => {
        set((state) => ({ isExpanded: !state.isExpanded }));
      },
    }),
    {
      name: 'claudecode-ui-tasks',
    }
  )
);

export { getTaskIcon, getTaskColor };
