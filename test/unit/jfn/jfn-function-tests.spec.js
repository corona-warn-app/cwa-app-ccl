/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
'use strict'

const { expect } = require('chai')
const fse = require('fs-extra')
const path = require('path')
const executeJfnTestCase = require('./../../util/execute-jfn-test-case')({ expect })

const tests = fse.readJSONSync(path.resolve(__dirname, './../../fixtures/jfn/jfn-function-tests/is-same-person.spec.json'))

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
