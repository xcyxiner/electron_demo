const { app, BrowserWindow, ipcMain, dialog, session } = require('electron');
const path = require('path');
let fs = require('fs');
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,          // 禁用 Node.js 在渲染进程
      contextIsolation: true,          // 启用上下文隔离
      sandbox: true,
      webSecurity: true,
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

  // verifyWorkers()
}

app.whenReady().then(createWindow);
// 主进程直接访问 ASAR 文件系统
const verifyWorkers = async () => {
  const requiredWorkers = ['stlLoader.worker.js']
  const appPath = app.getAppPath() // 获取 ASAR 挂载点

  try {
    requiredWorkers.forEach(name => {
      const workerPath = path.join(appPath, 'dist', name)
      
      // 直接读取 ASAR 内文件
      const stats = fs.statSync(workerPath)
      if (stats.size < 1024) {
        throw new Error(`Worker 文件损坏: ${name}`)
      }

      // // 添加 SHA256 校验
      // const hash = crypto.createHash('sha256')
      // const content = fs.readFileSync(workerPath)
      // const fileHash = hash.update(content).digest('hex')
      
      // if (!validHashes.includes(fileHash)) {
      //   throw new Error(`Worker 哈希不匹配: ${name}`)
      // }
    })
  } catch (error) {
    dialog.showErrorBox('完整性校验失败', error.message)
    app.exit(1)
  }
}


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

ipcMain.handle('get-worker', async (event, filename) => {
  const asarPath = path.join(app.getAppPath(), 'node_modules', '.bin', 'asar')
  
  // 从 ASAR 包内读取 worker 文件内容
  const workerPath = path.join(__dirname, 'node_modules', 'electron_demo', 'dist', filename)
  const workerContent = fs.readFileSync(workerPath, 'utf-8')

  // 写入临时目录
  const tempDir = app.getPath('temp')
  const tempWorkerPath = path.join(tempDir, filename)
  
  if (!fs.existsSync(tempWorkerPath)) {
    fs.writeFileSync(tempWorkerPath, workerContent)
  }

  return tempWorkerPath
})

const isDevelopment = process.env.NODE_ENV !== 'production';


// 主进程代码（开发环境专用）
if (isDevelopment) {
  require('electron-reloader')(module, {
    debug: true,
    watchRenderer: true
  });
}