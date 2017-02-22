import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'

export default {
  entry: 'index.js',
  format: 'umd',
  moduleName: 'd3',
  plugins: [
    nodeResolve({
      jsnext: true,
      main: true
    }),
    commonjs({
      // if false then skip sourceMap generation for CommonJS modules
      sourceMap: false  // Default: true
    })
  ]
}
