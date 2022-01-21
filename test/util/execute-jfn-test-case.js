'use strict'

const moment = require('moment')
const jfnFactory = require('./../../lib/jfn').factory

const execute = ({ expect }) => ({
  functions,
  evaluateFunction,
  logic,
  data,
  exp,
  throws
}) => {
  const jfn = jfnFactory()
  if (Array.isArray(functions)) {
    functions.forEach(({ name, definition }) => {
      jfn.add_function(name, definition)
    })
  }

  if (evaluateFunction) {
    const {
      name, parameters
    } = evaluateFunction
    if (throws === true) {
      expect(() => {
        jfn.evaluateFunction(name, parameters)
      }).to.throw()
    } else {
      const act = jfn.evaluateFunction(name, parameters)
      expect(act).to.deep.equal(exp)
    }
  } else {
    if (throws === true) {
      expect(() => {
        jfn.apply(logic, data)
      }).to.throw()
    } else {
      const act = jfn.apply(logic, data)
      if (typeof exp === 'string' && /^\d{4}-\d{2}-\d{2}/.test(exp)) {
        expect(moment(act).toISOString()).to.deep.equal(moment(exp).toISOString())
      } else {
        expect(act).to.deep.equal(exp)
      }
    }
  }
}

module.exports = execute
