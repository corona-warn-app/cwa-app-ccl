'use strict'

const moment = require('moment')

module.exports = (jfn, values, data) => {
  const left = jfn.apply(values[0], data)
  const right = jfn.apply(values[1], data)
  const third = jfn.apply(values[2], data)
  const l = moment.utc(left)
  const r = moment.utc(right)
  const t = moment.utc(third)
  if (third) {
    return !l.isAfter(r) && !r.isAfter(t)
  }
  return !l.isAfter(r)
}
