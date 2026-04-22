/**
 * 对话管理服务
 */

import { ipcMain, dialog } from 'electron';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

const CHAT_DIR = path.join(os.homedir(), '.claudecode-ui', 'chats');

/**
 * 初始化对话管理 IPC handlers
 */
export function initChatHandlers() {
  // 确保对话目录存在
  fs.mkdir(CHAT_DIR, { recursive: true }).catch(console.error);

  // 保存对话为 MD 文件
  ipcMain.handle('chat:saveAsMarkdown', async (_event, chatData) => {
    try {
      const { sessionId, title, messages } = chatData;

      // 生成文件名
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      const safeTitle = title.replace(/[^a-zA-Z0-9一-龥]/g, '_').substring(0, 50);
      const filename = `${timestamp}_${safeTitle}.md`;
      const filePath = path.join(CHAT_DIR, filename);

      // 生成 Markdown 内容
      const markdown = generateMarkdown(chatData);

      // 保存文件
      await fs.writeFile(filePath, markdown, 'utf-8');

      return {
        success: true,
        filePath,
        filename
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      };
    }
  });

  // 获取对话历史列表
  ipcMain.handle('chat:getHistory', async () => {
    try {
      const files = await fs.readdir(CHAT_DIR);
      const chats = [];

      for (const file of files) {
        if (file.endsWith('.md')) {
          const filePath = path.join(CHAT_DIR, file);
          const stats = await fs.stat(filePath);
          const content = await fs.readFile(filePath, 'utf-8');

          // 提取元数据
          const titleMatch = content.match(/^# (.+)$/m);
          const title = titleMatch ? titleMatch[1] : file;

          chats.push({
            filename: file,
            filePath,
            title,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime,
            size: stats.size
          });
        }
      }

      // 按修改时间倒序排列
      chats.sort((a, b) => b.modifiedAt - a.modifiedAt);

      return {
        success: true,
        chats
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        chats: []
      };
    }
  });

  // 加载历史对话
  ipcMain.handle('chat:loadHistory', async (_event, filePath) => {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const chatData = parseMarkdown(content);

      return {
        success: true,
        chatData
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      };
    }
  });

  // 删除对话
  ipcMain.handle('chat:delete', async (_event, filePath) => {
    try {
      await fs.unlink(filePath);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      };
    }
  });

  console.log('[ChatHandlers] 对话管理处理器已注册');
}

/**
 * 生成 Markdown 格式的对话内容
 */
function generateMarkdown(chatData: { sessionId: string; title: string; messages: any[] }): string {
  const { sessionId, title, messages } = chatData;

  let markdown = `# ${title}\n\n`;
  markdown += `**会话 ID**: ${sessionId}\n`;
  markdown += `**时间**: ${new Date().toLocaleString('zh-CN')}\n`;
  markdown += `**消息数量**: ${messages.length}\n\n`;
  markdown += `---\n\n`;

  messages.forEach((msg, index) => {
    const role = msg.role === 'user' ? '👤 用户' : '🤖 Claude';
    const time = new Date(msg.timestamp).toLocaleTimeString('zh-CN');

    markdown += `## ${role}\n\n`;
    markdown += `**时间**: ${time}\n\n`;
    markdown += `${msg.content}\n\n`;

    if (msg.metadata) {
      markdown += `> 📊 ${msg.metadata.model} | ${msg.metadata.tokens || 0} tokens | ${msg.metadata.thinkingTime || 0}ms\n\n`;
    }

    markdown += `---\n\n`;
  });

  return markdown;
}

/**
 * 解析 Markdown 文件为对话数据
 */
function parseMarkdown(content: string) {
  const lines = content.split('\n');
  const messages: any[] = [];

  let currentRole: 'user' | 'assistant' | null = null;
  let currentContent = '';
  let currentMetadata: any = null;

  for (const line of lines) {
    // 跳过标题和元数据
    if (line.startsWith('#') || line.startsWith('**') || line.startsWith('---')) {
      continue;
    }

    // 检查角色
    if (line.startsWith('## 👤 用户')) {
      if (currentRole) {
        messages.push({
          role: currentRole,
          content: currentContent.trim(),
          metadata: currentMetadata
        });
      }
      currentRole = 'user';
      currentContent = '';
      currentMetadata = null;
    } else if (line.startsWith('## 🤖 Claude')) {
      if (currentRole) {
        messages.push({
          role: currentRole,
          content: currentContent.trim(),
          metadata: currentMetadata
        });
      }
      currentRole = 'assistant';
      currentContent = '';
      currentMetadata = null;
    } else if (currentRole) {
      currentContent += line + '\n';
    }
  }

  // 添加最后一条消息
  if (currentRole) {
    messages.push({
      role: currentRole,
      content: currentContent.trim(),
      metadata: currentMetadata
    });
  }

  return {
    sessionId: Date.now().toString(),
    title: '历史对话',
    messages
  };
}
