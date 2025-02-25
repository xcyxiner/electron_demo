const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,          // 禁用 Node.js 在渲染进程
      webSecurity: false, // 开发环境关闭安全限制
      contextIsolation: true,          // 启用上下文隔离
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // 开发环境加载 Vue 开发服务器，生产环境加载构建文件
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:8080');
    mainWindow.webContents.openDevTools(); // 打开开发者工具
  } else {
    mainWindow.loadURL('http://localhost:8080');
    mainWindow.webContents.openDevTools(); // 打开开发者工具
    // mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 示例 IPC 监听
  ipcMain.on('message-from-renderer', (event, message) => {
    console.log('Received from renderer:', message);
    event.sender.send('reply-from-main', 'Main process received your message!');
  });

  ipcMain.handle('get-stl-path', (_, filename) => {
    return process.env.NODE_ENV === 'development'
      ? path.join(__dirname, '../../public/models', filename)
      : path.join(process.resourcesPath, 'resources/models', filename)
  })

    //   // 添加在 createWindow 之后
    // ipcMain.on('reload-app', () => {
    //   mainWindow.reload()
    // })

    //     // 监听 Vue 编译完成
    // if (process.env.WEBPACK_DEV_SERVER_URL) {
    //   const chokidar = require('chokidar')
    //   chokidar.watch('src/renderer/**/*').on('all', () => {
    //     mainWindow.webContents.send('vue-reload')
    //   })
    // }
}

app.whenReady().then(createWindow);
// 监听文件变化重启应用
// if (process.env.NODE_ENV === 'development') {
//   require('electron-reload')(__dirname, {
//     electron: path.join(__dirname, '../../node_modules/.bin/electron')
//   })
// }

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