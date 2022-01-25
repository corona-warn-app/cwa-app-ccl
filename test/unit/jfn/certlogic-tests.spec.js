/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai'
import fse from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'

import {
  factory as jfnFactory
} from '../../../lib/jfn/jfn-main.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const directory = path.resolve(__dirname, './../../fixtures/jfn/certlogic-tests')

const testSuites = fse.readdirSync(directory)
  .filter(filepath => filepath.endsWith('.json'))
  .filter(filepath => !filepath.includes('extract'))
  // .filter(filepath => filepath.includes('reduce.json'))
  .map(filepath => fse.readJsonSync(path.resolve(directory, filepath)))

describe('jfn/certlogic', () => {
  testSuites.forEach(({ name, cases }) => {
    context(name, () => {
      cases.forEach(({ name, certLogicExpression, assertions }) => {
        context(name, () => {
          assertions.forEach(({ data, expected }) => {
            it(`with ${JSON.stringify(data)} returns ${JSON.stringify(expected)}`, () => {
              const jfn = jfnFactory()
              const act = jfn.apply(certLogicExpression, data)
              expect(act).to.deep.equal(expected)
            })
          })
        })
      })
    })
  })
})
