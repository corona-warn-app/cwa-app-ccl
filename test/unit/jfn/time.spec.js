/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
'use strict'

const { expect } = require('chai')
const executeJfnTestCase = require('./../../util/execute-jfn-test-case')({ expect })

const dynamicTests = require('./../../fixtures/jfn/jfn-tests/time.moment.spec.js')

describe('jfn/time', () => {
  dynamicTests.forEach(({ title, logic, data, exp, throws }) => {
    it(title, () => {
      executeJfnTestCase({
        logic, data, exp, throws
      })
    })
  })
})
