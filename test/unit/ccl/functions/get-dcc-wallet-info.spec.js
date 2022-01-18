/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
'use strict'

const { expect } = require('chai')
const moment = require('moment')

const ccl = require('./../../../../lib/ccl')
// const jfn = require('./../../../lib/jfn/jfn-main')
const dcc = require('../../../util/dcc/dcc-main')

describe.skip('ccl/functions/get-dcc-wallet-info', () => {
  context('test', () => {
    let input, output

    before(() => {
      input = {
        os: 'android',
        language: 'en',
        now: {
          timestamp: 1640854800,
          localDate: '2021-12-30',
          localDateTime: '2021-12-30T10:00:00+01:00',
          utcDate: '2021-12-30',
          utcDateTime: '2021-12-30T09:00:00Z'
        },
        certificates: [
          {
            cose: {
              kid: 'IyG53x+1zj0='
            },
            cwt: {
              iss: 'DE',
              iat: 1640691110,
              exp: 1672227110
            },
            hcert: {
              ver: '1.3.0',
              nam: {
                fn: 'Baxter',
                gn: 'Henrietta',
                fnt: 'BAXTER',
                gnt: 'HENRIETTA'
              },
              dob: '1985-10-14',
              v: [
                {
                  ci: 'URN:UVCI:01DE/IZSAP00A/3Y3DWEIPGJYQVFUXNQ2OWN#B',
                  co: 'DE',
                  dn: 3,
                  dt: '2021-12-01',
                  is: 'Robert Koch-Institut',
                  ma: 'ORG-100031184',
                  mp: 'EU/1/20/1507',
                  sd: 3,
                  tg: '840539006',
                  vp: '1119349007'
                }
              ]
            },
            validityState: 'VALID'
          },
          {
            cose: {
              kid: 'IyG53x+1zj0='
            },
            cwt: {
              iss: 'DE',
              iat: 1640691110,
              exp: 1672227110
            },
            hcert: {
              ver: '1.3.0',
              nam: {
                fn: 'Baxter',
                gn: 'Henrietta',
                fnt: 'BAXTER',
                gnt: 'HENRIETTA'
              },
              dob: '1985-10-14',
              v: [
                {
                  ci: 'URN:UVCI:01DE/IZSAP00A/3Y3DWEIPGJYQVFUXNQ2OWN#B',
                  co: 'DE',
                  dn: 2,
                  dt: '2021-07-25',
                  is: 'Robert Koch-Institut',
                  ma: 'ORG-100031184',
                  mp: 'EU/1/20/1507',
                  sd: 2,
                  tg: '840539006',
                  vp: '1119349007'
                }
              ]
            },
            validityState: 'VALID'
          },
          {
            cose: {
              kid: 'IyG53x+1zj0='
            },
            cwt: {
              iss: 'DE',
              iat: 1640691110,
              exp: 1672227110
            },
            hcert: {
              ver: '1.3.0',
              nam: {
                fn: 'Baxter',
                gn: 'Henrietta',
                fnt: 'BAXTER',
                gnt: 'HENRIETTA'
              },
              dob: '1985-10-14',
              v: [
                {
                  ci: 'URN:UVCI:01DE/IZSAP00A/3Y3DWEIPGJYQVFUXNQ2OWN#B',
                  co: 'DE',
                  dn: 1,
                  dt: '2021-06-15',
                  is: 'Robert Koch-Institut',
                  ma: 'ORG-100031184',
                  mp: 'EU/1/20/1507',
                  sd: 2,
                  tg: '840539006',
                  vp: '1119349007'
                }
              ]
            },
            validityState: 'VALID'
          }
        ],
        validationRules: [
          {
            Identifier: 'VR-DE-0001',
            Type: 'Acceptance',
            Country: 'DE',
            Version: '1.0.0',
            SchemaVersion: '1.0.0',
            Engine: 'CERTLOGIC',
            EngineVersion: '0.7.5',
            CertificateType: 'Vaccination',
            Description: [
              {
                lang: 'en',
                desc: 'The vaccination schedule must be complete (e.g., 1/1, 2/2).'
              },
              {
                lang: 'de',
                desc: 'Die Impfreihe muss vollständig sein (z.B. 1/1, 2/2).'
              },
              {
                lang: 'fr',
                desc: 'La série vaccinale doit être complète (p. ex. 1/1, 2/2).'
              },
              {
                lang: 'es',
                desc: 'La pauta de vacunación debe estar completa (por ejemplo, 1/1, 2/2).'
              },
              {
                lang: 'it',
                desc: 'Il ciclo di vaccinazione deve essere stato completato (ad es. 1/1, 2/2).'
              }
            ],
            ValidFrom: '2021-07-03T00:00:00Z',
            ValidTo: '2030-06-01T00:00:00Z',
            AffectedFields: [
              'v.0',
              'v.0.dn',
              'v.0.sd'
            ],
            Logic: {
              if: [
                {
                  var: 'payload.v.0'
                },
                {
                  '>=': [
                    {
                      var: 'payload.v.0.dn'
                    },
                    {
                      var: 'payload.v.0.sd'
                    }
                  ]
                },
                true
              ]
            }
          }
        ]
      }

      // TODO: add test case for when the function name does not exist/not registered
      output = ccl.api.getDccWalletInfo(input)
      console.log(JSON.stringify(output, null, '  '))
    })

    it('check input schema', async () => {
      const results = await ccl.schema.functions.getDccWalletInfo.input.validate(input)
      expect(results.errors, JSON.stringify(results.errors, null, '  ')).to.be.empty
    })
    it('check output schema', async () => {
      const results = await ccl.schema.functions.getDccWalletInfo.output.validate(output)
      expect(results.errors, JSON.stringify(results.errors, null, '  ')).to.be.empty
    })
  })

  context('vaccinated with Moderna 1/2 at t0', () => {
    let input, output
    let moderna12BarcodeData

    before(async () => {
      const t0 = moment()
      const { dccDescriptor } = dcc.data.presets.findPreset({ type: 'vc', idOrName: 'moderna12' })
      dccDescriptor.dccOverwrites = dccDescriptor.dccOverwrites || []
      dccDescriptor.dccOverwrites.push(`v.0.dt=${t0.format('YYYY-MM-DD')}`)
      const {
        barcodeData
      } = await dcc.generate(dccDescriptor)
      moderna12BarcodeData = barcodeData

      const mapBarcodeDataToCertificate = (barcodeData, { validityState }) => {
        const {
          iss, iat, exp,
          coseProtectedHeader, coseUnprotectedHeader,
          dcc: hcert
        } = dcc.decode.fromBarcodeData(barcodeData)
        const kid = dcc.util.getKID(coseProtectedHeader, coseUnprotectedHeader)
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
