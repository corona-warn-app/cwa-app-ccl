/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
'use strict'

const { expect } = require('chai')
const moment = require('moment')

const jfn = require('../../lib/jfn/jfn-main')

const { testCases } = require('../../dist/ccl-test-cases.gen.json')

describe('dist/ccl-test-cases', () => {
  testCases.forEach(({ title, functions, useDefaultCCLConfiguration, evaluateFunction, logic, data, exp, throws }) => {
    it(title, () => {
      if (Array.isArray(functions)) {
        functions.forEach(({ name, definition }) => {
          jfn.add_function(name, definition)
        })
      }

      if (useDefaultCCLConfiguration === true) {
        const def = require('../../dist/ccl-configuration.json')
        def.forEach(it => {
          it.Logic.JfnDescriptors.forEach(it => {
            jfn.add_function(it.name, it.definition)
          })
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
    })
  })
})
