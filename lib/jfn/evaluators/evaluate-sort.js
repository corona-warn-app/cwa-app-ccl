export default (jfn, values, data) => {
  const scopedData = jfn.apply(values[0], data)
  const scopedLogic = values[1]

  if (!Array.isArray(scopedData)) {
    return []
  }

  const sorted = scopedData.slice(0).sort((a, b) => {
    const isFirstAfterSecond = jfn.apply(scopedLogic, { ...data, a, b })
    if (isFirstAfterSecond === true) return 1
    else if (isFirstAfterSecond === false) return -1
    else return 0
  })
  return sorted
}
