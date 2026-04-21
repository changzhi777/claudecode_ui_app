/**
 * 配置读取 IPC 处理器
 * 读取 Claude CLI 的配置信息
 */

import { ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as toml from 'toml';

export interface ClaudeConfig {
  apiToken?: string;
  baseUrl?: string;
  model?: string;
  permissions?: {
    allow: string[];
    deny: string[];
  };
  enabledPlugins?: Record<string, boolean>;
  outputStyle?: string;
  environment?: Record<string, string>;
}

export interface ModelConfig {
  models?: Array<{
    pattern: string;
    display_name: string;
    context_limit: number;
  }>;
  context_modifiers?: Array<{
    pattern: string;
    display_suffix: string;
    context_limit: number;
  }>;
}

const CLAUDE_CONFIG_PATH = path.join(os.homedir(), '.claude', 'settings.json');
const CLAUDE_MODELS_PATH = path.join(os.homedir(), '.claude', 'ccline', 'models.toml');

export class ConfigHandlers {
  constructor() {
    this.registerHandlers();
  }

  private registerHandlers(): void {
    // 读取 Claude 配置
    ipcMain.handle('config:readClaude', async () => {
      return this.readClaudeConfig();
    });

    // 读取模型配置
    ipcMain.handle('config:readModels', async () => {
      return this.readModelsConfig();
    });

    // 读取完整配置
    ipcMain.handle('config:readAll', async () => {
      const [claude, models] = await Promise.all([
        this.readClaudeConfig(),
        this.readModelsConfig(),
      ]);
      return { claude, models };
    });

    // 获取当前模型
    ipcMain.handle('config:getCurrentModel', async () => {
      return this.getCurrentModel();
    });

    // 获取 API Key（脱敏）
    ipcMain.handle('config:getApiKey', async () => {
      return this.getApiKey();
    });
  }

  /**
   * 读取 Claude 配置
   */
  private async readClaudeConfig(): Promise<ClaudeConfig> {
    try {
      if (!fs.existsSync(CLAUDE_CONFIG_PATH)) {
        return {};
      }

      const content = fs.readFileSync(CLAUDE_CONFIG_PATH, 'utf-8');
      const config = JSON.parse(content);

      return {
        apiToken: config.env?.ANTHROPIC_AUTH_TOKEN,
        baseUrl: config.env?.ANTHROPIC_BASE_URL,
        permissions: config.permissions,
        enabledPlugins: config.enabledPlugins,
        outputStyle: config.outputStyle,
        environment: config.env,
      };
    } catch (error) {
      console.error('[ConfigHandlers] 读取 Claude 配置失败:', error);
      return {};
    }
  }

  /**
   * 读取模型配置
   */
  private async readModelsConfig(): Promise<ModelConfig> {
    try {
      if (!fs.existsSync(CLAUDE_MODELS_PATH)) {
        return {};
      }

      const content = fs.readFileSync(CLAUDE_MODELS_PATH, 'utf-8');
      const config = toml.parse(content);

      return {
        models: config.models || [],
        context_modifiers: config.context_modifiers || [],
      };
    } catch (error) {
      console.error('[ConfigHandlers] 读取模型配置失败:', error);
      return {};
    }
  }

  /**
   * 获取当前模型
   */
  private async getCurrentModel(): Promise<string> {
    try {
      // 从环境变量或配置文件读取
      const config = await this.readClaudeConfig();
      return config.environment?.MODEL || 'claude-sonnet-4-20250514';
    } catch (error) {
      return 'claude-sonnet-4-20250514';
    }
  }

  /**
   * 获取 API Key（脱敏）
   */
  private async getApiKey(): Promise<{ key: string; masked: string }> {
    try {
      const config = await this.readClaudeConfig();
      const key = config.apiToken || '';

      // 脱敏显示：只显示前8位和后4位
      const masked =
        key.length > 12
          ? `${key.substring(0, 8)}${'*'.repeat(key.length - 12)}${key.substring(key.length - 4)}`
          : '****';

      return { key, masked };
    } catch (error) {
      return { key: '', masked: '未配置' };
    }
  }

  /**
   * 清理处理器
   */
  dispose(): void {
    ipcMain.removeHandler('config:readClaude');
    ipcMain.removeHandler('config:readModels');
    ipcMain.removeHandler('config:readAll');
    ipcMain.removeHandler('config:getCurrentModel');
    ipcMain.removeHandler('config:getApiKey');
  }
}
