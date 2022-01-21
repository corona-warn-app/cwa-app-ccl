/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai'

import executeJfnTestCaseFactory from './../util/execute-jfn-test-case.js'

import testCaseFile from '../../dist/jfn-test-cases.gen.json'
const executeJfnTestCase = executeJfnTestCaseFactory({ expect })

const { testCases } = testCaseFile

describe('dist/jfn-test-cases', () => {
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
