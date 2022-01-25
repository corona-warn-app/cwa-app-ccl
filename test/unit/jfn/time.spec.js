/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai'

import executeJfnTestCaseFactory from './../../util/execute-jfn-test-case.js'

import dynamicTests from './../../fixtures/jfn/jfn-tests/time.moment.spec.js'
const executeJfnTestCase = executeJfnTestCaseFactory({ expect })

describe('jfn/time', () => {
  dynamicTests.forEach(({ title, logic, data, exp, throws }) => {
    it(title, () => {
      executeJfnTestCase({
        logic, data, exp, throws
      })
    })
  })
})
