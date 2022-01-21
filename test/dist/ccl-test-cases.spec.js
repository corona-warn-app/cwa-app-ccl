/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
'use strict'

const { expect } = require('chai')
const executeJfnTestCase = require('./../util/execute-jfn-test-case')({ expect })

const { testCases } = require('../../dist/ccl-test-cases.gen.json')

describe('dist/ccl-test-cases', () => {
  testCases.forEach(({ title, functions, evaluateFunction, logic, data, exp, throws }) => {
    it(title, () => {
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
