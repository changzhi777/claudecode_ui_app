import { ipcMain } from 'electron';

/**
 * 日志级别
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

/**
 * 日志条目
 */
interface LogEntry {
  level: LogLevel;
  module: string;
  message: string;
  timestamp: number;
}

/**
 * IPC 日志记录器
 *
 * 将主进程日志转发到渲染进程
 */
export class IPCLogger {
  private static instance: IPCLogger;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private constructor() {
    // 监听渲染进程的日志请求
    ipcMain.on('logger:getLogs', (event) => {
      event.reply('logger:logs', this.logs);
    });
  }

  static getInstance(): IPCLogger {
    if (!IPCLogger.instance) {
      IPCLogger.instance = new IPCLogger();
    }
    return IPCLogger.instance;
  }

  /**
   * 记录日志
   */
  private log(level: LogLevel, module: string, message: string): void {
    const entry: LogEntry = {
      level,
      module,
      message,
      timestamp: Date.now()
    };

    this.logs.push(entry);

    // 限制日志数量
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // 发送到渲染进程
    // 注意：这里需要在实际渲染进程存在时才发送
    // 可以在 IPC handlers 中实现
  }

  debug(module: string, message: string): void {
    this.log(LogLevel.DEBUG, module, message);
  }

  info(module: string, message: string): void {
    this.log(LogLevel.INFO, module, message);
  }

  warn(module: string, message: string): void {
    this.log(LogLevel.WARN, module, message);
  }

  error(module: string, message: string): void {
    this.log(LogLevel.ERROR, module, message);
  }

  /**
   * 获取所有日志
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * 清空日志
   */
  clear(): void {
    this.logs = [];
  }
}
