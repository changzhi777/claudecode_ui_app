import { EventEmitter } from 'events';
import { CLIProcess } from './CLIProcess';
import { IPCLogger } from '../utils/IPCLogger';

/**
 * 进程池配置
 */
export interface PoolConfig {
  size: number;              // 进程池大小（默认 3）
  cliPath: string;           // CLI 可执行文件路径
  maxIdleTime: number;       // 最大空闲时间（毫秒，默认 5 分钟）
  healthCheckInterval: number; // 健康检查间隔（毫秒，默认 30 秒）
}

/**
 * 进程统计信息
 */
export interface PoolStats {
  total: number;             // 总进程数
  active: number;            // 活跃进程数
  idle: number;              // 空闲进程数
  sessionMap: Record<string, string>; // 会话 ID -> 进程 PID 映射
}

/**
 * CLI 进程句柄
 */
export interface CLIProcessHandle {
  pid: string;
  sessionId: string;
  sendMessage(content: string): Promise<void>;
  onStreamData(callback: (data: CLIMessage) => void): void;
  dispose(): Promise<void>;
}

/**
 * CLI 消息类型
 */
export interface CLIMessage {
  type: 'system' | 'assistant' | 'result' | 'error';
  subtype?: string;
  content?: string;
  sessionId: string;
  timestamp: number;
  [key: string]: unknown;
}

/**
 * CLI 进程池管理器
 *
 * 功能：
 * - 预创建 CLI 进程池
 * - 按会话分配进程
 * - 进程健康检查和重启
 * - 空闲进程自动清理
 */
export class CLIProcessPool extends EventEmitter {
  private processes: Map<string, CLIProcess> = new Map(); // pid -> process
  private sessionMap: Map<string, string> = new Map(); // sessionId -> pid
  private idleProcesses: Set<string> = new Set(); // 空闲进程 PID
  private config: PoolConfig;
  private healthCheckTimer?: NodeJS.Timeout;
  private logger = IPCLogger.getInstance();

  constructor(config: PoolConfig) {
    super();
    this.config = { ...config };
    if (!this.config.size) this.config.size = 3;
    if (!this.config.maxIdleTime) this.config.maxIdleTime = 5 * 60 * 1000;
    if (!this.config.healthCheckInterval) this.config.healthCheckInterval = 30 * 1000;
  }

  /**
   * 初始化进程池
   */
  async initialize(): Promise<void> {
    this.logger.info('ProcessPool', '初始化 CLI 进程池...');

    try {
      // 预创建进程池
      for (let i = 0; i < this.config.size; i++) {
        const process = await this.spawnProcess();
        this.processes.set(process.pid, process);
        this.idleProcesses.add(process.pid);
        this.logger.info('ProcessPool', `进程 ${process.pid} 已创建`);
      }

      // 启动健康检查
      this.startHealthCheck();

      this.logger.info('ProcessPool', `进程池初始化完成，共 ${this.processes.size} 个进程`);
      this.emit('initialized', this.getStats());
    } catch (error) {
      this.logger.error('ProcessPool', `初始化失败: ${error}`);
      throw error;
    }
  }

  /**
   * 获取进程（用于会话）
   */
  async acquire(sessionId: string): Promise<CLIProcessHandle> {
    // 检查会话是否已有进程
    const existingPid = this.sessionMap.get(sessionId);
    if (existingPid) {
      const process = this.processes.get(existingPid);
      if (process && process.isHealthy()) {
        this.logger.info('ProcessPool', `会话 ${sessionId} 复用进程 ${existingPid}`);
        return this.createHandle(process, sessionId);
      }
    }

    // 获取空闲进程
    let pid = this.idleProcesses.values().next().value;

    // 如果无空闲进程，创建新进程
    if (!pid) {
      this.logger.info('ProcessPool', '进程池已满，创建新进程');
      const process = await this.spawnProcess();
      pid = process.pid;
      this.processes.set(pid, process);
    }

    // 分配进程
    this.idleProcesses.delete(pid);
    this.sessionMap.set(sessionId, pid);

    const process = this.processes.get(pid)!;
    this.logger.info('ProcessPool', `会话 ${sessionId} 分配进程 ${pid}`);

    return this.createHandle(process, sessionId);
  }

