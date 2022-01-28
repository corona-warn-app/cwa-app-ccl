/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai'
import fse from 'fs-extra'
import path from 'path'
import yaml from 'js-yaml'
import { fileURLToPath } from 'url'

import ccl from '../../../lib/ccl/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const filepath = path.resolve(__dirname, './../../fixtures/ccl/ccl-text-descriptors.yaml')
const testCasesStr = fse.readFileSync(filepath, 'utf-8')
const testCases = yaml.load(testCasesStr)

describe.only('ccl/ccl-util#formatText', () => {
  testCases.forEach(testCase => {
    it(testCase.description, () => {
      testCase.assertions.forEach(({ languageCode, text }) => {
        const act = ccl.util.formatText(testCase.textDescriptor, languageCode, {})
        expect(act, `text for ${languageCode}`).to.equal(text)
      })
    })
  })
})
