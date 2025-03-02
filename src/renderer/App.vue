<template>
  <div>
    <el-row type="flex" class="row-bg">
        <el-button @click="initDemo">加载STL</el-button>
        <el-button @click="startCut">水平切片</el-button>
      </el-row>
      <el-row type="flex" class="row-bg">
        <el-slider v-model="cutRange" range show-stops :min="1" :max="cutMax" @input="cutRangeChange"  />
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
      cutRange: [1,1],
      cutMax:10,
      cutPerHigh:0.2
    };
  },
  mounted() {
    this.initDemo()
  },
  methods: {
    cutRangeChange(value){
      let min=value[0]
      let max=value[1]
      if(min===max){
        min=max-1
      }
      let stlRenderer=window.stlRenderer
      if(stlRenderer){
        stlRenderer.refreshLayerRange({min,max})
      }
    },
    startCut(){
      let stlRenderer=window.stlRenderer
      if(!stlRenderer){
       this.$message.warning('请先加载模型')
        return
      }
      this.cutMax=stlRenderer.calcTotalNumber(this.cutPerHigh)
      this.cutRange=[1,this.cutMax]

      stlRenderer.startCut({
        layer_count: this.cutMax,
        heightStep: this.cutPerHigh
      })
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