  /**
   * 释放进程
   */
  release(sessionId: string): void {
    const pid = this.sessionMap.get(sessionId);
    if (!pid) return;

    this.sessionMap.delete(sessionId);
    this.idleProcesses.add(pid);

    this.logger.info('ProcessPool', `会话 ${sessionId} 释放进程 ${pid}`);
    this.emit('released', { sessionId, pid });
  }

  /**
   * 终止会话进程
   */
  async terminate(sessionId: string): Promise<void> {
    const pid = this.sessionMap.get(sessionId);
    if (!pid) return;

    const process = this.processes.get(pid);
    if (process) {
      await process.stop();
      this.processes.delete(pid);
      this.idleProcesses.delete(pid);
    }

    this.sessionMap.delete(sessionId);
    this.logger.info('ProcessPool', `会话 ${sessionId} 进程 ${pid} 已终止`);
  }

  /**
   * 获取统计信息
   */
  getStats(): PoolStats {
    return {
      total: this.processes.size,
      active: this.sessionMap.size,
      idle: this.idleProcesses.size,
      sessionMap: Object.fromEntries(this.sessionMap)
    };
  }

  /**
   * 清理进程池
   */
  async dispose(): Promise<void> {
    this.logger.info('ProcessPool', '清理进程池...');

    // 停止健康检查
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }

    // 停止所有进程
    const promises = Array.from(this.processes.values()).map(p => p.stop());
    await Promise.all(promises);

    this.processes.clear();
    this.sessionMap.clear();
    this.idleProcesses.clear();

    this.logger.info('ProcessPool', '进程池已清理');
    this.emit('disposed');
  }

  /**
   * 创建新进程
   */
  private async spawnProcess(): Promise<CLIProcess> {
    const process = new CLIProcess({
      cliPath: this.config.cliPath,
      args: [
        '-p',
        '--input-format=stream-json',
        '--output-format=stream-json',
        '--verbose'
      ]
    });

    await process.start();

    // 监听进程退出
    process.on('exit', (pid) => {
      this.logger.warn('ProcessPool', `进程 ${pid} 意外退出`);
      this.processes.delete(pid);
      this.idleProcesses.delete(pid);

      // 清理会话映射
      for (const [sessionId, sessionPid] of this.sessionMap.entries()) {
        if (sessionPid === pid) {
          this.sessionMap.delete(sessionId);
        }
      }
    });

    return process;
  }

  /**
   * 创建进程句柄
   */
  private createHandle(process: CLIProcess, sessionId: string): CLIProcessHandle {
    return {
      pid: process.pid,
      sessionId,
      sendMessage: async (content: string) => {
        await process.send({
          type: 'user_message',
          content,
          sessionId,
          timestamp: Date.now()
        });
      },
      onStreamData: (callback: (data: CLIMessage) => void) => {
        process.on('data', (data) => {
          callback({ ...data, sessionId });
        });
      },
      dispose: async () => {
        this.release(sessionId);
      }
    };
  }

  /**
   * 启动健康检查
   */
  private startHealthCheck(): void {
    this.healthCheckTimer = setInterval(() => {
      this.healthCheck();
    }, this.config.healthCheckInterval);
  }

  /**
   * 健康检查
   */
  private healthCheck(): void {
    for (const [pid, process] of this.processes.entries()) {
      if (!process.isHealthy()) {
        this.logger.warn('ProcessPool', `进程 ${pid} 不健康，尝试重启`);

        // 移除不健康的进程
        this.processes.delete(pid);
        this.idleProcesses.delete(pid);

        // 重启进程
        this.spawnProcess().then(newProcess => {
          this.processes.set(newProcess.pid, newProcess);
          this.idleProcesses.add(newProcess.pid);
          this.logger.info('ProcessPool', `进程已重启: ${newProcess.pid}`);
        }).catch(error => {
          this.logger.error('ProcessPool', `进程重启失败: ${error}`);
        });
      }
    }
  }
}
