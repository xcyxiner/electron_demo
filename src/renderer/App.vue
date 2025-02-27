<template>
  <div>
    <button @click="sendMessageV2">测试Webgl</button>
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

  },
  methods: {
    sendMessageV2() {
      // 发送消息到主进程
      this.initDemo();
    },
    initDemo(){
      // 在渲染进程初始化
const stlRenderer = new STLRenderer()
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