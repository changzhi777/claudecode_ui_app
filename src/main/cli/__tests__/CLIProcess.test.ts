/**
 * CLIProcess 单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { spawn } from 'child_process';
import { CLIProcess } from '../CLIProcess';
import { EventEmitter } from 'events';
import type { ChildProcess } from 'child_process';

// Mock child_process
vi.mock('child_process', async (importOriginal) => {
  const actual = await importOriginal<typeof import('child_process')>();
  return {
    ...actual,
    spawn: vi.fn(),
  };
});

describe('CLIProcess', () => {
  let process: CLIProcess;
  let mockChildProcess: Partial<ChildProcess>;
  let mockStdout: EventEmitter & { data: string[] };
  let mockStderr: EventEmitter & { data: string[] };

  const mockConfig = {
    cliPath: '/usr/bin/claude',
    args: ['--print', '--input-format', 'stream-json'],
  };

  beforeEach(() => {
    // 清除之前的mock
    vi.clearAllMocks();

    // 创建模拟的stdout和stderr
    mockStdout = {
      data: [],
      on: vi.fn(function(this: typeof mockStdout, event: string, callback: (chunk: Buffer) => void) {
        if (event === 'data') {
          // 模拟立即发送一些JSON数据
          setTimeout(() => {
            const testMessage = JSON.stringify({
              type: 'assistant',
              content: 'Hello',
              timestamp: Date.now(),
            }) + '\n';
            callback(Buffer.from(testMessage));
          }, 10);
        }
      }),
    } as unknown as EventEmitter & { data: string[] };

    mockStderr = {
      data: [],
      on: vi.fn(),
    } as unknown as EventEmitter & { data: string[] };

    // 创建模拟的ChildProcess
    mockChildProcess = {
      pid: 12345,
      stdin: {
        write: vi.fn(),
      },
      stdout: mockStdout,
      stderr: mockStderr,
      on: vi.fn(),
      kill: vi.fn(),
    };

    // Mock spawn返回模拟进程
    vi.mocked(spawn).mockReturnValue(mockChildProcess as any);

    process = new CLIProcess(mockConfig);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('start', () => {
    it('应该启动CLI进程', async () => {
      await process.start();

      expect(spawn).toHaveBeenCalledWith(
        mockConfig.cliPath,
        mockConfig.args,
        expect.objectContaining({
          env: expect.any(Object),
        })
      );
    });

    it('启动后应该设置isRunning为true', async () => {
      expect(process['isRunning']).toBe(false);

      await process.start();

      expect(process['isRunning']).toBe(true);
    });

    it('应该返回进程PID', async () => {
      await process.start();

      expect(process.pid).toBe('12345');
    });

    it('应该监听stdout数据', async () => {
      await process.start();

      expect(mockStdout.on).toHaveBeenCalledWith(
        'data',
        expect.any(Function)
      );
    });

    it('应该监听stderr数据', async () => {
      await process.start();

      expect(mockStderr.on).toHaveBeenCalledWith(
        'data',
        expect.any(Function)
      );
    });

    it('应该监听进程退出', async () => {
      await process.start();

      expect(mockChildProcess.on).toHaveBeenCalledWith(
        'exit',
        expect.any(Function)
      );
    });

    it('应该监听进程错误', async () => {
      await process.start();

      expect(mockChildProcess.on).toHaveBeenCalledWith(
        'error',
        expect.any(Function)
      );
    });

    it('重复启动应该不报错', async () => {
      await process.start();

      await expect(process.start()).resolves.toBeUndefined();
    });

    it('spawn失败应该reject', async () => {
      // 先清除之前的mock
      vi.mocked(spawn).mockReset();
      // 设置为抛出错误
      vi.mocked(spawn).mockImplementation(() => {
        throw new Error('spawn failed');
      });

      const newProcess = new CLIProcess(mockConfig);

      await expect(newProcess.start()).rejects.toThrow('spawn failed');

      // 恢复mock
      vi.mocked(spawn).mockReset();
      vi.mocked(spawn).mockReturnValue(mockChildProcess as any);
    });
  });

  describe('send', () => {
    beforeEach(async () => {
      await process.start();
    });

    it('应该发送JSON消息到stdin', async () => {
      const message = {
        type: 'user_message',
        content: 'Hello',
        timestamp: Date.now(),
      };

      await process.send(message);

      const expectedJson = JSON.stringify(message) + '\n';
      expect(mockChildProcess.stdin?.write).toHaveBeenCalledWith(expectedJson);
    });

    it('应该更新最后活动时间', async () => {
      const beforeTime = process['lastActivity'];

      await new Promise(resolve => setTimeout(resolve, 10));

      await process.send({ type: 'test' } as any);

      expect(process['lastActivity']).toBeGreaterThan(beforeTime);
    });

    it('进程未运行时应该抛出错误', async () => {
      const stoppedProcess = new CLIProcess(mockConfig);

      await expect(
        stoppedProcess.send({ type: 'test' } as any)
      ).rejects.toThrow('进程未运行');
    });
  });

  describe('stop', () => {
    beforeEach(async () => {
      await process.start();
    });

    it('应该发送SIGTERM信号', async () => {
      await process.stop();

      expect(mockChildProcess.kill).toHaveBeenCalledWith('SIGTERM');
    });

    it('应该设置isRunning为false', async () => {
      await process.stop();

      expect(process['isRunning']).toBe(false);
    });

    it('进程未运行应该直接返回', async () => {
      await process.stop();

      await expect(process.stop()).resolves.toBeUndefined();
    });
  });

  describe('isHealthy', () => {
    it('进程未运行应该返回false', () => {
      expect(process.isHealthy()).toBe(false);
    });

    it('进程运行中应该返回true', async () => {
      await process.start();

      expect(process.isHealthy()).toBe(true);
    });

    it('活动超时应该返回false', async () => {
      await process.start();

      // 设置最后活动时间为6分钟前
      process['lastActivity'] = Date.now() - 6 * 60 * 1000;

      expect(process.isHealthy()).toBe(false);
    });
  });

  describe('事件', () => {
    it('收到stdout数据应该触发data事件', async () => {
      const dataSpy = vi.fn();
      process.on('data', dataSpy);

      await process.start();

      // 等待模拟数据到达
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(dataSpy).toHaveBeenCalled();
      const receivedData = dataSpy.mock.calls[0][0];
      expect(receivedData).toHaveProperty('type');
      expect(receivedData).toHaveProperty('timestamp');
    });

    it('收到stderr数据应该触发error事件', async () => {
      // 手动触发stderr回调
      await process.start();

      const errorSpy = vi.fn();
      process.on('error', errorSpy);

      // 获取stderr的data回调
      const stderrCallback = vi.mocked(mockStderr.on).mock.calls.find(
        call => call[0] === 'data'
      )?.[1];

      if (stderrCallback) {
        stderrCallback(Buffer.from('Error message'));
      }

      expect(errorSpy).toHaveBeenCalled();
    });

    it('进程退出应该触发exit事件', async () => {
      await process.start();

      const exitSpy = vi.fn();
      process.on('exit', exitSpy);

      // 获取exit回调
      const exitCallback = vi.mocked(mockChildProcess.on).mock.calls.find(
        call => call[0] === 'exit'
      )?.[1];

      if (exitCallback) {
        exitCallback(0, null);
      }

      expect(exitSpy).toHaveBeenCalledWith('12345');
      expect(process['isRunning']).toBe(false);
    });

    it('进程错误应该触发error事件', async () => {
      await process.start();

      const errorSpy = vi.fn();
      process.on('error', errorSpy);

      // 获取error回调
      const errorCallback = vi.mocked(mockChildProcess.on).mock.calls.find(
        call => call[0] === 'error'
      )?.[1];

      if (errorCallback) {
        errorCallback(new Error('Process error'));
      }

      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('JSON解析', () => {
    it('应该正确解析JSON消息', async () => {
      const dataSpy = vi.fn();
      process.on('data', dataSpy);

      await process.start();

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(dataSpy).toHaveBeenCalled();
      const message = dataSpy.mock.calls[0][0];
      expect(message.type).toBe('assistant');
      expect(message.content).toBe('Hello');
    });

    it('应该忽略空行', async () => {
      // 创建一个发送空行的进程
      const customStdout = {
        on: vi.fn(function(this: typeof customStdout, event: string, callback: (chunk: Buffer) => void) {
          if (event === 'data') {
            setTimeout(() => {
              // 发送空行
              callback(Buffer.from('\n\n'));
              // 发送有效JSON
              callback(Buffer.from('{"type":"test"}\n'));
            }, 10);
          }
        }),
      };

      const customMockProcess = {
        pid: 12346,
        stdin: {
          write: vi.fn(),
        },
        stdout: customStdout as any,
        stderr: mockStderr,
        on: vi.fn(),
        kill: vi.fn(),
      };

      // Mock spawn返回自定义进程
      vi.mocked(spawn).mockReturnValue(customMockProcess as any);

      const newProcess = new CLIProcess(mockConfig);
      const dataSpy = vi.fn();
      newProcess.on('data', dataSpy);

      await newProcess.start();

      await new Promise(resolve => setTimeout(resolve, 50));

      // 应该只收到1条有效消息
      expect(dataSpy).toHaveBeenCalledTimes(1);
    });
  });
});
