const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,          // 禁用 Node.js 在渲染进程
      contextIsolation: true,          // 启用上下文隔离
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // 开发环境加载 Vue 开发服务器，生产环境加载构建文件
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools(); // 打开开发者工具
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.handle('get-stl-path', (_, filename) => {
  return process.env.NODE_ENV === 'development'
    ? path.join('/models', filename)
    : path.join(process.resourcesPath, 'resources/models', filename)
})

const isDevelopment = process.env.NODE_ENV !== 'production';

function getWorkerPath() {
  return isDevelopment
    ? path.join(__dirname, 'src/renderer/worker/stlLoader.worker.js') // 开发环境直接指向源码
    : path.join(__dirname, 'dist/stlLoader.worker.js'); // 生产环境指向打包文件
}

// 暴露路径给渲染进程
ipcMain.handle('get-worker-path', () => getWorkerPath());

// 主进程代码（开发环境专用）
if (isDevelopment) {
  require('electron-reloader')(module, {
    debug: true,
    watchRenderer: true
  });
}