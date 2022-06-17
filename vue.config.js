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
  publicPath: process.env.NODE_ENV === 'production'
      ? './'
      : '/',
}
