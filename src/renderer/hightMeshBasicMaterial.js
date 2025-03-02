import * as THREE from 'three'
export  class HightMeshBasicMaterial extends THREE.MeshPhongMaterial{
    constructor(parameters) {
        super(parameters)
        this.color = new THREE.Color(0x0000ff); // 设置材质的颜色为蓝色
    }

    initParam(data){
        this.layer_count = data.layer_count
        this.heightStep = data.heightStep
        this.currentMaxLayer=data.layer_count
        this.maxHeight=data.maxHeight
    }

    refreshLayerRange(data){
        if(!this.shader)return 
        this.currentMaxLayer=data.max
        this.currentMinLayer=data.min
        this.shader.uniforms.uCurrentMaxLayer = { value: this.currentMaxLayer }; 
        this.shader.uniforms.uCurrentMinLayer = { value: this.currentMinLayer };
    }

    //总层数
    layer_count = 1
    //层高 mm
    heightStep = 0.2
    //总高度
    maxHeight=0

    //当前层数
    currentMaxLayer=1
    currentMinLayer=1

    shader

    onBeforeCompile(shader, renderer){
        this.shader=shader
        // 创建高度参数纹理（核心修正点）
        const LAYER_COUNT = this.layer_count+1
        const layerTexture = new THREE.DataTexture(
            new Float32Array(LAYER_COUNT), // 每层高度值
            LAYER_COUNT, 1,
            THREE.RedFormat,
            THREE.FloatType
        );
        
        // 填充高度值：从0到100均匀分布
        const heightStep =this.heightStep ;
        for (let i = 0; i < LAYER_COUNT; i++) {
            layerTexture.image.data[i] = i * heightStep;
        }
        layerTexture.image.data[ LAYER_COUNT - 1 ] = this.maxHeight
        layerTexture.needsUpdate = true;

        // 绑定高度纹理（核心修正点）
        shader.uniforms.uHeightTexture = { value: layerTexture };
        shader.uniforms.uCurrentMaxLayer = { value: this.currentMaxLayer }; 
        shader.uniforms.uCurrentMinLayer = { value: this.currentMinLayer };

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
            uniform float uCurrentMaxLayer;
            uniform float uCurrentMinLayer;
            varying float vHeight;
            
            ${shader.fragmentShader}
        `;
        shader.fragmentShader = shader.fragmentShader.replace(
            'vec4 diffuseColor = vec4( diffuse, opacity );',
            `
            vec4 diffuseColor = vec4( diffuse, opacity );
            // 当前切割高度
            float currentMaxHeight = texelFetch(uHeightTexture, ivec2(uCurrentMaxLayer, 0), 0).r;
            float currentMinHeight = texelFetch(uHeightTexture, ivec2(uCurrentMinLayer, 0), 0).r;
            
            // 切割判断
            if (vHeight > currentMaxHeight) {
                discard;
            }

            if (vHeight < currentMinHeight) {
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