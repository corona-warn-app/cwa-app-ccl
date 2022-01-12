'use strict'

module.exports = (jfn, values, data) => {
  const value = jfn.apply(values[0], data)
  const separator = jfn.apply(values[1], data)
  if (typeof value === 'object') return []
  if (typeof separator === 'object') return [`${value}`]
  return `${value}`.split(`${separator}`)
}
