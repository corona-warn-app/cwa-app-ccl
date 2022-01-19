/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
'use strict'

const { expect } = require('chai')
const jfn = require('../../lib/jfn/jfn-main')
const executeJfnTestCase = require('./../util/execute-jfn-test-case')({ expect })

const { testCases } = require('../../dist/ccl-test-cases.gen.json')

describe('dist/ccl-test-cases', () => {
  testCases.forEach(({ title, functions, useDefaultCCLConfiguration, evaluateFunction, logic, data, exp, throws }) => {
    it(title, () => {
      if (useDefaultCCLConfiguration === true) {
        const def = require('../../dist/ccl-configuration.json')
        def.forEach(it => {
          it.Logic.JfnDescriptors.forEach(it => {
            jfn.add_function(it.name, it.definition)
          })
        })
      }

      executeJfnTestCase({
        functions,
        evaluateFunction,
        logic,
        data,
        exp,
        throws
      })
    })
  })
})
