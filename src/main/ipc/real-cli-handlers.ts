/**
 * 真实 ClaudeCode CLI 集成
 */

import { ipcMain } from 'electron';
import { spawn } from 'child_process';

const CLAUDE_PATH = '/Users/mac/.npm-global/bin/claude';

export function initRealCLIHandlers() {
  // 处理斜杠命令（如 /help, /clear 等）
  ipcMain.handle('cli:sendCommand', async (event, command: string) => {
    console.log('[RealCLI] 收到命令:', command);

    try {
      let responseText: string;

      // 处理内置命令
      if (command.startsWith('/')) {
        responseText = await handleBuiltInCommand(command);
      } else {
        // 发送到 ClaudeCode CLI
        const response = await executeClaudeCommand(command);
        responseText = response.text;
      }

      return {
        success: true,
        data: {
          response: responseText,
          model: 'claude-3.5-sonnet',
          tokens: 0,
          duration: 0,
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
 * 处理内置命令
 */
async function handleBuiltInCommand(command: string): Promise<string> {
  const cmd = command.toLowerCase().trim();

  switch (cmd) {
    case '/help':
    case '/?':
      return `
📖 ClaudeCode UI 命令帮助

斜杠命令：
/help, /? - 显示此帮助
/clear - 清空当前对话
/save - 保存当前对话
/new - 新建对话
/exit - 退出应用

快捷键：
Cmd+N - 新建对话
Cmd+S - 保存对话
Cmd+T - 切换主题
Cmd+K - 切换视图
F11 - 全屏切换

提示：你可以像平常一样与 Claude 对话，它会理解你的问题！
`;

    case '/clear':
      // 清空对话的命令
      return `✅ 对话已清空`;

    case '/save':
      return `💾 使用 Cmd+S 快捷键保存对话`;

    case '/new':
      return `🆕 使用 Cmd+N 快捷键新建对话`;

    case '/exit':
      // 可以触发退出
      return `👋 感谢使用 ClaudeCode UI！`;

    default:
      return `❌ 未知命令: ${command}
输入 /help 查看可用命令`;
  }
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
