/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
'use strict'

const { expect } = require('chai')
const fse = require('fs-extra')
const path = require('path')

const jfn = require('../../../lib/jfn/jfn-main')

const tests = fse.readJSONSync(path.resolve(__dirname, './../../fixtures/jfn/jfn-function-tests/is-same-person.spec.json'))

describe('jfn/function-tests', () => {
  tests.forEach(({ title, functions, functionName, scenarios }) => {
    context(title, () => {
      functions.forEach(({ name, definition }) => {
        jfn.add_function(name, definition)
      })

      scenarios.forEach(({ title, parameters, exp, throws }) => {
        it(title, () => {
          if (throws === true) {
            expect(() => {
              jfn.evaluateFunction(functionName, parameters)
            }).to.throw()
          } else {
            const act = jfn.evaluateFunction(functionName, parameters)
            expect(act).to.deep.equal(exp)
          }
        })
      })
    })
  })
})
