module.exports = {
  plugins: [
    require('postcss-import'),
    require('tailwindcss'),
    require('autoprefixer'),
    require('postcss-aspect-ratio-mini'),
    require('postcss-write-svg')({
      utf8: false
    }),
    require('cssnano')({
      'cssnano-preset-advanced': {
        zindex: false
      }
    })
  ]
}
