/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
'use strict'

const { expect } = require('chai')
const moment = require('moment')

const ccl = require('../../../lib/ccl')
// const jfn = require('../../../lib/jfn/jfn-main')
const dgc = require('../../util/dgc/dgc-main')

describe.skip('ccl/functions/getVaccinationStateShortText', () => {
  it('test', async () => {
    const input = {
      now: {
        timestamp: 1640854800,
        localDate: '2021-12-30',
        localDateTime: '2021-12-30T10:00:00+01:00',
        utcDate: '2021-12-30',
        utcDateTime: '2021-12-30T09:00:00Z'
      },
      dt: '2021-12-20'
    }

    // const results = await ccl.schema.common.systemTimeDependentTextResolverInput.validate(input)
    const results = await ccl.schema.functions.getVaccinationStateShortText.input.validate(input)
    console.log('results', results)
    expect(results.errors, JSON.stringify(results.errors, null, '  ')).to.be.empty

    const output = ccl.evaluateFunction('getVaccinationStateShortText', input)

    console.log('output', output)

    const results2 = await ccl.schema.functions.getVaccinationStateShortText.output.validate(output)
    console.log('results2', results2)
    expect(results2.errors, JSON.stringify(results2.errors, null, '  ')).to.be.empty
  })

  context.skip('vaccinated with Moderna 1/2 at t0', () => {
    let input, output
    let moderna12BarcodeData

    before(async () => {
      const t0 = moment()
      const { dccDescriptor } = dgc.data.presets.findPreset({ type: 'vc', idOrName: 'moderna12' })
      dccDescriptor.dccOverwrites = dccDescriptor.dccOverwrites || []
      dccDescriptor.dccOverwrites.push(`v.0.dt=${t0.format('YYYY-MM-DD')}`)
      const {
        barcodeData
      } = await dgc.generate(dccDescriptor)
      moderna12BarcodeData = barcodeData

      const mapBarcodeDataToCertificate = (barcodeData, { validityState }) => {
        const {
          iss, iat, exp,
          coseProtectedHeader, coseUnprotectedHeader,
          dgc: hcert
        } = dgc.decode.fromBarcodeData(barcodeData)
        const kid = dgc.util.getKID(coseProtectedHeader, coseUnprotectedHeader)
        const kidStr = kid.toString('base64')
        return {
          cose: {
            kid: kidStr
          },
          cwt: {
            iss, iat, exp
          },
          hcert,
          validityState
        }
      }

      const mapMomentToNow = mom => {
        return {
          timestamp: moment(mom).unix(),
          localDate: moment(mom).format('YYYY-MM-DD'),
          localDateTime: moment(mom).toISOString(),
          utcDate: moment(mom).utc().format('YYYY-MM-DD'),
          utcDateTime: moment(mom).utc().toISOString()
        }
      }

      // console.log(mapBarcodeDataToCertificate(barcodeData, { validityState: 'VALID' }))

      input = {
        os: 'android',
        language: 'en',
        now: mapMomentToNow(t0),
        certificates: [
          moderna12BarcodeData
        ].map(it => mapBarcodeDataToCertificate(it, { validityState: 'VALID' })),
        validationRules: []
      }
    })

    it('test', () => {
      output = ccl.api.getDccWalletInfo(input)
      console.log(JSON.stringify(output, null, '  '))
    })
  })
})
