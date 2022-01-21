/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai'

import executeJfnTestCaseFactory from './../../util/execute-jfn-test-case.js'

import tests from './../../fixtures/jfn/jfn-tests/array.spec.json'
const executeJfnTestCase = executeJfnTestCaseFactory({ expect })

describe('jfn/array', () => {
  tests.forEach(({ title, logic, data, exp, throws }) => {
    it(title, () => {
      executeJfnTestCase({
        logic, data, exp, throws
      })
    })
  })
})
