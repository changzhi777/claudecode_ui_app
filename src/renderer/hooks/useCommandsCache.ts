import { useState, useEffect, useRef } from 'react';

interface CommandItem {
  command: string;
  description: string;
  category: string;
  label: string;
  hint: string;
}

/**
 * 命令缓存 Hook
 * 在全局缓存命令列表，避免重复加载
 */
let cachedCommands: CommandItem[] | null = null;
let isLoading = false;
let loadPromise: Promise<CommandItem[]> | null = null;

export function useCommandsCache() {
  const [commands, setCommands] = useState<CommandItem[]>(cachedCommands || []);
  const [loading, setLoading] = useState(!cachedCommands && isLoading);

  useEffect(() => {
    // 如果已经有缓存，直接返回
    if (cachedCommands) {
      setCommands(cachedCommands);
      setLoading(false);
      return;
    }

    // 如果正在加载，等待加载完成
    if (isLoading && loadPromise) {
      loadPromise.then((cmds) => {
        setCommands(cmds);
        setLoading(false);
      });
      return;
    }

    // 开始加载
    isLoading = true;
    setLoading(true);

    const loadCommands = async () => {
      try {
        const response = await window.electronAPI.invoke('cli:getCommands');
        if (response.success && response.commands) {
          cachedCommands = response.commands;
          setCommands(response.commands);
          return response.commands;
        }
        return [];
      } catch (error) {
        console.error('加载命令失败:', error);
        return [];
      } finally {
        isLoading = false;
        setLoading(false);
      }
    };

    loadPromise = loadCommands();
    loadPromise.then((cmds) => {
      setCommands(cmds);
      setLoading(false);
    });
  }, []);

  return { commands, loading };
}

/**
 * 预加载命令（可选）
 * 可以在应用启动时调用，提前加载命令列表
 */
export function preloadCommands() {
  if (cachedCommands || isLoading) {
    return Promise.resolve(cachedCommands || []);
  }

  isLoading = true;
  return window.electronAPI.invoke('cli:getCommands').then((response) => {
    if (response.success && response.commands) {
      cachedCommands = response.commands;
      isLoading = false;
      return response.commands;
    }
    isLoading = false;
    return [];
  });
}
