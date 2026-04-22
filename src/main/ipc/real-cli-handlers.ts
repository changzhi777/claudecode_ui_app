/**
 * 真实 ClaudeCode CLI 集成
 */

import { ipcMain } from 'electron';
import { spawn } from 'child_process';

const CLAUDE_PATH = '/Users/mac/.npm-global/bin/claude';

export function initRealCLIHandlers() {
  // 发送消息到真实的 ClaudeCode CLI
  ipcMain.handle('cli:sendMessageReal', async (event, message: string) => {
    console.log('[RealCLI] 收到消息:', message.substring(0, 50));

    try {
      const response = await executeClaudeCommand(message);

      return {
        success: true,
        data: {
          response: response.text,
          model: 'claude-3.5-sonnet',
          tokens: 0,
          duration: response.duration,
          timestamp: Date.now()
        }
      };
    } catch (error) {
      console.error('[RealCLI] 执行失败:', error);

      return {
        success: false,
        error: (error as Error).message,
        data: {
          response: `错误: ${(error as Error).message}`,
          model: 'claude-3.5-sonnet',
          tokens: 0,
          duration: 0,
          timestamp: Date.now()
        }
      };
    }
  });

  console.log('[RealCLI] 真实 CLI 处理器已注册');
}

/**
 * 执行 ClaudeCode CLI 命令
 */
async function executeClaudeCommand(prompt: string): Promise<{
  text: string;
  duration: number;
}> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const claudeProcess = spawn(CLAUDE_PATH, ['-p', prompt], {
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
      console.log('[RealCLI] CLI 执行完成，耗时:', duration, 'ms');

      if (code === 0) {
        resolve({
          text: stdout.trim(),
          duration,
        });
      } else {
        reject(new Error(`CLI 执行失败 (code ${code}): ${stderr || stdout}`));
      }
    });

    claudeProcess.on('error', (error) => {
      reject(new Error(`CLI 进程错误: ${error.message}`));
    });

    // 设置超时（120秒）
    setTimeout(() => {
      claudeProcess.kill();
      reject(new Error('CLI 执行超时'));
    }, 120000);
  });
}
