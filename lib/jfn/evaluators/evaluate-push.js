'use strict'

module.exports = (jfn, values, data) => {
  const [target, ...newElements] = values
  const arr = jfn.apply(target, data)

  if (!Array.isArray(arr)) {
    throw new Error('First parameter of push must be an array')
  }

  return newElements.reduce((arr, el) => {
    const value = jfn.apply(el, data)
    return [...arr, value]
  }, arr)
}
