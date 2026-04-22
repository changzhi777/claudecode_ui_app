/**
 * 性能监控IPC处理器
 */

import { ipcHandler } from './IPCUtils';
import { performance } from 'perf_hooks';
import { cpus } from 'os';

let appStartTime: number = 0;
let messageCount: number = 0;
let activeWorkersCount: number = 0;

export function initPerformanceHandlers() {
  // 记录应用启动时间
  appStartTime = performance.now();

  // 获取性能指标
  ipcHandler<PerformanceMetrics>('performance:get-metrics', async () => {
    const memoryUsage = process.memoryUsage();
    const cpusInfo = cpus();

    // 计算CPU使用率
    const cpuUsage = process.cpuUsage();
    const totalCpuUsage = cpusInfo.reduce((acc, cpu) => {
      return acc + cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.irq;
    }, 0);

    const metrics: PerformanceMetrics = {
      startupTime: Math.round(appStartTime),
      responseTime: Math.round(Math.random() * 50 + 20), // 模拟响应时间
      memoryUsage: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      cpuUsage: Math.min(100, Math.round((totalCpuUsage / cpusInfo.length) / 10)),
      activeWorkers: activeWorkersCount,
      messageCount
    };

    return metrics;
  });

  // 更新活跃 worker 数量
  ipcHandler('performance:update-workers', async (_event, count: number) => {
    activeWorkersCount = count;
    return { success: true };
  });

  // 增加消息计数
  ipcHandler('performance:increment-messages', async () => {
    messageCount++;
  });

  // 重置统计
  ipcHandler('performance:reset', async () => {
    messageCount = 0;
    appStartTime = performance.now();
    return { success: true };
  });
}

interface PerformanceMetrics {
  startupTime: number;
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  activeWorkers: number;
  messageCount: number;
}
