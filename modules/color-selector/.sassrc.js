const pkg = require('./package.json')
const path = require('path')

module.exports = {
  input: pkg.css.source,
  includePaths: [path.join(__dirname, '../../node_modules'), 'node_modules'],
  output: [
    { outputStyle: 'nested', file: pkg.css.min },
    { outputStyle: 'compressed', file: pkg.css.main }
  ]
}