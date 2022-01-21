/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
'use strict'

const { expect } = require('chai')
const fse = require('fs-extra')
const path = require('path')

const jfnFactory = require('../../../lib/jfn/jfn-main').factory

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
