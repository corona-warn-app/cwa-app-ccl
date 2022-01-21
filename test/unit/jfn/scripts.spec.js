/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai'

import executeJfnTestCaseFactory from './../../util/execute-jfn-test-case.js'

import tests from './../../fixtures/jfn/jfn-tests/script.spec.json'
const executeJfnTestCase = executeJfnTestCaseFactory({ expect })

describe('jfn/scripts', () => {
  tests.forEach(({ title, logic, data, exp, throws }) => {
    it(title, () => {
      executeJfnTestCase({
        logic, data, exp, throws
      })
    })
  })
})
