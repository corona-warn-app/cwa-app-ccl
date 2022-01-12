'use strict'

module.exports = (jfn, values, data) => {
  const array = jfn.apply(values[0], data)
  if (Array.isArray(array)) return array.length
  return 0
}
