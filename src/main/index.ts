import { app, BrowserWindow, protocol } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { IPCServer } from '../ipc-bridge/ipcServer';
import { CLIPCHandlers } from './ipc/cli-handlers';
import { ConfigHandlers } from './ipc/config-handlers';
import { registerFileHandlers } from './ipc/file-handlers';
import { initPerformanceHandlers } from './ipc/performance-handlers';

let mainWindow: BrowserWindow | null = null;
let cliHandlersInstance: CLIPCHandlers | undefined;
let configHandlersInstance: ConfigHandlers | undefined;

const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#f5f4ed',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.mjs'),
      nodeIntegrationInWorker: true, // 启用 Worker 中的 nodeIntegration
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webSecurity: false, // 临时禁用以解决 file:// 协议问题
    },
    titleBarStyle: 'hiddenInset',
    show: false,
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173').then(() => {
      setTimeout(() => {
        mainWindow?.webContents.openDevTools();
      }, 1500);
    });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    mainWindow.webContents.openDevTools();

    // 监听渲染进程加载失败
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('页面加载失败:', errorCode, errorDescription);
    });

    // 监听 Console 消息
    mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
      console.log(`[Renderer Console] ${message}`);
    });
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    mainWindow?.focus();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  // 初始化 IPC 服务器
  new IPCServer();

  // 延迟初始化 CLI IPC handlers（首次使用时才启动）
  // 这样可以减少应用启动时间
  setTimeout(() => {
    if (!cliHandlersInstance) {
      cliHandlersInstance = new CLIPCHandlers();
      console.log('[Main] CLI Handlers initialized (delayed)');
    }
  }, 1000); // 1秒后初始化

  // 初始化配置 IPC handlers（轻量级，立即初始化）
  configHandlersInstance = new ConfigHandlers();

  // 注册文件处理 IPC handlers（轻量级，立即初始化）
  registerFileHandlers();

  // 注册性能监控 IPC handlers（轻量级，立即初始化）
  initPerformanceHandlers();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 清理资源
app.on('before-quit', async () => {
  if (cliHandlersInstance) {
    await cliHandlersInstance.dispose();
  }
  if (configHandlersInstance) {
    configHandlersInstance.dispose();
  }
});
