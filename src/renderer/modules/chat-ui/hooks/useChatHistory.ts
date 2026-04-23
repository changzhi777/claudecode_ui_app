/**
 * 对话历史管理 Hook
 */

import { useState, useEffect } from 'react';
import { useChatStore } from '@stores';

interface ChatHistory {
  filename: string;
  filePath: string;
  title: string;
  createdAt: number;
  modifiedAt: number;
  size: number;
}

/**
 * 对话历史管理
 */
export function useChatHistory() {
  const [history, setHistory] = useState<ChatHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // 加载历史对话
  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const response = await window.electronAPI.invoke('chat:getHistory');

      if (response.success) {
        setHistory(response.chats);
      } else {
        console.error('加载历史失败:', response.error);
      }
    } catch (error) {
      console.error('加载历史异常:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 打开历史面板
  const openHistory = () => {
    setIsOpen(true);
    loadHistory();
  };

  // 关闭历史面板
  const closeHistory = () => {
    setIsOpen(false);
  };

  // 加载历史对话
  const loadChat = async (filePath: string) => {
    try {
      const response = await window.electronAPI.invoke('chat:loadHistory', filePath);

      if (response.success) {
        // 这里可以创建新会话并加载消息
        console.log('加载对话:', response.chatData);
        return response.chatData;
      }
    } catch (error) {
      console.error('加载对话失败:', error);
    }
  };

  // 删除对话
  const deleteChat = async (filePath: string) => {
    try {
      const response = await window.electronAPI.invoke('chat:delete', filePath);

      if (response.success) {
        // 重新加载历史
        await loadHistory();
      }
    } catch (error) {
      console.error('删除对话失败:', error);
    }
  };

  return {
    history,
    isLoading,
    isOpen,
    openHistory,
    closeHistory,
    loadChat,
    deleteChat,
  };
}
