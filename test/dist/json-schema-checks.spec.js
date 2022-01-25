/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai'
import ccl from '../../lib/ccl/ccl-main.js'

import cclConfiguration from './../../dist/ccl-configuration.json'
import cclDe0001 from './../../dist/ccl-de-0001.json'

describe('dist/json-schema-checks', () => {
  context('check dist/ccl-configuration.json', () => {
    it('is array', () => {
      expect(cclConfiguration).to.be.an('array')
    })

    if (Array.isArray(cclConfiguration)) {
      cclConfiguration.forEach((entry, idx) => {
        it(`entry ${idx + 1} matches schema`, async () => {
          const { errors } = await ccl.schema.validate(entry, 'https://ccl.coronawarn.app/ccl-configuration.json')
          expect(errors).to.be.empty
        })
      })
    }
  })
  context('check dist/ccl-de-0001.json', () => {
    it('matches schema', async () => {
      const { errors } = await ccl.schema.validate(cclDe0001, 'https://ccl.coronawarn.app/ccl-configuration.json')
      expect(errors).to.be.empty
    })
  })
})
