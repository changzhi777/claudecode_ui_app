/**
 * macOS 快捷键配置
 */

import { globalShortcut, BrowserWindow } from 'electron';

/**
 * 注册全局快捷键
 */
export function registerGlobalShortcuts(mainWindow: () => BrowserWindow | undefined) {
  // Cmd+N - 新建对话
  globalShortcut.register('Command+N', () => {
    const win = mainWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send('shortcut:new-chat');
    }
  });

  // Cmd+W - 关闭窗口
  globalShortcut.register('Command+W', () => {
    const win = mainWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send('shortcut:close-window');
    }
  });

  // Cmd+, - 打开设置
  globalShortcut.register('Command+,', () => {
    const win = mainWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send('shortcut:open-settings');
    }
  });

  // Cmd+S - 保存对话
  globalShortcut.register('Command+S', () => {
    const win = mainWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send('shortcut:save-chat');
    }
  });

  // Cmd+Shift+S - 另存为
  globalShortcut.register('Command+Shift+S', () => {
    const win = mainWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send('shortcut:save-chat-as');
    }
  });

  // Cmd+O - 打开对话
  globalShortcut.register('Command+O', () => {
    const win = mainWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send('shortcut:open-chat');
    }
  });

  // Cmd+T - 切换主题
  globalShortcut.register('Command+T', () => {
    const win = mainWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send('shortcut:toggle-theme');
    }
  });

  // Cmd+K - 切换视图
  globalShortcut.register('Command+K', () => {
    const win = mainWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send('shortcut:toggle-view');
    }
  });

  // Cmd+/ - 打开命令面板
  globalShortcut.register('Command+/', () => {
    const win = mainWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send('shortcut:command-palette');
    }
  });

  // F11 - 全屏切换
  globalShortcut.register('F11', () => {
    const win = mainWindow();
    if (win && !win.isDestroyed()) {
      win.setFullScreen(!win.isFullScreen());
    }
  });

  console.log('[Shortcuts] macOS 快捷键已注册');
}

/**
 * 注销所有快捷键
 */
export function unregisterAllShortcuts() {
  globalShortcut.unregisterAll();
  console.log('[Shortcuts] 快捷键已注销');
}
