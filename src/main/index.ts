import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { IPCServer } from '../ipc-bridge/ipcServer';
import { CLIPCHandlers } from './ipc/cli-handlers';

let mainWindow: BrowserWindow | null = null;
let cliHandlersInstance: CLIPCHandlers | undefined;

const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#f5f4ed',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
    titleBarStyle: 'hiddenInset',
    show: false,
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173').then(() => {
      // 延迟打开 DevTools，避免影响启动性能
      setTimeout(() => {
        mainWindow?.webContents.openDevTools();
      }, 1500);
    });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
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

  // 初始化 CLI IPC handlers
  cliHandlersInstance = new CLIPCHandlers();

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
});
