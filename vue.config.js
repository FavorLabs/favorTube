// const TerserPlugin = require('terser-webpack-plugin');
const isDev = process.env.NODE_ENV === 'development';

module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  pages: {
    index: {
      entry: 'src/main.js',
      title: 'FavorTube'
    }
  },
  // devServer: { https: true },
  productionSourceMap: isDev,
  configureWebpack: config => {
    config.devtool = isDev ? 'cheap-module-eval-source-map' : false;
  },
  chainWebpack: config => {
    // config.plugins.delete('prefetch-index');
    const imagesRule = config.module.rule('images');
    imagesRule
    .test(/\.(png|jpeg|jpg)$/)
    .use("url-loader")
    .loader("url-loader").options({
      limit: 1024*20,
      name:"img/[name].[ext]"
    })
    .end()
  },
  publicPath: process.env.NODE_ENV === 'production'
      ? './'
      : '/',
}
