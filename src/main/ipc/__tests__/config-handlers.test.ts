/**
 * ConfigHandlers 单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { ConfigHandlers } from '../config-handlers';

// Mock fs 模块
vi.mock('fs');
vi.mock('toml', () => ({
  default: {
    parse: vi.fn((content: string) => {
      if (content.includes('models.toml')) {
        return {
          models: [
            {
              pattern: 'opus',
              display_name: 'Opus',
              context_limit: 200000,
            },
          ],
        };
      }
      return {};
    }),
  },
}));

describe('ConfigHandlers', () => {
  let configHandlers: ConfigHandlers;

  beforeEach(() => {
    configHandlers = new ConfigHandlers();
    vi.clearAllMocks();
  });

  describe('readClaudeConfig', () => {
    it('应该成功读取配置文件', () => {
      const mockConfig = {
        $schema: 'https://json.schemastore.org/claude-code-settings.json',
        env: {
          ANTHROPIC_AUTH_TOKEN: 'test-token',
          ANTHROPIC_BASE_URL: 'https://api.anthropic.com',
        },
        permissions: {
          allow: ['Bash', 'Read', 'Write'],
          deny: [],
        },
        enabledPlugins: {
          'test-plugin': true,
        },
        outputStyle: 'engineer-professional',
      };

      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(mockConfig));

      const result = (configHandlers as any).readClaudeConfig();

      expect(result.apiToken).toBe('test-token');
      expect(result.baseUrl).toBe('https://api.anthropic.com');
      expect(result.permissions?.allow).toEqual(['Bash', 'Read', 'Write']);
      expect(result.enabledPlugins).toEqual({ 'test-plugin': true });
      expect(result.outputStyle).toBe('engineer-professional');
    });

    it('应该在配置文件不存在时返回空对象', () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(false);

      const result = (configHandlers as any).readClaudeConfig();

      expect(result).toEqual({});
    });

    it('应该处理读取错误', () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.spyOn(fs, 'readFileSync').mockImplementation(() => {
        throw new Error('Read error');
      });

      const result = (configHandlers as any).readClaudeConfig();

      expect(result).toEqual({});
    });
  });

  describe('getApiKey', () => {
    it('应该脱敏 API Key', async () => {
      const mockConfig = {
        env: {
          ANTHROPIC_AUTH_TOKEN: 'sk-ant-api03-1234567890abcdef',
        },
      };

      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(mockConfig));

      const result = await (configHandlers as any).getApiKey();

      expect(result.key).toBe('sk-ant-api03-1234567890abcdef');
      expect(result.masked).toMatch(/^sk-ant-\*{8,}cdef$/);
    });

    it('应该处理短 Key', async () => {
      const mockConfig = {
        env: {
          ANTHROPIC_AUTH_TOKEN: 'short',
        },
      };

      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(mockConfig));

      const result = await (configHandlers as any).getApiKey();

      expect(result.masked).toBe('****');
    });

    it('应该处理未配置的 Key', async () => {
      const mockConfig = {
        env: {},
      };

      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(mockConfig));

      const result = await (configHandlers as any).getApiKey();

      expect(result.key).toBe('');
      expect(result.masked).toBe('未配置');
    });
  });

  describe('getCurrentModel', () => {
    it('应该从环境变量读取模型', async () => {
      const mockConfig = {
        env: {
          MODEL: 'claude-opus-4-20250514',
        },
      };

      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(mockConfig));

      const result = await (configHandlers as any).getCurrentModel();

      expect(result).toBe('claude-opus-4-20250514');
    });

    it('应该返回默认模型', async () => {
      const mockConfig = {
        env: {},
      };

      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(mockConfig));

      const result = await (configHandlers as any).getCurrentModel();

      expect(result).toBe('claude-sonnet-4-20250514');
    });
  });
});
