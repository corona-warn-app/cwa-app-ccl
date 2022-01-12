/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
'use strict'

const { expect } = require('chai')
const fse = require('fs-extra')
const path = require('path')

const jfn = require('../../../lib/jfn/jfn-main')

const tests = fse.readJSONSync(path.resolve(__dirname, './../../fixtures/jfn/jfn-tests/string.spec.json'))

describe('jfn/string', () => {
  tests.forEach(({ title, logic, data, exp }) => {
    it(title, () => {
      const act = jfn.apply(logic, data)
      expect(act).to.deep.equal(exp)
    })
  })
})
