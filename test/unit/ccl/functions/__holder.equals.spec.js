/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai'
import path from 'path'
import fse from 'fs-extra'
import { fileURLToPath } from 'url'

import ccl from '../../../../lib/ccl/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

describe('ccl/functions/__holder.equals', () => {
  const filenames = [
    'dcc-holder-comparison.gen.json'
  ]
  const testCases = filenames.reduce((allTestCases, filename) => {
    const filepath = path.resolve(__dirname, `./../../../fixtures/ccl/${filename}`)
    const { data: testCases } = fse.readJsonSync(filepath)
    allTestCases.push(...testCases)
    return allTestCases
  }, [])

  testCases.filter(it => it.ignore !== true).forEach(testCase => {
    it(testCase.description, () => {
      const {
        actHolderA,
        actHolderB,
        expIsSameHolder
      } = testCase
      const actIsSameHolder = ccl.evaluateFunction('__holder.equals', {
        holderA: actHolderA,
        holderB: actHolderB
      })

      expect(actIsSameHolder).to.deep.equal(expIsSameHolder)
    })
  })
})
