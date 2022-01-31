/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai'
import { readJsonSync } from './../../lib/util/local-file.js'

import executeJfnTestCaseFactory from './../util/execute-jfn-test-case.js'

const executeJfnTestCase = executeJfnTestCaseFactory({ expect })
const { testCases } = readJsonSync('dist/ccl-test-cases.gen.json')

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
