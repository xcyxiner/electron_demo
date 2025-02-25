import { createApp } from 'vue';
import App from './App.vue';

const app = createApp(App);
app.mount('#app');

if (process.env.NODE_ENV === 'development') {
    window.electronAPI?.reload()
  }

  // 接收热更新通知
window.ipcRenderer?.on('vue-reload', () => {
    location.reload()
  })