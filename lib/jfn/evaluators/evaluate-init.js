'use strict'

const evaluateLiteral = (jfn, values, data) => {
  const value = jfn.apply(values[1], data)
  if (value !== null && typeof value === 'object') {
    throw new Error('Cannot initialize literal with object or array')
  }
  return value
}

const evaluateObject = (jfn, values, data) => {
  let target = {}
  for (let i = 1; i < values.length;) {
    const value = values[i]
    if (value.spread && Array.isArray(value.spread)) {
      const obj = jfn.apply(value.spread[0], data)
      if (typeof obj !== 'object') {
        throw new Error('Spread for objects does not support non-objects')
      }
      target = {
        ...target,
        ...obj
      }
      i += 1
    } else {
      const property = jfn.apply(values[i], data)
      if (typeof property === 'object') {
        throw new Error('Key cannot be an object')
      }
      const value = jfn.apply(values[i + 1], data)
      target[property] = value
      i += 2
    }
  }
  return target
}

const evaluateArray = (jfn, values, data) => {
  const target = []
  for (let i = 1; i < values.length; i += 1) {
    const value = values[i]
    if (value.spread && Array.isArray(value.spread)) {
      const arr = jfn.apply(value.spread[0], data)
      if (!Array.isArray(arr)) {
        throw new Error('Spread for arrays only supports other arrays')
      }
      target.push(...arr)
    } else {
      const value = jfn.apply(values[i], data)
      target.push(value)
    }
  }
  return target
}

module.exports = (jfn, values, data) => {
  const type = jfn.apply(values[0], data)
  if (type === 'literal') {
    return evaluateLiteral(jfn, values, data)
  } else if (type === 'object') {
    return evaluateObject(jfn, values, data)
  } else if (type === 'array') {
    return evaluateArray(jfn, values, data)
  } else {
    throw new Error(`Not supported ${type}`)
  }
}
