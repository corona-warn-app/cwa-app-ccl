'use strict'

module.exports = (jfn, values, data) => {
  const scopedData = jfn.apply(values[0], data)
  const scopedLogic = values[1]
  const it = values[2]

  if (!Array.isArray(scopedData)) {
    return null
  }
  if (it) {
    return scopedData.find(function (datum) {
      return jfn.apply(scopedLogic, { ...data, [it]: datum })
    }) || null
  } else {
    return scopedData.find(function (datum) {
      return jfn.apply(scopedLogic, datum)
    }) || null
  }
}
