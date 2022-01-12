/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
'use strict'

const { expect } = require('chai')
const fse = require('fs-extra')
const path = require('path')

const jfn = require('../../../lib/jfn/jfn-main')

const tests = fse.readJSONSync(path.resolve(__dirname, './../../fixtures/jfn/jfn-tests/function.spec.json'))

describe('jfn/function', () => {
  tests.forEach(({ title, functions, evaluateFunction, exp, throws }) => {
    it(title, () => {
      functions.forEach(({ name, definition }) => {
        jfn.add_function(name, definition)
      })
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
    })
  })
})
