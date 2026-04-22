/**
 * WorkerManager 单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WorkerManager } from '../WorkerManager';

// Mock Worker
class MockWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((error: ErrorEvent) => void) | null = null;

  postMessage = vi.fn();
  terminate = vi.fn();

  constructor() {
    // 模拟异步初始化
    setTimeout(() => {
      if (this.onmessage) {
        this.onmessage(new MessageEvent('message', {
          data: { type: 'INITIALIZED', payload: { sessionId: 'test-session' } },
        }));
      }
    }, 10);
  }

  // 模拟发送消息到Worker
  simulateMessage(type: string, payload: unknown) {
    if (this.onmessage) {
      this.onmessage(
        new MessageEvent('message', {
          data: { type, payload },
        })
      );
    }
  }
}

// Mock Worker构造函数
global.Worker = vi.fn((url: string) => new MockWorker()) as any;

describe('WorkerManager', () => {
  let manager: WorkerManager;
  let mockElectronAPI: any;

  beforeEach(() => {
    // Mock electronAPI
    mockElectronAPI = {
      on: vi.fn(),
      send: vi.fn(),
      removeListener: vi.fn(),
      onMessage: vi.fn(),
    };

    global.window = {
      ...global.window,
      electronAPI: mockElectronAPI,
    } as any;

    manager = new WorkerManager({
      sessionId: 'test-session',
      defaultMode: 'stream',
    });
  });

  afterEach(async () => {
    await manager.dispose();
    vi.clearAllMocks();
    // 重置 Worker mock
    (Worker as vi.Mock).mockImplementation((url: string) => new MockWorker());
  });

  describe('initialize', () => {
    it('应该创建Worker实例', async () => {
      await manager.initialize();

      expect(Worker).toHaveBeenCalledWith(
        expect.objectContaining({
          href: expect.stringContaining('cli-worker.ts'),
        }),
        { type: 'module' }
      );
    });

    it('应该发送INITIALIZE消息到Worker', async () => {
      await manager.initialize();

      const worker = (Worker as vi.Mock).mock.results[0].value as MockWorker;
      expect(worker.postMessage).toHaveBeenCalledWith({
        type: 'INITIALIZE',
        payload: { sessionId: 'test-session' },
      });
    });

    it('应该订阅主进程的流式数据', async () => {
      await manager.initialize();

      expect(mockElectronAPI.onMessage).toHaveBeenCalledWith(expect.any(Function));
    });

    it('初始化失败应该reject', async () => {
      // Mock Worker抛出错误
      const originalMock = (Worker as vi.Mock).getMockImplementation();
      (Worker as vi.Mock).mockImplementation(() => {
        throw new Error('Worker creation failed');
      });

      const newManager = new WorkerManager({
        sessionId: 'test-session',
      });

      await expect(newManager.initialize()).rejects.toThrow();

      // 恢复原始 mock
      (Worker as vi.Mock).mockImplementation(originalMock);
    });

    it('重复初始化应该抛出错误', async () => {
      await manager.initialize();

      await expect(manager.initialize()).rejects.toThrow('Worker 已存在');
    });
  });

  describe('sendMessage', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it('应该发送SEND_MESSAGE消息到Worker', async () => {
      await manager.sendMessage('Hello');

      const worker = (Worker as vi.Mock).mock.results[0].value as MockWorker;
      expect(worker.postMessage).toHaveBeenCalledWith({
        type: 'SEND_MESSAGE',
        payload: { content: 'Hello' },
      });
    });

    it('未初始化应该抛出错误', async () => {
      const newManager = new WorkerManager({ sessionId: 'test' });

      await expect(newManager.sendMessage('test')).rejects.toThrow(
        'Worker 未初始化'
      );
    });

    it('连接断开时应该加入重试队列', async () => {
      // 设置连接断开状态
      manager.setConnectedState(false);

      await manager.sendMessage('test');

      // 应该不抛出错误
      expect(manager['retryQueue']).toHaveLength(1);
      expect(manager['retryQueue'][0].content).toBe('test');
    });
  });

  describe('switchMode', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it('应该发送SWITCH_MODE消息到Worker', async () => {
      await manager.switchMode('single');

      const worker = (Worker as vi.Mock).mock.results[0].value as MockWorker;
      expect(worker.postMessage).toHaveBeenCalledWith({
        type: 'SWITCH_MODE',
        payload: { mode: 'single' },
      });
    });

    it('应该更新模式', async () => {
      expect(manager.getMode()).toBe('stream');

      await manager.switchMode('single');

      expect(manager.getMode()).toBe('single');
    });
  });

  describe('onStreamData', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it('应该接收流式数据', async () => {
      const callback = vi.fn();
      manager.onStreamData(callback);

      // 模拟Worker发送STREAM_DATA
      const worker = (Worker as vi.Mock).mock.results[0].value as MockWorker;
      worker.simulateMessage('STREAM_DATA', {
        type: 'assistant',
        content: 'Hello',
      });

      expect(callback).toHaveBeenCalledWith({
        type: 'assistant',
        content: 'Hello',
      });
    });
  });

  describe('onError', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it('应该接收错误', async () => {
      const errorCallback = vi.fn();
      manager.onError(errorCallback);

      // 模拟Worker发送ERROR
      const worker = (Worker as vi.Mock).mock.results[0].value as MockWorker;
      worker.simulateMessage('ERROR', {
        error: 'Test error',
      });

      expect(errorCallback).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('ready', () => {
    it('未初始化应该返回false', () => {
      expect(manager.ready()).toBe(false);
    });

    it('初始化后应该返回true', async () => {
      await manager.initialize();

      expect(manager.ready()).toBe(true);
    });
  });

  describe('dispose', () => {
    it('应该终止Worker', async () => {
      await manager.initialize();
      await manager.dispose();

      const worker = (Worker as vi.Mock).mock.results[0].value as MockWorker;
      expect(worker.terminate).toHaveBeenCalled();
    });

    it('应该发送DISPOSE消息到Worker', async () => {
      await manager.initialize();
      await manager.dispose();

      const worker = (Worker as vi.Mock).mock.results[0].value as MockWorker;
      expect(worker.postMessage).toHaveBeenCalledWith({ type: 'DISPOSE' });
    });

    it('应该清理所有订阅', async () => {
      await manager.initialize();

      const callback = vi.fn();
      manager.onStreamData(callback);
      manager.onError(callback);

      await manager.dispose();

      // 应该不再接收数据
      const worker = (Worker as vi.Mock).mock.results[0].value as MockWorker;
      worker.simulateMessage('STREAM_DATA', { test: 'data' });

      expect(callback).not.toHaveBeenCalled();
    });

    it('应该移除主进程监听器', async () => {
      await manager.initialize();
      await manager.dispose();

      expect(mockElectronAPI.removeListener).toHaveBeenCalled();
    });
  });

  describe('重试队列', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it('连接恢复时应该处理重试队列', async () => {
      // 设置为断开状态
      manager.setConnectedState(false);

      // 添加消息到重试队列
      await manager.sendMessage('message 1');
      await manager.sendMessage('message 2');

      expect(manager['retryQueue']).toHaveLength(2);

      // 恢复连接
      manager.setConnectedState(true);

      // 等待队列处理
      await new Promise(resolve => setTimeout(resolve, 100));

      // 队列应该被处理
      expect(manager['retryQueue']).toHaveLength(0);
    });

    it('超过重试次数的消息应该被丢弃', async () => {
      // 先断开连接
      manager.setConnectedState(false);

      // 添加一个已达到最大重试次数的消息
      manager['retryQueue'].push({
        content: 'failed message',
        retries: 3,
        timestamp: Date.now(),
      });

      // 恢复连接，触发队列处理
      manager.setConnectedState(true);
      await new Promise(resolve => setTimeout(resolve, 100));

      // 队列应该为空（超过重试次数的消息被丢弃）
      expect(manager['retryQueue']).toHaveLength(0);
    });
  });

  describe('连接状态', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it('默认应该是连接状态', () => {
      expect(manager['isConnected']).toBe(true);
    });

    it('应该能够设置连接状态', () => {
      manager.setConnectedState(false);
      expect(manager['isConnected']).toBe(false);

      manager.setConnectedState(true);
      expect(manager['isConnected']).toBe(true);
    });
  });
});
