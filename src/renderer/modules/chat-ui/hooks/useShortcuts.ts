/**
 * 快捷键 Hook
 */

import { useEffect } from 'react';
import { useChatStore } from '@stores/chatStore';

/**
 * 快捷键类型定义
 */
interface ShortcutMap {
  'new-chat': () => void;
  'close-window': () => void;
  'open-settings': () => void;
  'save-chat': () => void;
  'save-chat-as': () => void;
  'open-chat': () => void;
  'toggle-theme': () => void;
  'toggle-view': () => void;
  'command-palette': () => void;
}

/**
 * 使用快捷键
 */
export function useShortcuts(shortcuts: ShortcutMap) {
  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      const key = event.key;

      // Cmd+N - 新建对话
      if (event.metaKey && key === 'n') {
        event.preventDefault();
        shortcuts['new-chat']?.();
      }

      // Cmd+W - 关闭窗口
      if (event.metaKey && key === 'w') {
        event.preventDefault();
        shortcuts['close-window']?.();
      }

      // Cmd+S - 保存对话
      if (event.metaKey && key === 's') {
        event.preventDefault();
        shortcuts['save-chat']?.();
      }

      // Cmd+Shift+S - 另存为
      if (event.metaKey && event.shiftKey && key === 's') {
        event.preventDefault();
        shortcuts['save-chat-as']?.();
      }

      // Cmd+O - 打开对话
      if (event.metaKey && key === 'o') {
        event.preventDefault();
        shortcuts['open-chat']?.();
      }

      // Cmd+T - 切换主题
      if (event.metaKey && key === 't') {
        event.preventDefault();
        shortcuts['toggle-theme']?.();
      }

      // Cmd+K - 切换视图
      if (event.metaKey && key === 'k') {
        event.preventDefault();
        shortcuts['toggle-view']?.();
      }

      // Cmd+/ - 命令面板
      if (event.metaKey && key === '/') {
        event.preventDefault();
        shortcuts['command-palette']?.();
      }

      // F11 - 全屏
      if (key === 'F11') {
        event.preventDefault();
        // 全屏由 Electron 主进程处理
      }

      // Esc - 关闭弹窗
      if (key === 'Escape') {
        // 可以用于关闭模态框等
      }
    };

    window.addEventListener('keydown', handleShortcut);

    return () => {
      window.removeEventListener('keydown', handleShortcut);
    };
  }, [shortcuts]);
}

/**
 * 使用全局快捷键（从主进程）
 */
export function useGlobalShortcuts() {
  useEffect(() => {
    const listeners = {
      'shortcut:new-chat': () => {
        // 新建对话
        console.log('[Shortcut] 新建对话');
      },
      'shortcut:close-window': () => {
        // 关闭窗口
        window.close();
      },
      'shortcut:open-settings': () => {
        // 打开设置
        console.log('[Shortcut] 打开设置');
      },
      'shortcut:save-chat': () => {
        // 保存对话
        console.log('[Shortcut] 保存对话');
      },
      'shortcut:save-chat-as': () => {
        // 另存为
        console.log('[Shortcut] 另存为');
      },
      'shortcut:open-chat': () => {
        // 打开对话
        console.log('[Shortcut] 打开对话');
      },
      'shortcut:toggle-theme': () => {
        // 切换主题 - 已在主窗口中实现
        console.log('[Shortcut] 切换主题');
      },
      'shortcut:toggle-view': () => {
        // 切换视图 - 已在主窗口中实现
        console.log('[Shortcut] 切换视图');
      },
      'shortcut:command-palette': () => {
        // 命令面板
        console.log('[Shortcut] 命令面板');
      },
    };

    // 监听主进程的快捷键事件
    Object.entries(listeners).forEach(([channel, handler]) => {
      window.electronAPI?.on(channel, handler);
    });

    return () => {
      Object.entries(listeners).forEach(([channel, handler]) => {
        window.electronAPI?.removeListener(channel);
      });
    };
  }, []);
}
