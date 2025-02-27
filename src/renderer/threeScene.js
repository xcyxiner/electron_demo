import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js'
export class STLRenderer {
  constructor() {
    this.initScene()
    this.setupWorker()
  }

  initScene() {
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000)
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(this.renderer.domElement)
    
    // 添加基础光源
    const ambientLight = new THREE.AmbientLight(0x404040)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
    this.scene.add(ambientLight, directionalLight)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;       // 启用阻尼效果
    this.controls.dampingFactor = 0.05;
      // 添加窗口大小变化监听
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.controls.handleResize();  // 更新控制器尺寸
    });
    this.controls.update();  // 首次更新控制器
    this.camera.position.z = 100
  }

  setupWorker() {
    this.worker = new Worker(new URL(
      /* webpackChunkName: "stlLoader.worker" */ './stlLoader.worker.js',
      import.meta.url
  ))
    
    this.worker.onmessage = (e) => {
      console.log(e.data,"this.worker")
      if (e.data.error) {
        console.error('Worker Error:', e.data.error)
        return
      }
      
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.BufferAttribute(
        new Float32Array(e.data.vertices), 3
      ))
      
      if (e.data.normals.length > 0) {
        geometry.setAttribute('normal', new THREE.BufferAttribute(
          new Float32Array(e.data.normals), 3
        ))
      } else {
        geometry.computeVertexNormals() // 自动计算法线
      }
      
      
      this.mesh = new THREE.Mesh(geometry)
      this.mesh.scale.set(0.005, 0.005, 0.005)
      this.scene.add(this.mesh)
      this.animate()
    }
  }

  async loadModel(filename) {
    const filePath = await window.electronAPI.getSTLPath(filename)
    this.worker.postMessage({ filePath })
  }

  animate() {
    requestAnimationFrame(() => this.animate())
    
    // if (this.mesh) {
    //   this.mesh.rotation.x += 0.01
    //   this.mesh.rotation.y += 0.01
    // }
    this.controls.update();  // 在动画循环中更新控制器
    this.renderer.render(this.scene, this.camera)
  }
}