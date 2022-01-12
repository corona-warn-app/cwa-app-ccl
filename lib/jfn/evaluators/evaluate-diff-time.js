'use strict'

const moment = require('moment')

module.exports = (jfn, values, data) => {
  const left = jfn.apply(values[0], data)
  const right = jfn.apply(values[1], data)
  const unit = jfn.apply(values[2], data)

  if (typeof left !== 'string') {
    throw new Error('First parameter of diffTime must be a string')
  }
  if (typeof right !== 'string') {
    throw new Error('Second parameter of diffTime must be a string')
  }
  const supportedUnits = [
    'second', 'minute', 'hour', 'day', 'month', 'year'
  ]
  if (!supportedUnits.includes(unit)) {
    throw new Error('UnitOfTime parameter of plusTime must be a supported value')
  }

  const leftMom = moment.utc(left)
  if (!leftMom.isValid()) {
    throw new Error('First parameter of diffTime must be date-parsable')
  }
  const rightMom = moment.utc(right)
  if (!rightMom.isValid()) {
    throw new Error('Second parameter of diffTime must be date-parsable')
  }

  const result = leftMom
    .diff(rightMom, unit)
  return result
}
