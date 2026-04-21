import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import { IPCLogger } from '../utils/IPCLogger';

/**
 * CLI 配置
 */
export interface CLIConfig {
  cliPath: string;
  args?: string[];
  cwd?: string;
  env?: Record<string, string>;
}

/**
 * CLI 消息
 */
export interface CLIMessage {
  type: string;
  subtype?: string;
  content?: string;
  [key: string]: unknown;
}

/**
 * 解析后的流式消息
 */
export interface ParsedMessage extends CLIMessage {
  timestamp: number;
}

/**
 * CLI 进程包装器
 *
 * 功能：
 * - 启动/停止 CLI 进程
 * - 双向通信（stdin/stdout）
 * - 流式 JSON 解析
 * - 健康检查
 * - 自动重连
 */
export class CLIProcess extends EventEmitter {
  private process?: ChildProcess;
  private config: CLIConfig;
  private logger = IPCLogger.getInstance();
  private buffer = ''; // JSON 解析缓冲区
  private lastActivity = Date.now(); // 最后活动时间
  private isRunning = false;

  constructor(config: CLIConfig) {
    super();
    this.config = config;
  }

  get pid(): string {
    return this.process?.pid?.toString() || 'unknown';
  }

  /**
   * 启动 CLI 进程
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('CLIProcess', `进程 ${this.pid} 已在运行`);
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        this.process = spawn(this.config.cliPath, this.config.args || [], {
          cwd: this.config.cwd,
          env: { ...process.env, ...this.config.env }
        });

        this.isRunning = true;
        this.lastActivity = Date.now();

        // 监听 stdout（流式 JSON）
        this.process.stdout?.on('data', (chunk: Buffer) => {
          this.handleOutput(chunk);
        });

        // 监听 stderr
        this.process.stderr?.on('data', (chunk: Buffer) => {
          this.logger.error('CLIProcess', `stderr: ${chunk.toString()}`);
        });

        // 监听进程退出
        this.process.on('exit', (code, signal) => {
          this.isRunning = false;
          this.logger.info('CLIProcess', `进程 ${this.pid} 退出: code=${code}, signal=${signal}`);
          this.emit('exit', this.pid);
        });

        // 监听进程错误
        this.process.on('error', (error) => {
          this.isRunning = false;
          this.logger.error('CLIProcess', `进程错误: ${error}`);
          this.emit('error', error);
          reject(error);
        });

        // 等待进程启动
        setTimeout(() => {
          if (this.isRunning) {
            this.logger.info('CLIProcess', `进程 ${this.pid} 已启动`);
            resolve();
          } else {
            reject(new Error('进程启动失败'));
          }
        }, 500);
      } catch (error) {
        this.logger.error('CLIProcess', `启动失败: ${error}`);
        reject(error);
      }
    });
  }

  /**
   * 发送消息到 CLI
   */
  async send(message: CLIMessage): Promise<void> {
    if (!this.process?.stdin || !this.isRunning) {
      throw new Error('进程未运行');
    }

    const json = JSON.stringify(message) + '\n';
    this.process.stdin.write(json);
    this.lastActivity = Date.now();

    this.logger.debug('CLIProcess', `发送消息: ${message.type}`);
  }

  /**
   * 停止进程
   */
  async stop(): Promise<void> {
    if (!this.process || !this.isRunning) {
      return;
    }

    const process = this.process; // 保存引用

    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        // 强制杀死
        process.kill('SIGKILL');
        resolve();
      }, 5000);

      process.once('exit', () => {
        clearTimeout(timer);
        resolve();
      });

      // 优雅退出
      process.kill('SIGTERM');
    });
  }

  /**
   * 健康检查
   */
  isHealthy(): boolean {
    if (!this.isRunning) return false;

    // 检查最后活动时间（超过 5 分钟认为不健康）
    const idleTime = Date.now() - this.lastActivity;
    if (idleTime > 5 * 60 * 1000) {
      return false;
    }

    return true;
  }

  /**
   * 处理输出（流式 JSON 解析）
   */
  private handleOutput(chunk: Buffer): void {
    this.lastActivity = Date.now();

    // 追加到缓冲区
    this.buffer += chunk.toString();

    // 按行分割
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() || ''; // 保留不完整的最后一行

    // 解析每一行
    for (const line of lines) {
      if (!line.trim()) continue;

      try {
        const message: ParsedMessage = JSON.parse(line);
        message.timestamp = Date.now();
        this.emit('data', message);
      } catch (error) {
        this.logger.warn('CLIProcess', `JSON 解析失败: ${line.substring(0, 100)}`);
      }
    }
  }
}
