/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
'use strict'

const { expect } = require('chai')
const path = require('path')
const fse = require('fs-extra')
const yaml = require('js-yaml')

const ccl = require('../../../../lib/ccl')

describe('ccl/functions/__i18n.getTextDescriptor', () => {
  const filenames = [
    'i18n.getQuantityDescriptor.yaml'
  ]
  const testCases = filenames.reduce((allTestCases, filename) => {
    const filepath = path.resolve(__dirname, `./../../../fixtures/ccl/${filename}`)
    const testCaseStr = fse.readFileSync(filepath)
    const testCases = yaml.load(testCaseStr)
      .map(it => {
        return {
          ...it,
          filename
        }
      })
    allTestCases.push(...testCases)
    return allTestCases
  }, [])

  testCases.forEach(testCase => {
    it(testCase.description, () => {
      const {
        functionName,
        parameters,
        exp
      } = testCase
      const act = ccl.evaluateFunction(functionName, parameters)
      expect(act).to.deep.equal(exp)
    })
  })
})
