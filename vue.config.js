const TerserPlugin = require('terser-webpack-plugin');

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
  productionSourceMap: false,
  configureWebpack: config => {
    config.devtool = false;
    if (process.env.NODE_ENV === 'production') {
      config.plugins.push(
        new TerserPlugin({
          cache: true,
	        sourceMap: false,
	        parallel: true,
          terserOptions: {
            ecma: undefined,
            warnings: false,
            parse: {},
            compress: {
              drop_console: true,
              drop_debugger: false,
              pure_funcs: ['console.log']
            }
          },
        }),
      )
    }
  },
  publicPath: process.env.NODE_ENV === 'production'
      ? './'
      : '/',
}
