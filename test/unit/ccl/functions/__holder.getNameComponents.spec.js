/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai'
import path from 'path'
import fse from 'fs-extra'
import { fileURLToPath } from 'url'

import ccl from '../../../../lib/ccl/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

describe('ccl/functions/__holder.getNameComponents', () => {
  const filenames = [
    'dcc-holder-name-components.gen.json'
  ]
  const testCases = filenames.reduce((allTestCases, filename) => {
    const filepath = path.resolve(__dirname, `./../../../fixtures/ccl/${filename}`)
    const { data: testCases } = fse.readJsonSync(filepath)
    allTestCases.push(...testCases)
    return allTestCases
  }, [])

  testCases.forEach(testCase => {
    it(testCase.description, () => {
      const {
        actName,
        expNameComponents
      } = testCase
      const actNameComponents = ccl.evaluateFunction('__holder.getNameComponents', {
        name: actName
      })

      expect(actNameComponents).to.deep.equal(expNameComponents)
    })
  })
})
