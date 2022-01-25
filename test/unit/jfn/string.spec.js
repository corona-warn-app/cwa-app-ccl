/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai'

import executeJfnTestCaseFactory from './../../util/execute-jfn-test-case.js'

import tests from './../../fixtures/jfn/jfn-tests/string.spec.json'
const executeJfnTestCase = executeJfnTestCaseFactory({ expect })

describe('jfn/string', () => {
  tests.forEach(({ title, logic, data, exp }) => {
    it(title, () => {
      executeJfnTestCase({
        logic, data, exp
      })
    })
  })
})
