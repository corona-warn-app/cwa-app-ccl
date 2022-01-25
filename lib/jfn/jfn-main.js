import jsonLogicFactory from 'json-logic-js'

import after from './evaluators/evaluate-after.js'
import all from './evaluators/evaluate-all.js'
import assign from './evaluators/evaluate-assign.js'
import before from './evaluators/evaluate-before.js'
import call from './evaluators/evaluate-call.js'
import concatenate from './evaluators/evaluate-concatenate.js'
import count from './evaluators/evaluate-count.js'
import declare from './evaluators/evaluate-declare.js'
import diffTime from './evaluators/evaluate-diff-time.js'
import evaluate from './evaluators/evaluate-evaluate.js'
import extractFromUVCI from './evaluators/evaluate-extract-from-uvci.js'
import filter from './evaluators/evaluate-filter.js'
import find from './evaluators/evaluate-find.js'
import init from './evaluators/evaluate-init.js'
import map from './evaluators/evaluate-map.js'
import none from './evaluators/evaluate-none.js'
import notAfter from './evaluators/evaluate-not-after.js'
import notBefore from './evaluators/evaluate-not-before.js'
import plusTime from './evaluators/evaluate-plus-time.js'
import push from './evaluators/evaluate-push.js'
import reduce from './evaluators/evaluate-reduce.js'
import replaceAll from './evaluators/evaluate-replace-all.js'
import returnOp from './evaluators/evaluate-return.js'
import script from './evaluators/evaluate-script.js'
import some from './evaluators/evaluate-some.js'
import sort from './evaluators/evaluate-sort.js'
import split from './evaluators/evaluate-split.js'
import toLowerCase from './evaluators/evaluate-to-lower-case.js'
import toUpperCase from './evaluators/evaluate-to-upper-case.js'
import trim from './evaluators/evaluate-trim.js'

export const factory = () => {
  const jfm = jsonLogicFactory()
  jfm.addFunction = (name, descriptor) => jfm.add_function(name, descriptor)
  jfm.evaluateFunction = (name, parameters) => jfm.evaluate_function(name, parameters)
  jfm.version = '1.0.0'

  const register = (name, code) => {
    const wrapper = (values, data) => code(jfm, values, data)
    jfm.add_custom_operation(name, wrapper)
  }

  register('after', after)
  register('all', all)
  register('assign', assign)
  register('before', before)
  register('call', call)
  register('concatenate', concatenate)
  register('count', count)
  register('declare', declare)
  register('diffTime', diffTime)
  register('evaluate', evaluate)
  register('extractFromUVCI', extractFromUVCI)
  register('filter', filter)
  register('find', find)
  register('init', init)
  register('map', map)
  register('none', none)
  register('not-after', notAfter)
  register('not-before', notBefore)
  register('plusTime', plusTime)
  register('push', push)
  register('reduce', reduce)
  register('replaceAll', replaceAll)
  register('return', returnOp)
  register('script', script)
  register('some', some)
  register('sort', sort)
  register('split', split)
  register('toLowerCase', toLowerCase)
  register('toUpperCase', toUpperCase)
  register('trim', trim)

  return jfm
}

export default factory()
