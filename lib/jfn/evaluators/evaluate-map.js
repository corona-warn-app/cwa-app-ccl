'use strict'

module.exports = (jfn, values, data) => {
  const scopedData = jfn.apply(values[0], data)
  const scopedLogic = values[1]
  const it = values[2]

  if (!Array.isArray(scopedData)) {
    return []
  }

  if (it) {
    return scopedData.map(function (datum) {
      return jfn.apply(scopedLogic, { ...data, [it]: datum })
    })
  } else {
    return scopedData.map(function (datum) {
      return jfn.apply(scopedLogic, datum)
    })
  }
}
