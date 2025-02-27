const { contextBridge, ipcRenderer } = require('electron');

// 安全暴露 IPC 方法给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  getEnv: () => process.env.NODE_ENV,
   getSTLPath: (filename) => ipcRenderer.invoke('get-stl-path', filename),
   getWorkerPath: () => ipcRenderer.invoke('get-worker-path'),
  workerPath: process.env.NODE_ENV === 'development'
    ? './renderer/worker/stlLoader.worker.js'
    : '../renderer/worker/stlLoader.worker.js'
});