/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai'
import path from 'path'
import fse from 'fs-extra'
import yaml from 'js-yaml'
import { fileURLToPath } from 'url'

import ccl from '../../../../lib/ccl/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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

      // we only check DE texts
      const {
        de
      } = act.localizedText
      act.localizedText = { de }

      expect(act).to.deep.equal(exp)
    })
  })
})
