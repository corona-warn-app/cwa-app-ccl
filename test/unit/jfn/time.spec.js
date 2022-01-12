/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
'use strict'

const { expect } = require('chai')
const moment = require('moment')

const jfn = require('../../../lib/jfn/jfn-main')

const dynamicTests = require('./../../fixtures/jfn/jfn-tests/time.moment.spec.js')

describe('jfn/time', () => {
  dynamicTests.forEach(({ title, logic, data, exp, throws }) => {
    it(title, () => {
      if (throws === true) {
        expect(() => {
          jfn.apply(logic, data)
        }).to.throw()
      } else {
        const act = jfn.apply(logic, data)
        if (title.includes('plusTime')) {
          expect(moment(act).toISOString()).to.equal(moment(exp).toISOString())
        } else {
          expect(act).to.equal(exp)
        }
      }
    })
  })
})
