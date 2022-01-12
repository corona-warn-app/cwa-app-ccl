'use strict'

module.exports = (jfn, values, data) => {
  return values.map(it => {
    return jfn.apply(it, data)
  }).filter(it => {
    return !(it instanceof Object)
  }).join('')
}
