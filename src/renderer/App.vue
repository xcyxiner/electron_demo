<template>
  <div>
    <el-row type="flex" class="row-bg">
        <el-button @click="initDemo">加载STL</el-button>
        <el-button @click="startCut">水平切割</el-button>
      </el-row>
      <el-row type="flex" class="row-bg" style="margin-top: 10px;">
        <div ref="stlContainer" id="stl-container">
        </div>
      </el-row>
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
    this.initDemo()
  },
  methods: {
    startCut(){
      let stlRenderer=window.stlRenderer
      if(!stlRenderer){
       this.$message.warning('请先加载模型')
        return
      }
      stlRenderer.startCut()
    },
    initDemo(){
      let stlRenderer=window.stlRenderer
      if(stlRenderer){
        return
      }

      // 在渲染进程初始化
      window.stlRenderer = new STLRenderer()
       stlRenderer=window.stlRenderer
      stlRenderer.initScene(this.$refs.stlContainer)
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