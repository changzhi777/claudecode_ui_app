export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export type TaskType =
  | 'thinking'
  | 'reading'
  | 'searching'
  | 'editing'
  | 'executing'
  | 'analyzing';

export interface Task {
  id: string;
  type: TaskType;
  status: TaskStatus;
  title: string;
  description?: string;
  progress: number; // 0-100
  startTime: number;
  endTime?: number;
  metadata?: {
    filePath?: string;
    lineNumber?: number;
    command?: string;
    result?: string;
    error?: string;
  };
}

export interface TaskGroup {
  id: string;
  title: string;
  tasks: Task[];
  startTime: number;
  endTime?: number;
}

export interface TaskState {
  activeGroup: TaskGroup | null;
  completedGroups: TaskGroup[];
  isExpanded: boolean;
}

export interface TaskActions {
  createGroup: (title: string) => string;
  addTask: (groupId: string, task: Omit<Task, 'id' | 'startTime'>) => void;
  updateTask: (groupId: string, taskId: string, updates: Partial<Task>) => void;
  completeGroup: (groupId: string) => void;
  clearCompleted: () => void;
  toggleExpanded: () => void;
}
