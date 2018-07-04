'use strict'
// Template version: 1.3.1
// see http://vuejs-templates.github.io/webpack for documentation.

const path = require('path')

module.exports = {
  dev: {

    // Paths
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    proxyTable: {
      // '/tms': { // 只有这个路径下的数据走代理
      //   target: 'http://localhost:80',
      //   // target: 'http://apps.jd.com',
      //   changeOrigin: true  //是否跨域
      // },
      '/tms': { // 只有这个路径下的数据走代理
        // target: 'http://localhost:80',
        // target: 'https://uba.jd.com',
        target: 'http://jdctms.jd.com',
        changeOrigin: true  //是否跨域
      }
    },

    // Various Dev Server settings
    host: '0.0.0.0', // can be overwritten by process.env.HOST
    port: 8084, // can be overwritten by process.env.PORT, if port is in use, a free one will be determined
    disableHostCheck: true,
    autoOpenBrowser: false,
    errorOverlay: true,
    notifyOnErrors: true,
    poll: false, // https://webpack.js.org/configuration/dev-server/#devserver-watchoptions-

    
    /**
     * Source Maps
     */

    // https://webpack.js.org/configuration/devtool/#development
    devtool: 'cheap-module-eval-source-map',

    // If you have problems debugging vue-files in devtools,
    // set this to false - it *may* help
    // https://vue-loader.vuejs.org/en/options.html#cachebusting
    cacheBusting: true,

    cssSourceMap: true
  },

  build: {
    // Template for index.html
    // index: path.resolve(__dirname, '../server/src/views/dist/index.art'), //测试环境 自定义的html的静态输出目录
    index: path.resolve(__dirname, '../dist/index.html'), // 开发环境

    // Paths
    // assetsRoot: path.resolve(__dirname, '../server/public'), //测试环境 自定义的静态资源的输出目录，包含js css img
    assetsRoot: path.resolve(__dirname, '../dist'), // 开发环境

    assetsSubDirectory: 'static', // 静态资源的输出文件夹,即../server/public/static

    assetsPublicPath: '/', // 测试环境 输出的静态文件根路径(末尾需要加斜杠，否则router的js懒加载会有路径错误)
    // assetsPublicPath: '/tms/', // 开发环境

    /**
     * Source Maps
     */

    productionSourceMap: true,
    // https://webpack.js.org/configuration/devtool/#production
    devtool: '#source-map',

    // Gzip off by default as many popular static hosts such as
    // Surge or Netlify already gzip all static assets for you.
    // Before setting to `true`, make sure to:
    // npm install --save-dev compression-webpack-plugin
    productionGzip: false,
    productionGzipExtensions: ['js', 'css'],

    // Run the build command with an extra argument to
    // View the bundle analyzer report after build finishes:
    // `npm run build --report`
    // Set to `true` or `false` to always turn it on or off
    bundleAnalyzerReport: process.env.npm_config_report
  }
}
