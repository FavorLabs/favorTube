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
  devServer: { https: true },
  productionSourceMap: isDev,
  configureWebpack: config => {
    config.devtool = isDev ? 'cheap-module-eval-source-map' : false;
    // if (process.env.NODE_ENV === 'production') {
    //   config.plugins.push(
    //     new TerserPlugin({
    //       cache: true,
	  //       sourceMap: false,
	  //       parallel: true,
    //       terserOptions: {
    //         ecma: undefined,
    //         warnings: false,
    //         parse: {},
    //         compress: {
    //           drop_console: true,
    //           drop_debugger: false,
    //           pure_funcs: ['console.log']
    //         }
    //       },
    //     }),
    //   )
    // }
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
    imagesRule
    .use('image-webpack-loader')
    .loader('image-webpack-loader')
    .options({
        bypassOnDebug: true,
        mozjpeg: { progressive: true, quality: 90 },
        optipng: { enabled: true },
        pngquant: { quality: [0.6, 0.65], speed: 4 },
        gifsicle: { interlaced: false }
    })
    .end()
  },
  publicPath: process.env.NODE_ENV === 'production'
      ? './'
      : '/',
}
