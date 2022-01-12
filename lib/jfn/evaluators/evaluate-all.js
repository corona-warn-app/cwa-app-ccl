'use strict'

module.exports = (jfn, values, data) => {
  const scopedData = jfn.apply(values[0], data)
  const scopedLogic = values[1]
  const it = values[2]
  // All of an empty set is false. Note, some and none have correct fallback after the for loop
  if (!Array.isArray(scopedData) || !scopedData.length) {
    return false
  }

  for (let i = 0; i < scopedData.length; i += 1) {
    const result = it
      ? jfn.apply(scopedLogic, { ...data, [it]: scopedData[i] })
      : jfn.apply(scopedLogic, scopedData[i])
    if (!jfn.truthy(result)) {
      return false // First falsy, short circuit
    }
  }
  return true // All were truthy
}
