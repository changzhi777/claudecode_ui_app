import { app, BrowserWindow } from 'electron';
import path from 'path';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // 开发模式禁用 web 安全
    },
    titleBarStyle: 'hiddenInset',
    show: false,
  });

  // 加载 Vite 开发服务器
  mainWindow.loadURL('http://localhost:5173')
    .then(() => {
      console.log('页面加载成功');
    })
    .catch(err => {
      console.error('页面加载失败:', err);
    });

  // 打开开发者工具
  mainWindow.webContents.openDevTools();

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    console.log('Electron 窗口已显示');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    console.log('Electron 窗口已关闭');
  });
}

app.whenReady().then(() => {
  console.log('Electron 应用准备就绪');
  createWindow();

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

console.log('Electron 开发模式启动中...');
