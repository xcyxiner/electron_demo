import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'

self.onmessage = async (e) => {
  try {
    const { filePath } = e.data
    const response = await fetch(filePath)
    const buffer = await response.arrayBuffer()

    const loader = new STLLoader()
    const geometry = loader.parse(buffer)
    // 转换为可传输格式
    const vertices = geometry.attributes.position.array
    const normals = geometry.attributes.normal?.array || []
    
    const scaleFactor = 0.005;
    for (let i = 0; i < vertices.length; i += 3) {
      vertices[i] *= scaleFactor;     // x
      vertices[i + 1] *= scaleFactor; // y
      vertices[i + 2] *= scaleFactor; // z
    }
        
    self.postMessage({
      vertices: vertices.buffer,
      normals: normals.buffer
    }, [vertices.buffer, normals.buffer])
    
  } catch (error) {
    self.postMessage({ error: error.message })
  }
}