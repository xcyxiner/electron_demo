import * as THREE from 'three'

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
    
    this.camera.position.z = 100
  }

  setupWorker() {
    this.worker = new Worker(window.electronAPI.workerPath)
    
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
      
      const material = new THREE.MeshPhongMaterial({ 
        color: 0x00ff00,
        specular: 0x111111,
        shininess: 200
      })
      
      this.mesh = new THREE.Mesh(geometry, material)
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
    
    if (this.mesh) {
      this.mesh.rotation.x += 0.01
      this.mesh.rotation.y += 0.01
    }
    
    this.renderer.render(this.scene, this.camera)
  }
}