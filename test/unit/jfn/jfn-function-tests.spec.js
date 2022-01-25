/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai'

import executeJfnTestCaseFactory from './../../util/execute-jfn-test-case.js'

import tests from './../../fixtures/jfn/jfn-function-tests/is-same-person.spec.json'
const executeJfnTestCase = executeJfnTestCaseFactory({ expect })

describe('jfn/function-tests', () => {
  tests.forEach(({ title, functions, functionName, scenarios }) => {
    context(title, () => {
      scenarios.forEach(({ title, parameters, exp, throws }) => {
        it(title, () => {
          const evaluateFunction = {
            name: functionName,
            parameters
          }
          executeJfnTestCase({
            functions,
            evaluateFunction,
            exp,
            throws
          })
        })
      })
    })
  })
})
