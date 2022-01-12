'use strict'

module.exports = (jfn, values, data) => {
  const target = jfn.apply(values[0], data)
  for (let i = 1; i < values.length; i += 1) {
    const value = jfn.apply(values[i], data)
    target.push(value)
  }
  return null
}
