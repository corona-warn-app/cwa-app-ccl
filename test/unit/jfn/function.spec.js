/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
'use strict'

const { expect } = require('chai')
const fse = require('fs-extra')
const path = require('path')
const executeJfnTestCase = require('./../../util/execute-jfn-test-case')({ expect })

const tests = fse.readJSONSync(path.resolve(__dirname, './../../fixtures/jfn/jfn-tests/function.spec.json'))

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
