export default (jfn, values, data) => {
  const scopedData = jfn.apply(values[0], data)
  const scopedLogic = values[1]
  const it = values[2]

  if (!Array.isArray(scopedData)) {
    return []
  }
  if (it !== undefined && typeof it !== 'string') {
    throw new Error('Iteratee name must be a string')
  }

  if (it) {
    return scopedData.filter(function (datum) {
      return jfn.truthy(jfn.apply(scopedLogic, { ...data, [it]: datum }))
    })
  } else {
    // Return only the elements from the array in the first argument,
    // that return truthy when passed to the logic in the second argument.
    // For parity with JavaScript, reindex the returned array
    return scopedData.filter(function (datum) {
      return jfn.truthy(jfn.apply(scopedLogic, datum))
    })
  }
}
