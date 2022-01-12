'use strict'

module.exports = (jfn, values, data) => {
  const expression = jfn.apply(values[0], data)
  const parameters = jfn.apply(values[1], data)
  return jfn.apply(expression, parameters)
}
