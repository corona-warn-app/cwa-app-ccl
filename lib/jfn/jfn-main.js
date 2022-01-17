'use strict'

const jsonLogic = require('json-logic-js')

const jfm = jsonLogic
jfm.addFunction = (name, descriptor) => jsonLogic.add_function(name, descriptor)
jfm.evaluateFunction = (name, parameters) => jsonLogic.evaluate_function(name, parameters)
jfm.version = '1.0.0'

const register = (name, code) => {
  const wrapper = (values, data) => code(jfm, values, data)
  jsonLogic.add_custom_operation(name, wrapper)
}

register('after', require('./evaluators/evaluate-after'))
register('all', require('./evaluators/evaluate-all'))
register('assign', require('./evaluators/evaluate-assign'))
register('before', require('./evaluators/evaluate-before'))
register('call', require('./evaluators/evaluate-call'))
register('concatenate', require('./evaluators/evaluate-concatenate'))
register('count', require('./evaluators/evaluate-count'))
register('declare', require('./evaluators/evaluate-declare'))
register('diffTime', require('./evaluators/evaluate-diff-time'))
register('evaluate', require('./evaluators/evaluate-evaluate'))
register('extractFromUVCI', require('./evaluators/evaluate-extract-from-uvci'))
register('filter', require('./evaluators/evaluate-filter'))
register('find', require('./evaluators/evaluate-find'))
register('init', require('./evaluators/evaluate-init'))
register('map', require('./evaluators/evaluate-map'))
register('none', require('./evaluators/evaluate-none'))
register('not-after', require('./evaluators/evaluate-not-after'))
register('not-before', require('./evaluators/evaluate-not-before'))
register('plusTime', require('./evaluators/evaluate-plus-time'))
register('push', require('./evaluators/evaluate-push'))
register('reduce', require('./evaluators/evaluate-reduce'))
register('replaceAll', require('./evaluators/evaluate-replace-all'))
register('return', require('./evaluators/evaluate-return'))
register('script', require('./evaluators/evaluate-script'))
register('some', require('./evaluators/evaluate-some'))
register('sort', require('./evaluators/evaluate-sort'))
register('split', require('./evaluators/evaluate-split'))
register('toLowerCase', require('./evaluators/evaluate-to-lower-case'))
register('toUpperCase', require('./evaluators/evaluate-to-upper-case'))
register('trim', require('./evaluators/evaluate-trim'))

module.exports = jfm
