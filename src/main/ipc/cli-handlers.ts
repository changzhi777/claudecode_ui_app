import { ipcMain, BrowserWindow } from 'electron';
import { spawn } from 'child_process';
import { CLIProcessPool, PoolConfig } from '../cli/ProcessPool';
import { IPCLogger } from '../utils/IPCLogger';

/**
 * 执行 ClaudeCode CLI 命令的辅助函数
 */
async function executeClaudeCLI(prompt: string): Promise<{
  text: string;
  model: string;
  duration: number;
}> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const claudePath = '/Users/mac/.npm-global/bin/claude';

    const claudeProcess = spawn(claudePath, ['-p', prompt], {
      env: {
        ...process.env,
        PATH: process.env.PATH,
        HOME: process.env.HOME,
      },
    });

    let stdout = '';
    let stderr = '';

    claudeProcess.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    claudeProcess.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    claudeProcess.on('close', (code) => {
      const duration = Date.now() - startTime;

      if (code === 0) {
        const text = stdout.trim();

        // 智能模型检测 - 从响应中提取实际使用的模型
        let model = detectModel(text);

        resolve({
          text,
          model,
          duration,
        });
      } else {
        reject(new Error(`CLI 执行失败 (code ${code}): ${stderr || stdout}`));
      }
    });

    claudeProcess.on('error', (error) => {
      reject(new Error(`CLI 进程错误: ${error.message}`));
    });

    setTimeout(() => {
      claudeProcess.kill();
      reject(new Error('CLI 执行超时'));
    }, 120000);
  });
}

/**
 * 智能模型检测
 * 根据响应内容推断实际使用的 Claude 模型
 */
function detectModel(response: string): string {
  // 检查响应特征
  const lower = response.toLowerCase();

  // Claude Sonnet 4.6 (最新) 特征 - 优先级最高
  if (
    lower.includes('claude sonnet 4.6') ||
    response.includes('claude-sonnet-4-6') ||
    lower.includes('claude 4.6') ||
    response.includes('claude-4-6')
  ) {
    return 'claude-sonnet-4-6';
  }

  // 检测 engineer-professional 输出样式（使用 Claude Sonnet 4.6）
  if (
    lower.includes('engineer-professional') ||
    lower.includes('工程师专业版') ||
    lower.includes('engineer professional')
  ) {
    return 'claude-sonnet-4-6';
  }

  // Claude 3.5 Sonnet 特征
  if (lower.includes('claude 3.5') || response.includes('claude-3.5')) {
    return 'claude-3.5-sonnet';
  }

  // Claude 3 Opus 特征
  if (response.includes('claude-3-opus') || lower.includes('claude 3 opus')) {
    return 'claude-3-opus-20250507';
  }

  // 检查配置文件中的默认模型
  try {
    const configPath = require('os').homedir() + '/.claude/settings.json';
    const fs = require('fs');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      if (config.model) {
        // 返回配置的模型
        return config.model;
      }
    }
  } catch (error) {
    // 忽略配置读取错误
  }

  // 默认返回当前最新模型
  return 'claude-sonnet-4-6';
}

/**
 * IPC 服务器
 *
 * 处理渲染进程的 CLI 相关请求
 */
export class CLIPCHandlers {
  private pool?: CLIProcessPool;
  private logger = IPCLogger.getInstance();
  private claudePath = '/Users/mac/.npm-global/bin/claude'; // ClaudeCode CLI 路径

  constructor() {
    this.registerHandlers();
  }

