'use strict'

module.exports = (jfn, values, data) => {
  const value = jfn.apply(values[0], data)
  const searchValue = jfn.apply(values[1], data)
  const newValue = jfn.apply(values[2], data)
  if (typeof value === 'object') return ''
  if (typeof searchValue === 'object') return value
  if (typeof newValue === 'object') return value
  const result = `${value}`.split(searchValue).join(newValue)
  return result
}
