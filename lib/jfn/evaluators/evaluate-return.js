'use strict'

module.exports = (jfn, values, data) => {
  const err = new Error('RETURN')
  err.return = true
  err.data = jfn.apply(values[0], data)
  throw err
}