  /**
   * 注册所有 IPC 处理器
   */
  private registerHandlers(): void {
    // 初始化进程池
    ipcMain.handle('cli:initializePool', async (_event, config: PoolConfig) => {
      try {
        if (this.pool) {
          throw new Error('进程池已初始化');
        }

        this.pool = new CLIProcessPool(config);
        await this.pool.initialize();

        this.logger.info('CLIPCHandlers', '进程池初始化成功');
        return { success: true };
      } catch (error) {
        this.logger.error('CLIPCHandlers', `进程池初始化失败: ${error}`);
        return { success: false, error: (error as Error).message };
      }
    });

    // 获取进程
    ipcMain.handle('cli:acquire', async (event, sessionId: string) => {
      try {
        if (!this.pool) {
          throw new Error('进程池未初始化');
        }

        const handle = await this.pool.acquire(sessionId);

        // 订阅流式数据并发送到渲染进程
        handle.onStreamData((data) => {
          if (!event.sender.isDestroyed()) {
            event.sender.send('cli:streamData', { sessionId, data });
          }
        });

        this.logger.info('CLIPCHandlers', `会话 ${sessionId} 已分配进程`);
        return { success: true, pid: handle.pid };
      } catch (error) {
        this.logger.error('CLIPCHandlers', `获取进程失败: ${error}`);
        return { success: false, error: (error as Error).message };
      }
    });

    // 释放进程
    ipcMain.handle('cli:release', async (_event, sessionId: string) => {
      try {
        if (!this.pool) {
          throw new Error('进程池未初始化');
        }

        this.pool.release(sessionId);
        this.logger.info('CLIPCHandlers', `会话 ${sessionId} 已释放`);
        return { success: true };
      } catch (error) {
        this.logger.error('CLIPCHandlers', `释放进程失败: ${error}`);
        return { success: false, error: (error as Error).message };
      }
    });

    // 发送消息（真实CLI集成）
    ipcMain.handle('cli:sendMessage', async (event, content: string) => {
      try {
        this.logger.info('CLIPCHandlers', `发送消息到 CLI: ${content.substring(0, 50)}...`);

        // 直接调用 ClaudeCode CLI
        const response = await executeClaudeCLI(content);

        return {
          success: true,
          data: {
            response: response.text,
            model: response.model,
            tokens: 0, // CLI 暂时不提供 token 信息
            duration: response.duration,
            timestamp: Date.now()
          }
        };
      } catch (error) {
        this.logger.error('CLIPCHandlers', `CLI 执行失败: ${error}`);
        return {
          success: false,
          error: (error as Error).message,
          data: {
            response: `错误: ${(error as Error).message}`,
            model: 'unknown',
            tokens: 0,
            duration: 0,
            timestamp: Date.now()
          }
        };
      }
    });

    // 发送消息（进程池版本，保留用于向后兼容）
    ipcMain.on('cli:sendMessagePool', async (_event, sessionId: string, content: string) => {
      try {
        if (!this.pool) {
          throw new Error('进程池未初始化');
        }

        const stats = this.pool.getStats();
        const pid = stats.sessionMap[sessionId];

        if (!pid) {
          throw new Error('会话无分配的进程');
        }

        // 获取进程句柄
        const handle = await this.pool.acquire(sessionId);
        await handle.sendMessage(content);

        this.logger.info('CLIPCHandlers', `消息已发送到会话 ${sessionId}`);
      } catch (error) {
        this.logger.error('CLIPCHandlers', `发送消息失败: ${error}`);
        this.sendToRenderer('cli:error', { sessionId, error: (error as Error).message });
      }
    });

    // 获取统计信息
    ipcMain.handle('cli:getStats', async (_event) => {
      try {
        if (!this.pool) {
          throw new Error('进程池未初始化');
        }

        const stats = this.pool.getStats();
        return { success: true, stats };
      } catch (error) {
        this.logger.error('CLIPCHandlers', `获取统计信息失败: ${error}`);
        return { success: false, error: (error as Error).message };
      }
    });

    // 清理进程池
    ipcMain.handle('cli:dispose', async (_event) => {
      try {
        if (!this.pool) {
          return { success: true };
        }

        await this.pool.dispose();
        this.pool = undefined;

        this.logger.info('CLIPCHandlers', '进程池已清理');
        return { success: true };
      } catch (error) {
        this.logger.error('CLIPCHandlers', `清理进程池失败: ${error}`);
        return { success: false, error: (error as Error).message };
      }
    });

    this.logger.info('CLIPCHandlers', 'IPC 处理器已注册');
  }

  /**
   * 发送消息到渲染进程
   */
  private sendToRenderer(channel: string, data: unknown): void {
    const windows = BrowserWindow.getAllWindows();
    windows.forEach(win => {
      if (!win.isDestroyed()) {
        win.webContents.send(channel, data);
      }
    });
  }

  /**
   * 清理资源
   */
  async dispose(): Promise<void> {
    if (this.pool) {
      await this.pool.dispose();
    }
  }
}
