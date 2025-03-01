const path = require('path');
const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  // 静态资源路径
  publicPath: isProduction ? './' : '/',

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
    },
    plugins: [
      new (require("webpack")).DefinePlugin({
        __VUE_OPTIONS_API__: JSON.stringify(true),
        __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false), // 解决报错
      }),
    ],
  },

  // 开发服务器配置（用于热重载）
  devServer: {
    port: 3000,          // 开发服务器运行在 3000 端口
    hot: true,
    open: false,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
  },

  // 链式配置 Electron 主进程
  chainWebpack: (config) => {
    // 主进程构建配置
    config.module.rule('node')
      .test(/\.node$/)
      .use('node-loader')
      .loader('node-loader');
  },
};