/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai'

import executeJfnTestCaseFactory from './../../util/execute-jfn-test-case.js'

import tests from './../../fixtures/jfn/jfn-tests/function.spec.json'
const executeJfnTestCase = executeJfnTestCaseFactory({ expect })

describe('jfn/function', () => {
  tests.forEach(({ title, functions, evaluateFunction, exp, throws }) => {
    it(title, () => {
      executeJfnTestCase({
        functions,
        evaluateFunction,
        exp,
        throws
      })
    })
  })
})
