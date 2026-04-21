/**
 * 示例测试 - 验证测试框架
 */

import { describe, it, expect } from 'vitest';

describe('示例测试', () => {
  it('应该通过基本测试', () => {
    expect(1 + 1).toBe(2);
  });

  it('应该验证字符串操作', () => {
    const str = 'Hello, World!';
    expect(str).toContain('World');
    expect(str.length).toBeGreaterThan(10);
  });

  it('应该验证数组操作', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(arr).toHaveLength(5);
    expect(arr).toContain(3);
  });
});
