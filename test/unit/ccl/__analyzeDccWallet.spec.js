/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
'use strict'

const { expect } = require('chai')
const moment = require('moment')
const path = require('path')
const fse = require('fs-extra')
const yaml = require('js-yaml')

const ccl = require('./../../../lib/ccl')

const cclUtil = require('./../../util/ccl-util')
const dcc = require('../../util/dcc/dcc-main')

describe.only('ccl/__analyzeDccWallet', async () => {
  const filenames = [
    'dcc-series-sample.yaml',
    'dcc-series-janssen.yaml',
    'dcc-series-recovery.yaml',
    'dcc-series-standard-vaccination.yaml'
  ]
  const presets = filenames.reduce((allPresets, filename) => {
    const filepath = path.resolve(__dirname, `./../../fixtures/ccl/${filename}`)
    const presetsStr = fse.readFileSync(filepath)
    const presets = yaml.load(presetsStr)
      .map(preset => {
        return {
          ...preset,
          filename
        }
      })
    allPresets.push(...presets)
    return allPresets
  }, [])

  presets.forEach(preset => {
    const _context = preset.only === true ? context.only : preset.skip === true ? context.skip : context
    _context(`${preset.filename} - ${preset.description}`, () => {
      const t0 = moment.utc('2022-01-01')
      let series

      const resolveCertRefToCi = certRef => {
        const certificate = series
          .find(it => {
            return it.vc === certRef ||
              it.rc === certRef ||
              it.tc === certRef
          })
        if (!certificate) return null
        return certificate.dcc.v?.[0]?.ci ||
          certificate.dcc.r?.[0]?.ci ||
          certificate.dcc.t?.[0]?.ci
      }

      const resolveCiToCertRef = ci => {
        const certificate = series.find(it => {
          return it.dcc.v?.[0]?.ci === ci ||
            it.dcc.r?.[0]?.ci === ci ||
            it.dcc.t?.[0]?.ci === ci
        })
        if (!certificate) return null
        return certificate.vc ||
          certificate.rc ||
          certificate.tc
      }

      before(async () => {
        const defaultDccDescriptor = {
          dccPiiSeed: preset.description || preset.name
        }
        series = await dcc.series.parseSeries({
          series: preset.series,
          t0,
          defaultDccDescriptor
        })
      })

      preset.testCases.forEach((testCase, idx) => {
        const _context = testCase.only === true ? context.only : context
        const testCaseDescription = `test case #${idx + 1} at ${testCase.time}`
        _context(testCaseDescription, () => {
          let timeUnderTest, seriesUnderTest
          let input, output

          before(async () => {
            timeUnderTest = dcc.series.resolveTime(testCase.time, -1, series, t0)
            seriesUnderTest = series
              .filter(it => it.time.isSameOrBefore(timeUnderTest))

            input = {
              os: 'android',
              language: 'en',
              now: cclUtil.mapMomentToNow(timeUnderTest),
              certificates: seriesUnderTest.map(it => {
                return cclUtil.mapBarcodeDataToCertificate(it.barcodeData, {
                  validityState: 'VALID'
                })
              }),
              boosterNotificationRules: []
            }

            output = ccl.evaluateFunction('__analyzeDccWallet', input)
          })

          it('series under test is not empty', () => {
            expect(seriesUnderTest)
              .to.have.lengthOf.at.least(1)
          })

          it('log series', () => {
            if (testCase.debug !== true) return

            const chalk = require('chalk')
            const terminal = require('./../../util/terminal')

            const prefix = `${chalk.magenta('[DEBUG]')} `

            const dccData = seriesUnderTest.map(it => it.dcc)

            const debugLog = `Start of debugging: ${chalk.magenta(testCaseDescription)}

${chalk.cyan('Time under test')}
${timeUnderTest.toISOString()}

${chalk.cyan('Series under test')} (${dccData.length} certificates)
${terminal.yaml(dccData)}

${chalk.cyan('Output of the operation')}
${terminal.yaml(output)}

End of debugging: ${chalk.magenta(testCaseDescription)}`

            console.log(terminal.prefixLine(debugLog, prefix))
          })

          it('input matches JSON schema', async function () {
            // if (!isCwaTechSpecAvailable) return this.skip()
            const results = await ccl.schema.functions.getDccWalletInfo.input.validate(input)
            expect(results.errors, JSON.stringify(results.errors, null, '  ')).to.be.empty
          })

          context('assertions', () => {
            const { assertions } = testCase
            const has = prop => Object.prototype.hasOwnProperty.call(assertions, prop) &&
              (typeof assertions[prop] === 'string' ? assertions[prop].trim().length > 0 : assertions[prop] !== null)

            has('admissionState') &&
            it('check admissionState', () => {
              expect(output)
                .to.have.property('admissionState', assertions.admissionState)
            })

            has('mostRelevantCertificate') &&
            it('check mostRelevantCertificate', () => {
              const expCertRef = assertions.mostRelevantCertificate
              const expCi = resolveCertRefToCi(expCertRef)
              expect(output)
                .to.have.property('mostRelevantCertificate')
              const actCertRef = resolveCiToCertRef(output.mostRelevantCertificate.ci)
              expect(output.mostRelevantCertificate, `expected reference to ${expCertRef} but got ${actCertRef}`)
                .to.have.property('ci', expCi)
            })

            has('vaccinationState') &&
            it('check vaccinationState', () => {
              expect(output)
                .to.have.property('vaccinationState', assertions.vaccinationState)
            })

            has('vaccinationValidFrom') &&
            it('check vaccinationValidFrom', () => {
              const expValidFromMoment = dcc.series.resolveTime(assertions.vaccinationValidFrom, -1, series, t0)
              const expValidFrom = expValidFromMoment.utc().toISOString()
              expect(output)
                .to.have.property('vaccinationValidFrom')
              expect(output.vaccinationValidFrom).to.equal(expValidFrom)
            })

            has('mostRecentVaccination') &&
            it('check mostRecentVaccination', () => {
              const expCertRef = assertions.mostRecentVaccination
              const expCi = resolveCertRefToCi(expCertRef)
              expect(output)
                .to.have.property('mostRecentVaccination')
              const actCertRef = resolveCiToCertRef(output.mostRecentVaccination.ci)
              expect(output.mostRecentVaccination, `expected reference to ${expCertRef} but got ${actCertRef}`)
                .to.have.property('ci', expCi)
            })

            has('hasBooster') &&
            it('check hasBooster', () => {
              expect(output)
                .to.have.property('hasBooster', assertions.hasBooster)
            })

            has('verificationCertificates') &&
            it('check verificationCertificates', () => {
              // console.log('output.verificationCertificates', output.verificationCertificates)
              expect(output.verificationCertificates)
                .to.be.an('object')
                .and.to.have.property('certificates')
              expect(output.verificationCertificates.certificates, 'length of verificationCertificates.certificates')
                .to.be.an('array')
                .and.to.have.lengthOf(assertions.verificationCertificates.length)
              assertions.verificationCertificates.forEach((it, idx) => {
                const act = output.verificationCertificates.certificates[idx]
                // console.log(act)
                const expCi = resolveCertRefToCi(it.certificate)
                const expCertRef = resolveCiToCertRef(expCi)
                const actCertRef = resolveCiToCertRef(act.ci)
                expect(act, `expected reference to ${expCertRef} but got ${actCertRef}`)
                  .to.have.property('ci', expCi)
              })
            })
          })
        })
      })
    })
  })
})
