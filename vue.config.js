const registerRouter = require('./backend/router')
// vue.config.js是可以用来修改webpack规则的文件
module.exports = {
  css: {
    loaderOptions: {
      sass: {
        // 全局引入变量和 mixin
        additionalData: `
          @import "@/assets/scss/variable.scss";
          @import "@/assets/scss/mixin.scss";
        `
      }
    }
  },
  devServer: {
    before(app) {
      registerRouter(app)
    },
    port: 9090
  },
  configureWebpack: (config) => {
    if (process.env.npm_config_report) {
      // npm_config_report 会在run build执行时为true
      // BundleAnalyzerPlugin
      const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
      config.plugins.push(new BundleAnalyzerPlugin())
    }
  },
  productionSourceMap: false,
  publicPath: process.env.NODE_ENV === 'production' ? '/music-next/' : '/'
}
