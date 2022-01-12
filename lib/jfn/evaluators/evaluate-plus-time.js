'use strict'

const moment = require('moment')

module.exports = (jfn, values, data) => {
  const dateStr = jfn.apply(values[0], data)
  const amount = jfn.apply(values[1], data)
  const unit = jfn.apply(values[2], data)

  if (typeof dateStr !== 'string') {
    throw new Error('DateStr parameter of plusTime must be a string')
  }
  if (typeof amount !== 'number') {
    throw new Error('Amount parameter of plusTime must be an integer')
  }
  const supportedUnits = [
    'second', 'minute', 'hour', 'day', 'month', 'year'
  ]
  if (!supportedUnits.includes(unit)) {
    throw new Error('UnitOfTime parameter of plusTime must be a supported value')
  }

  const mom = moment.utc(dateStr)
  if (!mom.isValid()) {
    throw new Error('Timestamp parameter of plusTime must be date-parsable')
  }

  const result = mom
    .add(amount, unit)
    .toISOString()
  // console.log('result', result)
  return result
}
