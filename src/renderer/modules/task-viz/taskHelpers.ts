import type { Task } from '@shared/types/task';

/**
 * 创建任务并返回任务 ID
 */
export function createTask(
  type: Task['type'],
  title: string,
  _description?: string,
  _metadata?: Task['metadata']
): string {
  const taskId = Math.random().toString(36).substring(2, 9);

  // TODO: 通过 IPC 发送到主进程
  console.log('[Task] Created:', taskId, type, title);

  return taskId;
}

/**
 * 更新任务状态
 */
export function updateTaskStatus(
  taskId: string,
  status: Task['status'],
  progress?: number
): void {
  // TODO: 通过 IPC 发送到主进程
  console.log('[Task] Updated:', taskId, status, progress);
}

/**
 * 完成任务
 */
export function completeTask(taskId: string, result?: string): void {
  // TODO: 通过 IPC 发送到主进程
  console.log('[Task] Completed:', taskId, result);
}

/**
 * 失败任务
 */
export function failTask(taskId: string, error: string): void {
  // TODO: 通过 IPC 发送到主进程
  console.log('[Task] Failed:', taskId, error);
}

/**
 * 创建任务组并返回组 ID
 */
export function createTaskGroup(title: string): string {
  const groupId = Math.random().toString(36).substring(2, 9);

  // TODO: 通过 IPC 发送到主进程
  console.log('[TaskGroup] Created:', groupId, title);

  return groupId;
}

/**
 * 完成任务组
 */
export function completeTaskGroup(groupId: string): void {
  // TODO: 通过 IPC 发送到主进程
  console.log('[TaskGroup] Completed:', groupId);
}
