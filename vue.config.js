const path = require('path')
const apiMocker = require('mocker-api')

const port = process.env.port || process.env.npm_config_port || 8080

module.exports = {
  pages: {
    admin: {
      entry: 'src/modules/admin/main.js',
      template: 'public/index.html',
      filename: 'admin/index.html',
      title: 'Agile 管理后台',
      chunks: ['vendor', 'element', 'agile', 'admin']
    },
    mobile: {
      entry: 'src/modules/mobile/main.js',
      template: 'public/index.html',
      filename: 'mobile/index.html',
      title: 'Agile 移动端',
      chunks: ['vendor', 'agile', 'mobile']
    }
  },
  devServer: {
    port: port,
    before (app) {
      apiMocker(app, [path.resolve('./mocker/admin/index.js'), path.resolve('./mocker/mobile/index.js')])
    }
  },
  chainWebpack: config => {
    config.resolve.alias
      .set('@core', path.resolve('src/core'))
      .set('@admin', path.resolve('src/modules/admin'))
      .set('@mobile', path.resolve('src/modules/mobile'))

    config.optimization.splitChunks(
      {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            chunks: 'initial',
            name: 'vendor',
            priority: 10,
            enforce: true
          },
          element: {
            test: /[\\/]node_modules[\\/]_?element-ui(.*)/,
            name: 'element',
            priority: 20
          },
          agile: {
            test: /[\\/]src\/core[\\/]/,
            name: 'agile',
            priority: 5
          }
        }
      }
    )
  }
}
