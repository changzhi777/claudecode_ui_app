/**
 * 真实 ClaudeCode CLI 集成
 */

import { ipcMain } from 'electron';
import { spawn } from 'child_process';

const CLAUDE_PATH = '/Users/mac/.npm-global/bin/claude';

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
    const os = require('os');
    const fs = require('fs');
    const configPath = os.homedir() + '/.claude/settings.json';
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

      // 检测实际使用的模型
      const detectedModel = detectModel(responseText);

      return {
        success: true,
        data: {
          response: responseText,
          model: detectedModel,
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
          model: 'unknown',
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

      // 检测实际使用的模型
      const detectedModel = detectModel(response.text);

      return {
        success: true,
        data: {
          response: response.text,
          model: detectedModel,
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
          model: 'unknown',
          tokens: 0,
          duration: 0,
          timestamp: Date.now()
        }
      };
    }
  });

  console.log('[RealCLI] 真实 CLI 处理器已注册');
}

// 获取可用的斜杠命令列表
ipcMain.handle('cli:getCommands', async () => {
  try {
    const response = await executeClaudeCommand('请列出所有支持的斜杠命令');

    // 解析命令列表（这里简化处理，实际可以更智能地解析）
    const commands = [
      // 核心命令
      {
        command: '/update-config',
        description: '修改 settings.json 配置',
        category: '核心',
        label: '配置',
        hint: '权限、环境变量、钩子'
      },
      {
        command: '/keybindings-help',
        description: '自定义键盘快捷键',
        category: '核心',
        label: '快捷键',
        hint: '查看和自定义键盘绑定'
      },
      {
        command: '/simplify',
        description: '审查并优化代码质量',
        category: '核心',
        label: '简化',
        hint: '代码审查与优化'
      },
      {
        command: '/fewer-permission-prompts',
        description: '减少权限提示',
        category: '核心',
        label: '权限',
        hint: '添加常用操作白名单'
      },
      {
        command: '/loop',
        description: '定期重复执行任务',
        category: '核心',
        label: '循环',
        hint: '监控状态、定期执行'
      },

      // Git 工作流
      {
        command: '/zcf:git-commit',
        description: '自动生成 commit 信息',
        category: 'Git',
        label: '提交',
        hint: 'Conventional Commit'
      },
      {
        command: '/zcf:git-cleanBranches',
        description: '清理已合并分支',
        category: 'Git',
        label: '清理分支',
        hint: '支持 dry-run'
      },
      {
        command: '/zcf:git-rollback',
        description: '交互式回滚版本',
        category: 'Git',
        label: '回滚',
        hint: '安全的历史版本回退'
      },
      {
        command: '/zcf:git-worktree',
        description: '管理 Git worktree',
        category: 'Git',
        label: '工作树',
        hint: '并行开发支持'
      },

      // 开发流程
      {
        command: '/zcf:workflow',
        description: '六阶段开发工作流',
        category: '开发',
        label: '工作流',
        hint: '研究→构思→计划→执行→优化→评审'
      },
      {
        command: '/zcf:feat',
        description: '新功能开发流程',
        category: '开发',
        label: '功能',
        hint: '完整的新功能开发'
      },
      {
        command: '/zcf:init-project',
        description: '初始化项目上下文',
        category: '开发',
        label: '初始化',
        hint: '生成 CLAUDE.md 索引'
      },
      {
        command: '/zcf:bmad-init',
        description: 'BMAD 初始化',
        category: '开发',
        label: 'BMAD',
        hint: '项目初始化模板'
      },

      // 代码审查
      {
        command: '/review',
        description: '审查 Pull Request',
        category: '审查',
        label: '审查',
        hint: 'PR 代码审查'
      },
      {
        command: '/security-review',
        description: '安全审查变更',
        category: '审查',
        label: '安全',
        hint: '安全性检查'
      },

      // AI 与测试
      {
        command: '/claude-api',
        description: 'Claude API 开发调试',
        category: 'AI',
        label: 'API',
        hint: 'Anthropic SDK 调试'
      },
      {
        command: '/codex:setup',
        description: '配置 Codex CLI',
        category: 'AI',
        label: 'Codex',
        hint: '审查门控配置'
      },
      {
        command: '/codex:rescue',
        description: '委托给 Codex',
        category: 'AI',
        label: '救援',
        hint: '调查或修复委托'
      },
      {
        command: '/init',
        description: '初始化 CLAUDE.md',
        category: 'AI',
        label: '文档',
        hint: '项目文档初始化'
      },
      {
        command: '/qmd:qmd',
        description: '搜索 Markdown 知识库',
        category: 'AI',
        label: '知识库',
        hint: '本地 Markdown 搜索'
      },

      // GLM Plan
      {
        command: '/glm-plan-usage:usage-query',
        description: '查询账户使用信息',
        category: 'GLM',
        label: '使用量',
        hint: '账户使用统计'
      },
      {
        command: '/glm-plan-bug:case-feedback',
        description: '提交问题反馈',
        category: 'GLM',
        label: '反馈',
        hint: '问题提交与反馈'
      },
    ];

    return { success: true, commands };
  } catch (error) {
    console.error('[RealCLI] 获取命令失败:', error);
    return { success: false, error: (error as Error).message };
  }
});

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
