<template>
  <div>
    <h1>Electron + Vue 3</h1>
    <button @click="sendMessageV2">Send Message to Main Process</button>
    <p>Reply from Main: {{ reply }}</p>
  </div>
</template>

<script>
import {STLRenderer} from './threeScene';
export default {
  data() {
    return {
      reply: ''
    };
  },
  mounted() {
    // 监听主进程回复
    // window.electronAPI.receiveFromMain((message) => {
    //   this.reply = message;
    // });
  },
  methods: {
    sendMessageV2() {
      // 发送消息到主进程
      this.initDemo();
    },
    initDemo(){
      // 在渲染进程初始化
const stlRenderer = new STLRenderer()
debugger;
// 加载模型
stlRenderer.loadModel('1.STL').catch(err => {
  console.error('加载失败:', err)
})

// 响应窗口变化
window.addEventListener('resize', () => {
  stlRenderer.camera.aspect = window.innerWidth / window.innerHeight
  stlRenderer.camera.updateProjectionMatrix()
  stlRenderer.renderer.setSize(window.innerWidth, window.innerHeight)
})
    }
  }
};
</script>

<style>
#app {
  font-family: Arial, sans-serif;
  padding: 20px;
}
</style>