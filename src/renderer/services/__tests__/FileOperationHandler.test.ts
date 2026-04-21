/**
 * FileOperationHandler 单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FileOperationHandler } from '../FileOperationHandler';

describe('FileOperationHandler', () => {
  let handler: FileOperationHandler;

  beforeEach(() => {
    handler = new FileOperationHandler();
  });

  describe('handleStreamData', () => {
    it('应该解析 Read 工具调用', () => {
      const data = {
        type: 'assistant',
        tool_calls: [
          {
            id: 'tool_1',
            name: 'Read',
            status: 'completed',
            input: { file_path: '/path/to/file.ts' },
          },
        ],
      };

      const events = handler.handleStreamData(data as any);

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('read');
      expect(events[0].path).toBe('/path/to/file.ts');
    });

    it('应该解析 Write 工具调用', () => {
      const data = {
        type: 'assistant',
        tool_calls: [
          {
            id: 'tool_2',
            name: 'Write',
            status: 'completed',
            input: { file_path: '/path/to/file.txt' },
          },
        ],
      };

      const events = handler.handleStreamData(data as any);

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('write');
    });

    it('应该解析 Edit 工具调用', () => {
      const data = {
        type: 'assistant',
        tool_calls: [
          {
            id: 'tool_3',
            name: 'Edit',
            status: 'running',
            input: { file_path: '/path/to/file.py' },
          },
        ],
      };

      const events = handler.handleStreamData(data as any);

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('edit');
    });

    it('应该解析影响文件系统的 Bash 命令', () => {
      const data = {
        type: 'assistant',
        tool_calls: [
          {
            id: 'tool_4',
            name: 'Bash',
            status: 'running',
            input: { command: 'git checkout main' },
          },
        ],
      };

      const events = handler.handleStreamData(data as any);

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('bash');
    });

    it('应该忽略 pending 状态的工具调用', () => {
      const data = {
        type: 'assistant',
        tool_calls: [
          {
            id: 'tool_5',
            name: 'Read',
            status: 'pending',
            input: { file_path: '/path/to/file.ts' },
          },
        ],
      };

      const events = handler.handleStreamData(data as any);

      expect(events).toHaveLength(0);
    });

    it('应该忽略没有 input 的工具调用', () => {
      const data = {
        type: 'assistant',
        tool_calls: [
          {
            id: 'tool_6',
            name: 'Read',
            status: 'running',
          },
        ],
      };

      const events = handler.handleStreamData(data as any);

      expect(events).toHaveLength(0);
    });

    it('应该处理多个工具调用', () => {
      const data = {
        type: 'assistant',
        tool_calls: [
          {
            id: 'tool_7',
            name: 'Read',
            status: 'completed',
            input: { file_path: '/file1.ts' },
          },
          {
            id: 'tool_8',
            name: 'Write',
            status: 'completed',
            input: { file_path: '/file2.ts' },
          },
        ],
      };

      const events = handler.handleStreamData(data as any);

      expect(events).toHaveLength(2);
      expect(events[0].type).toBe('read');
      expect(events[1].type).toBe('write');
    });
  });

  describe('isFileAffectingCommand', () => {
    it('应该检测 git 命令', () => {
      const command = 'git checkout main';
      const result = (handler as any).isFileAffectingCommand(command);
      expect(result).toBe(true);
    });

    it('应该检测 npm install 命令', () => {
      const command = 'npm install lodash';
      const result = (handler as any).isFileAffectingCommand(command);
      expect(result).toBe(true);
    });

    it('应该检测文件删除命令', () => {
      const command = 'rm -rf node_modules';
      const result = (handler as any).isFileAffectingCommand(command);
      expect(result).toBe(true);
    });

    it('应该忽略非影响命令', () => {
      const command = 'ls -la';
      const result = (handler as any).isFileAffectingCommand(command);
      expect(result).toBe(false);
    });
  });

  describe('detectLanguage', () => {
    it('应该正确检测 TypeScript 文件', () => {
      const language = (handler as any).detectLanguage('test.ts');
      expect(language).toBe('typescript');
    });

    it('应该正确检测 Python 文件', () => {
      const language = (handler as any).detectLanguage('app.py');
      expect(language).toBe('python');
    });

    it('应该正确检测 JSON 文件', () => {
      const language = (handler as any).detectLanguage('config.json');
      expect(language).toBe('json');
    });

    it('应该对未知文件返回 plaintext', () => {
      const language = (handler as any).detectLanguage('unknown.xyz');
      expect(language).toBe('plaintext');
    });
  });
});
