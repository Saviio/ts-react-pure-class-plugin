const path = require('path')
const webpack = require('webpack')

module.exports = {
  entry: './index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    noParse: [
      /benchmark/,
      /lodash/
    ],
    rules: [
      {
        test: /\.(jsx|tsx|js|ts)$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
          compilerOptions: {
            module: 'esnext',
          },
        },
        exclude: /node_modules/,
      }
    ],
  },
  optimization: {
    minimize: false,
  },
  plugins: [
    new webpack.ProvidePlugin({
      'window.jQuery': 'lodash'
    }),
  ]
}
