import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js'
import { HightMeshBasicMaterial } from './hightMeshBasicMaterial'
export class STLRenderer {
  constructor() {
    this.setupWorker()
  }

  initScene(domElement) {
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000)
    this.renderer = new THREE.WebGLRenderer({ antialias: true})

    // 添加地面网格（尺寸10x10，细分10等分）
    const gridSize = 100;
    const gridDivisions = 100;
    const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x444444, 0x888888);
    this.scene.add(gridHelper);

    // 添加三维坐标轴辅助器（长度5单位）
    const axesHelper = new THREE.AxesHelper(50);
    this.scene.add(axesHelper);
    
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    domElement.appendChild(this.renderer.domElement)
    
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
      // this.controls.handleResize();  // 更新控制器尺寸
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
      this.mesh = new THREE.Mesh(geometry,new THREE.MeshPhongMaterial(
        {
          color: 0xffffff,
          specular: 0xffffff,
          shininess: 100
        }
      ))
      this.scene.add(this.mesh)
      this.animate()
    }
  }
  startCut() {
    if (this.mesh) {
      this.mesh.material = new HightMeshBasicMaterial(
        {
          color: 0xffffff,
          specular: 0xffffff,
          shininess: 100
        }
      )
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