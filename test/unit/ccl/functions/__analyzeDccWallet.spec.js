/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai'

import chalk from 'chalk'
import terminal from '../../../util/terminal.js'

import ccl from '../../../../lib/ccl/index.js'

import cclTestUtil from '../../../util/ccl-util.js'
import dcc from '../../../util/dcc/dcc-main.js'
import fixtures from '../../../util/fixtures.js'

describe('ccl/functions/__analyzeDccWallet', async () => {
  const allDccSeries = fixtures.readAllDccSeriesSync()

  allDccSeries.forEach(seriesDescriptor => {
    const _context = seriesDescriptor.only === true ? context.only : seriesDescriptor.skip === true ? context.skip : context
    _context(`${seriesDescriptor.filename} - ${seriesDescriptor.description}`, () => {
      let resolveCertNameToBarcodeData
      let resolveBarcodeDataToCertName
      let parseSeriesTestCase
      let resolveSeriesTime

      before(async () => {
        ({
          resolveCertNameToBarcodeData,
          resolveBarcodeDataToCertName,
          parseSeriesTestCase,
          resolveSeriesTime
        } = await dcc.series.parseSeriesDescriptor({ seriesDescriptor }))
      })

      seriesDescriptor.testCases.forEach((testCase, idx) => {
        const _context = testCase.only === true ? context.only : context
        const testCaseDescription = `test case #${idx + 1} at ${testCase.time} - ${testCase.description || ''}`
        _context(testCaseDescription, () => {
          let timeUnderTest, seriesUnderTest
          let input, output

          before(async () => {
            ({
              timeUnderTest,
              seriesUnderTest
            } = parseSeriesTestCase(testCase))

            input = {
              os: 'android',
              language: 'en',
              now: ccl.util.mapMomentToNow(timeUnderTest),
              certificates: seriesUnderTest.map(it => {
                return cclTestUtil.mapBarcodeDataToCertificate(it.barcodeData, {
                  validityState: it.validityState
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
            const results = await ccl.schema.functions.getDccWalletInfo.input.validate(input)
            expect(results.errors, results.errors.map(it => it.stack).join('\n')).to.be.empty
          })

          context('assertions', () => {
            const { assertions } = testCase
            const has = prop => Object.prototype.hasOwnProperty.call(assertions, prop) &&
              (typeof assertions[prop] === 'string' ? assertions[prop].trim().length > 0 : assertions[prop] !== null)

            has('admissionState') &&
            it('check admissionState', () => {
              expect(output).to.have.nested.property(
                'admissionState',
                assertions.admissionState
              )
            })

            has('mostRelevantCertificate') &&
            it('check mostRelevantCertificate', () => {
              const expCertName = assertions.mostRelevantCertificate
              const expBarcodeData = resolveCertNameToBarcodeData(expCertName)
              const actBarcodeData = output.mostRelevantCertificate.barcodeData
              const actCertName = resolveBarcodeDataToCertName(actBarcodeData)

              expect(output).to.have.nested.property(
                'mostRelevantCertificate.barcodeData',
                expBarcodeData,
                `expected reference to ${expCertName} but got ${actCertName}`
              )
            })

            has('vaccinationState') &&
            it('check vaccinationState', () => {
              expect(output).to.have.nested.property(
                'vaccinationState',
                assertions.vaccinationState
              )
            })

            has('vaccinationValidFrom') &&
            it('check vaccinationValidFrom', () => {
              const expValidFromMoment = resolveSeriesTime(assertions.vaccinationValidFrom)
              const expValidFrom = expValidFromMoment.utc().toISOString()
              expect(output)
                .to.have.property('vaccinationValidFrom')
              expect(output.vaccinationValidFrom).to.equal(expValidFrom)
            })

            has('mostRecentVaccination') &&
            it('check mostRecentVaccination', () => {
              const expCertName = assertions.mostRecentVaccination
              const expBarcodeData = resolveCertNameToBarcodeData(expCertName)
              const actBarcodeData = output.mostRecentVaccination.barcodeData
              const actCertName = resolveBarcodeDataToCertName(actBarcodeData)

              expect(output).to.have.nested.property(
                'mostRecentVaccination.barcodeData',
                expBarcodeData,
                `expected reference to ${expCertName} but got ${actCertName}`
              )
            })

            has('hasBooster') &&
            it('check hasBooster', () => {
              expect(output)
                .to.have.property('hasBooster', assertions.hasBooster)
            })

            has('verificationCertificates') &&
            it('check verificationCertificates', () => {
              expect(output.verificationCertificates)
                .to.be.an('array')
              expect(output.verificationCertificates, 'length of verificationCertificates')
                .to.be.an('array')
                .and.to.have.lengthOf(assertions.verificationCertificates.length)
              assertions.verificationCertificates.forEach((it, idx) => {
                const act = output.verificationCertificates[idx]
                const actBarcodeData = act.barcodeData
                const actCertName = resolveBarcodeDataToCertName(actBarcodeData)

                const expCertName = it.certificate
                const expBarcodeData = resolveCertNameToBarcodeData(expCertName)

                expect(actBarcodeData).to.equal(
                  expBarcodeData,
                  `expected reference to ${expCertName} but got ${actCertName}`
                )
              })
            })
          })
        })
      })
    })
  })
})
