import * as THREE from 'three'
export  class HightMeshBasicMaterial extends THREE.MeshPhongMaterial{
    constructor(parameters) {
        super(parameters)
        this.color = new THREE.Color(0x0000ff); // 设置材质的颜色为蓝色
    }
    onBeforeCompile(shader, renderer){
        // 创建高度参数纹理（核心修正点）
        const LAYER_COUNT = 50000;
        const layerTexture = new THREE.DataTexture(
            new Float32Array(LAYER_COUNT), // 每层高度值
            LAYER_COUNT, 1, // 纹理尺寸：10000x1
            THREE.RedFormat,
            THREE.FloatType
        );
        
        // 填充高度值：从0到100均匀分布
        const heightStep = 100 / LAYER_COUNT;
        for (let i = 0; i < LAYER_COUNT; i++) {
            layerTexture.image.data[i] = i * heightStep;
        }
        layerTexture.needsUpdate = true;

        // 绑定高度纹理（核心修正点）
        shader.uniforms.uHeightTexture = { value: layerTexture };
        shader.uniforms.uCurrentLayer = { value: LAYER_COUNT/2 }; // 初始中间层

        // 顶点着色器：传递高度信息
        shader.vertexShader = `
            varying float vHeight;
            ${shader.vertexShader}
        `;
        shader.vertexShader = shader.vertexShader.replace(
            '#include <begin_vertex>',
            `#include <begin_vertex>
            vHeight = position.y; // 使用模型局部坐标Y轴作为高度
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);`
        );

        // 片段着色器：基于纹理的多层切割（核心修正点）
        shader.fragmentShader = `
            uniform sampler2D uHeightTexture;
            uniform float uCurrentLayer;
            varying float vHeight;
            
            ${shader.fragmentShader}
        `;
        shader.fragmentShader = shader.fragmentShader.replace(
            'vec4 diffuseColor = vec4( diffuse, opacity );',
            `
            vec4 diffuseColor = vec4( diffuse, opacity );
            // 当前切割高度
            float currentHeight = texelFetch(uHeightTexture, ivec2(uCurrentLayer, 0), 0).r;
            
            // 切割判断
            if (vHeight > currentHeight) {
                discard;
            }
            
            // 横截面高亮
            float layerStep = 100.0 / ${LAYER_COUNT.toFixed(1)};
            float dist = fract(vHeight / layerStep);
            if (dist < 0.02) {
                diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1,0,0), 0.8);
            }

            `
        );
    }
}