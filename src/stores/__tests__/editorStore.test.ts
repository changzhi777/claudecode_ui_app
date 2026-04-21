/**
 * editorStore 单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEditorStore } from '../editorStore';

describe('useEditorStore', () => {
  beforeEach(() => {
    // 重置 store 状态
    const { setFileTree, tabs, activeTabId } = useEditorStore.getState();
    setFileTree([]);
    // 注意：Zustand persist 中间件会在测试中保留状态
    // 在真实测试中可能需要清除 localStorage
  });

  describe('文件树操作', () => {
    it('应该设置文件树', () => {
      const { result } = renderHook(() => useEditorStore());

      const mockTree = [
        {
          id: 'root',
          name: 'project',
          path: '/project',
          type: 'directory' as const,
          children: [
            {
              id: 'file1',
              name: 'file1.ts',
              path: '/project/file1.ts',
              type: 'file' as const,
            },
          ],
        },
      ];

      act(() => {
        result.current.setFileTree(mockTree);
      });

      expect(result.current.fileTree).toEqual(mockTree);
    });

    it('应该切换展开状态', () => {
      const { result } = renderHook(() => useEditorStore());

      const path = '/project/src';

      act(() => {
        result.current.toggleExpand(path);
      });

      expect(result.current.expandedPaths.has(path)).toBe(true);

      act(() => {
        result.current.toggleExpand(path);
      });

      expect(result.current.expandedPaths.has(path)).toBe(false);
    });

    it('应该选择文件', () => {
      const { result } = renderHook(() => useEditorStore());

      const path = '/project/file.ts';

      act(() => {
        result.current.selectFile(path);
      });

      expect(result.current.selectedPath).toBe(path);
    });
  });

  describe('标签页操作', () => {
    it('应该打开新标签页', () => {
      const { result } = renderHook(() => useEditorStore());

      const file = {
        id: 'file1',
        name: 'test.ts',
        path: '/project/test.ts',
        type: 'file' as const,
      };

      act(() => {
        result.current.openTab(file);
      });

      expect(result.current.tabs).toHaveLength(1);
      expect(result.current.tabs[0].fileName).toBe('test.ts');
      expect(result.current.activeTabId).toBe(result.current.tabs[0].id);
    });

    it('应该切换到已存在的标签页', () => {
      const { result } = renderHook(() => useEditorStore());

      const file = {
        id: 'file1',
        name: 'test.ts',
        path: '/project/test.ts',
        type: 'file' as const,
      };

      act(() => {
        result.current.openTab(file);
      });

      const firstTabId = result.current.tabs[0].id;

      act(() => {
        result.current.openTab(file);
      });

      // 应该还是只有一个标签页
      expect(result.current.tabs).toHaveLength(1);
      expect(result.current.tabs[0].id).toBe(firstTabId);
    });

    it('应该关闭标签页', () => {
      const { result } = renderHook(() => useEditorStore());

      const file1 = {
        id: 'file1',
        name: 'test1.ts',
        path: '/project/test1.ts',
        type: 'file' as const,
      };

      const file2 = {
        id: 'file2',
        name: 'test2.ts',
        path: '/project/test2.ts',
        type: 'file' as const,
      };

      act(() => {
        result.current.openTab(file1);
        result.current.openTab(file2);
      });

      expect(result.current.tabs).toHaveLength(2);

      act(() => {
        result.current.closeTab(result.current.tabs[0].id);
      });

      expect(result.current.tabs).toHaveLength(1);
    });

    it('应该切换标签页', () => {
      const { result } = renderHook(() => useEditorStore());

      const file1 = {
        id: 'file1',
        name: 'test1.ts',
        path: '/project/test1.ts',
        type: 'file' as const,
      };

      const file2 = {
        id: 'file2',
        name: 'test2.ts',
        path: '/project/test2.ts',
        type: 'file' as const,
      };

      act(() => {
        result.current.openTab(file1);
        result.current.openTab(file2);
      });

      const secondTabId = result.current.tabs[1].id;

      act(() => {
        result.current.switchTab(secondTabId);
      });

      expect(result.current.activeTabId).toBe(secondTabId);
    });
  });

  describe('编辑器操作', () => {
    it('应该更新内容', () => {
      const { result } = renderHook(() => useEditorStore());

      const file = {
        id: 'file1',
        name: 'test.ts',
        path: '/project/test.ts',
        type: 'file' as const,
      };

      act(() => {
        result.current.openTab(file);
      });

      act(() => {
        result.current.updateContent('new content');
      });

      const activeTab = result.current.tabs.find((t) => t.id === result.current.activeTabId);
      expect(activeTab?.content).toBe('new content');
      expect(activeTab?.isModified).toBe(true);
    });

    it('应该保存文件', () => {
      const { result } = renderHook(() => useEditorStore());

      const file = {
        id: 'file1',
        name: 'test.ts',
        path: '/project/test.ts',
        type: 'file' as const,
      };

      act(() => {
        result.current.openTab(file);
        result.current.updateContent('modified content');
      });

      act(() => {
        result.current.saveFile();
      });

      const activeTab = result.current.tabs.find((t) => t.id === result.current.activeTabId);
      expect(activeTab?.isModified).toBe(false);
    });
  });
});
