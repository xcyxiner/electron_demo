const path = require('path');

module.exports = {
  // 静态资源路径
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  
  // 构建输出目录
  outputDir: path.resolve(__dirname, 'dist'),
  
  configureWebpack: {
    // 入口文件指向 Vue 渲染进程
    entry: './src/renderer/main.js',
    target: 'web', // 确保渲染进程使用 Web 目标
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src/renderer')
      }
    }
  },

  // 开发服务器配置（用于热重载）
  devServer: {
    port: 8080,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },

  // 链式配置 Electron 主进程
  chainWebpack: (config) => {
    // 主进程构建配置
    config.module.rule('node')
      .test(/\.node$/)
      .use('node-loader')
      .loader('node-loader');

      config.module
      .rule('worker')
      .test(/\.worker\.js$/)
      .use('worker-loader')
      .loader('worker-loader')
      .options({ 
        inline: 'fallback',
        filename: 'renderer/worker/[name].[hash].worker.js'
      })
  }
};