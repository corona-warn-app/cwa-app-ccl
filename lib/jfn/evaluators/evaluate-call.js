export default (jfn, values, data) => {
  const name = values[0]
  if (typeof name !== 'string') throw new Error('Function name must be a string')
  const fn = jfn.get_function(name)

  if (!fn) {
    throw new Error(`No such function ${name}`)
  }

  const logic = fn.logic
  const parameters = values[1] === null || values[1] === undefined
    ? {}
    : values[1]

  if (Array.isArray(parameters) || typeof parameters !== 'object') {
    throw new Error('Parameters must be an object')
  }

  const scopedData = fn.parameters.reduce((scopedData, param) => {
    if (parameters[param.name] !== undefined) scopedData[param.name] = jfn.apply(parameters[param.name], data)
    else scopedData[param.name] = param.default
    return scopedData
  }, {})

  const result = jfn.apply({ script: logic }, scopedData)

  return result
}
