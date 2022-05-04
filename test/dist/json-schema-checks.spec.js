/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai'
import ccl from '../../lib/ccl/ccl-main.js'
import { readJsonSync } from './../../lib/util/local-file.js'
import {
  dist as distFixtures
} from './../util/fixtures.js'

describe('dist/json-schema-checks', () => {
  context('check dist/ccl-configuration.json', () => {
    const cclConfiguration = readJsonSync('dist/ccl-configuration.json')
    it('is array', () => {
      expect(cclConfiguration).to.be.an('array')
    })

    if (Array.isArray(cclConfiguration)) {
      cclConfiguration.forEach((entry, idx) => {
        it(`entry ${idx + 1} matches schema`, async () => {
          const { errors } = await ccl.schema.validate(entry, 'https://ccl.coronawarn.app/ccl-configuration.json')
          console.log(errors)
          expect(errors).to.be.empty
        })
      })
    }
  })

  distFixtures
    .findAllSync(/ccl-de-\d+.json$/)
    .forEach(relativeFilepath => {
      context(`check ${relativeFilepath}`, () => {
        const cclDe0001 = readJsonSync(relativeFilepath)
        it('matches schema', async () => {
          const { errors } = await ccl.schema.validate(cclDe0001, 'https://ccl.coronawarn.app/ccl-configuration.json')
          console.log(errors)
          expect(errors).to.be.empty
        })
      })
    })
})
