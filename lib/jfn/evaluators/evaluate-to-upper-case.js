'use strict'

module.exports = (jfn, values, data) => {
  const value = jfn.apply(values[0], data)
  if (typeof value === 'object') return ''
  return `${value}`.toUpperCase()
}
