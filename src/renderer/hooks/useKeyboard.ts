import { useEffect, useRef } from 'react';

type KeyHandler = (e: KeyboardEvent) => void;
type Shortcut = {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  handler: KeyHandler;
  description?: string;
};

/**
 * 键盘快捷键 Hook
 */
export function useKeyboard(shortcuts: Shortcut[], enabled = true) {
  const shortcutsRef = useRef(shortcuts);

  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      for (const shortcut of shortcutsRef.current) {
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrlKey === undefined || e.ctrlKey === shortcut.ctrlKey;
        const metaMatch = shortcut.metaKey === undefined || e.metaKey === shortcut.metaKey;
        const shiftMatch = shortcut.shiftKey === undefined || e.shiftKey === shortcut.shiftKey;
        const altMatch = shortcut.altKey === undefined || e.altKey === shortcut.altKey;

        if (keyMatch && ctrlMatch && metaMatch && shiftMatch && altMatch) {
          e.preventDefault();
          shortcut.handler(e);
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled]);
}

/**
 * 单个快捷键 Hook
 */
export function useKey(
  key: string,
  handler: KeyHandler,
  options: {
    ctrlKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    enabled?: boolean;
  } = {}
) {
  const { enabled = true, ...keyOptions } = options;

  useKeyboard(
    [
      {
        key,
        handler,
        ...keyOptions,
      },
    ],
    enabled
  );
}

/**
 * Escape 键 Hook
 */
export function useEscape(handler: () => void, enabled = true) {
  useKey('Escape', handler, { enabled });
}

/**
 * Enter 键 Hook
 */
export function useEnter(handler: () => void, enabled = true) {
  useKey('Enter', handler, { enabled });
}

/**
 * Mod (Ctrl/Meta) + 键组合 Hook
 */
export function useModKey(key: string, handler: KeyHandler, enabled = true) {
  useKey(
    key,
    handler,
    {
      ctrlKey: true,
      metaKey: true,
      enabled,
    }
  );
}
