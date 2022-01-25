export default (jfn, values, data) => {
  const scopedData = jfn.apply(values[0], data)
  const scopedLogic = values[1]
  const initial = typeof values[2] !== 'undefined'
    ? jfn.apply(values[2], data)
    : null

  if (!Array.isArray(scopedData)) {
    // throw new Error('Array parameter of filter must be an array')
    return initial
  }

  const result = scopedData.reduce(
    function (accumulator, current, __index__) {
      return jfn.apply(
        scopedLogic,
        {
          data: data, // compat with CertLogic
          ...data,
          current: current,
          accumulator: accumulator,
          __index__
        }
      )
    },
    initial
  )
  return result
}
