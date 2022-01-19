/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
'use strict'

const { expect } = require('chai')

const ccl = require('../../lib/ccl/ccl-main')

describe('dist/json-schema-checks', () => {
  context('check dist/ccl-configuration.json', () => {
    const configuration = require('./../../dist/ccl-configuration.json')

    it('is array', () => {
      expect(configuration).to.be.an('array')
    })

    if (Array.isArray(configuration)) {
      configuration.forEach((entry, idx) => {
        it(`entry ${idx + 1} matches schema`, async () => {
          const { errors } = await ccl.schema.validate(entry, 'https://ccl.coronawarn.app/ccl-configuration.json')
          expect(errors).to.be.empty
        })
      })
    }
  })
  context('check dist/ccl-de-0001.json', () => {
    const configuration = require('./../../dist/ccl-de-0001.json')

    it('matches schema', async () => {
      const { errors } = await ccl.schema.validate(configuration, 'https://ccl.coronawarn.app/ccl-configuration.json')
      expect(errors).to.be.empty
    })
  })
})
