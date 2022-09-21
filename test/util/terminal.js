import chalk from 'chalk'
import stripAnsi from 'strip-ansi'
import yaml from 'js-yaml'

const repeat = (n, c) => Array.from(new Array(n)).map(() => c).join('')
const indent = (n, str) => str.split('\n').map(s => `${repeat(n, ' ')}${s}`).join('\n')
const title = str => {
  const len = stripAnsi(str).length
  return `${chalk.bold(str)}\n${repeat(len, '=')}`
}
const dumpJsonSafe = obj => {
  try {
    return JSON.stringify(obj)
  } catch (err) {
    return chalk.red(err)
  }
}
const dumpYamlSafe = obj => {
  try {
    return yaml.dump(obj)
  } catch (err) {
    return `${chalk.red(err)}\nFalling back to JSON:\n${dumpJsonSafe(obj)}`
  }
}
const _yaml = (obj, { indentation = 0 } = {}) => indent(indentation, dumpYamlSafe(obj))
const json = (obj, { indentation = 0 } = {}) => indent(indentation, dumpJsonSafe(obj))
const passOrFail = boolean => `${boolean ? chalk.green('PASS') : chalk.red('FAIL')}`
const prefixLine = (str, prefix) => {
  return str.split('\n')
    .map(it => `${prefix}${it}`)
    .join('\n')
}

export default {
  repeat,
  indent,
  title,
  yaml: _yaml,
  json,
  passOrFail,
  prefixLine
}
