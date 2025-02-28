const { contextBridge, ipcRenderer } = require('electron');

// 安全暴露 IPC 方法给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
   getEnv: () => process.env.NODE_ENV,
   getSTLPath: (filename) => ipcRenderer.invoke('get-stl-path', filename),
   getWorker: (filename) => ipcRenderer.invoke('get-worker', filename),
});

window.addEventListener("DOMContentLoaded", () => {
  const meta = document.createElement("meta");
  meta.httpEquiv = "Content-Security-Policy";
  meta.content =
    "default-src 'self'; script-src 'self' 'strict-dynamic' https:; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'; ";
  document.head.appendChild(meta);
});

 