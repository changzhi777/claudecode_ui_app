/**
 * ProcessPool 单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CLIProcessPool } from '../ProcessPool';

// Mock CLIProcess
let mockPidCounter = 0;
vi.mock('../CLIProcess', () => ({
  CLIProcess: vi.fn().mockImplementation(() => ({
    pid: `mock-pid-${++mockPidCounter}`,
    start: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn().mockResolvedValue(undefined),
    send: vi.fn().mockResolvedValue(undefined),
    on: vi.fn(),
    isHealthy: vi.fn().mockReturnValue(true),
  }))
}));

describe('CLIProcessPool', () => {
  let pool: CLIProcessPool;
  const mockConfig = {
    size: 3,
    cliPath: '/usr/bin/claude',
    maxIdleTime: 5000,
    healthCheckInterval: 1000,
  };

  beforeEach(() => {
    // 重置pid计数器
    mockPidCounter = 0;
    pool = new CLIProcessPool(mockConfig);
  });

  afterEach(async () => {
    await pool.dispose();
  });

  describe('initialize', () => {
    it('应该创建指定数量的进程', async () => {
      await pool.initialize();

      const stats = pool.getStats();
      expect(stats.total).toBe(3);
      expect(stats.idle).toBe(3);
      expect(stats.active).toBe(0);
    });

    it('应该触发initialized事件', async () => {
      const initializedSpy = vi.fn();

      pool.on('initialized', initializedSpy);
      await pool.initialize();

      expect(initializedSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('acquire', () => {
    beforeEach(async () => {
      await pool.initialize();
    });

    it('应该分配空闲进程', async () => {
      const handle = await pool.acquire('session-1');

      expect(handle).toBeDefined();
      expect(handle.sessionId).toBe('session-1');

      const stats = pool.getStats();
      expect(stats.active).toBe(1);
      expect(stats.idle).toBe(2);
    });

    it('同一会话应该复用进程', async () => {
      const handle1 = await pool.acquire('session-1');
      const handle2 = await pool.acquire('session-1');

      expect(handle1.pid).toBe(handle2.pid);

      const stats = pool.getStats();
      expect(stats.active).toBe(1);
    });

    it('不同会话应该分配不同进程', async () => {
      const handle1 = await pool.acquire('session-1');
      const handle2 = await pool.acquire('session-2');

      expect(handle1.pid).not.toBe(handle2.pid);

      const stats = pool.getStats();
      expect(stats.active).toBe(2);
    });

    it('无空闲进程时应该创建新进程', async () => {
      await pool.acquire('session-1');
      await pool.acquire('session-2');
      await pool.acquire('session-3');

      const handle4 = await pool.acquire('session-4');

      expect(handle4).toBeDefined();

      const stats = pool.getStats();
      expect(stats.total).toBe(4); // 原始3个 + 新创建1个
    });
  });

  describe('release', () => {
    beforeEach(async () => {
      await pool.initialize();
    });

    it('应该释放进程回空闲池', async () => {
      await pool.acquire('session-1');
      pool.release('session-1');

      const stats = pool.getStats();
      expect(stats.active).toBe(0);
      expect(stats.idle).toBe(3);
    });

    it('应该触发released事件', async () => {
      const releasedSpy = vi.fn();

      await pool.acquire('session-1');
      pool.on('released', releasedSpy);

      pool.release('session-1');

      expect(releasedSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: 'session-1',
        })
      );
    });

    it('释放不存在的会话应该不报错', () => {
      expect(() => {
        pool.release('non-existent');
      }).not.toThrow();
    });
  });

  describe('terminate', () => {
    beforeEach(async () => {
      await pool.initialize();
    });

    it('应该终止会话进程', async () => {
      await pool.acquire('session-1');
      await pool.terminate('session-1');

      const stats = pool.getStats();
      expect(stats.total).toBe(2); // 3 - 1 = 2
      expect(stats.active).toBe(0);
    });

    it('应该清理会话映射', async () => {
      await pool.acquire('session-1');
      await pool.terminate('session-1');

      const stats = pool.getStats();
      expect(stats.sessionMap).not.toHaveProperty('session-1');
    });
  });

  describe('getStats', () => {
    it('未初始化时应该返回零统计', () => {
      const stats = pool.getStats();

      expect(stats.total).toBe(0);
      expect(stats.active).toBe(0);
      expect(stats.idle).toBe(0);
    });

    it('应该正确反映进程状态', async () => {
      await pool.initialize();

      await pool.acquire('session-1');
      await pool.acquire('session-2');

      const stats = pool.getStats();
      expect(stats.total).toBe(3);
      expect(stats.active).toBe(2);
      expect(stats.idle).toBe(1);
    });

    it('应该包含会话映射', async () => {
      await pool.initialize();
      await pool.acquire('session-1');

      const stats = pool.getStats();
      expect(stats.sessionMap).toHaveProperty('session-1');
    });
  });

  describe('dispose', () => {
    it('应该清理所有进程', async () => {
      await pool.initialize();
      await pool.dispose();

      const stats = pool.getStats();
      expect(stats.total).toBe(0);
      expect(stats.idle).toBe(0);
    });

    it('应该触发disposed事件', async () => {
      await pool.initialize();

      const disposedSpy = vi.fn();
      pool.on('disposed', disposedSpy);

      await pool.dispose();

      expect(disposedSpy).toHaveBeenCalledTimes(1);
    });

    it('应该停止健康检查', async () => {
      await pool.initialize();
      await pool.dispose();

      // 等待健康检查间隔
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 如果健康检查仍在运行，可能会有错误
      expect(pool.getStats().total).toBe(0);
    });
  });
});
