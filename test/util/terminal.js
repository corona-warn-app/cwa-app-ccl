'use strict'

const chalk = require('chalk')
const stripAnsi = require('strip-ansi')
const yaml = require('js-yaml')

const repeat = (n, c) => Array.from(new Array(n)).map(() => c).join('')
const indent = (n, str) => str.split('\n').map(s => `${repeat(n, ' ')}${s}`).join('\n')
const title = str => {
  const len = stripAnsi(str).length
  return `${chalk.bold(str)}\n${repeat(len, '=')}`
}
const _yaml = (obj, { indentation = 0 } = {}) => indent(indentation, yaml.dump(obj))
const passOrFail = boolean => `${boolean ? chalk.green('PASS') : chalk.red('FAIL')}`
const prefixLine = (str, prefix) => {
  return str.split('\n')
    .map(it => `${prefix}${it}`)
    .join('\n')
}

module.exports = {
  repeat,
  indent,
  title,
  yaml: _yaml,
  passOrFail,
  prefixLine
}
