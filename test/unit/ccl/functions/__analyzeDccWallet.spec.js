/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai'
import jp from 'jsonpath'

import chalk from 'chalk'
import terminal from '../../../util/terminal.js'

import ccl from '../../../../lib/ccl/index.js'

import cclTestUtil from '../../../util/ccl-util.js'
import dcc from '../../../util/dcc/dcc-main.js'
import fixtures from '../../../util/fixtures.js'

describe('ccl/functions/__analyzeDccWallet', async () => {
  const allDccSeries = fixtures.readAllDccSeriesSync()
  const allIRs = fixtures.readAllInvalidationRulesSync()

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
        const testCaseDescription = `test case #${idx + 1} at ${testCase.time} - ${testCase.description || ''} - scenario '${testCase.scenarioIdentifier || ''}'`
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
              boosterNotificationRules: [],
              invalidationRules: seriesDescriptor.invalidationRules || allIRs
            }
            if (typeof testCase.scenarioIdentifier === 'string') input.scenarioIdentifier = testCase.scenarioIdentifier

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

${chalk.cyan('Relevant output')}
${terminal.yaml(output.__allRelevantVCsAndRCsAnnotatedWithContext.map(it => {
  const {
    barcodeData, cose, cwt, ...rest
  } = it
  delete rest.hcert.nam
  delete rest.hcert.dob
  return rest
}))}

End of debugging: ${chalk.magenta(testCaseDescription)}`

            console.log(terminal.prefixLine(debugLog, prefix))
          })

          it('input matches JSON schema', async function () {
            const results = await ccl.schema.functions.getDccWalletInfo.input.validate(input)
            expect(results.errors, results.errors.map(it => it.stack).join('\n')).to.be.empty
          })

          context('assertions', () => {
            const { assertions } = testCase
            const has = pathExpression => jp.query(assertions, `$.${pathExpression}`)
              .filter(it => it !== null && it !== undefined && (!it.trim || it.trim().length > 0))
              .length > 0

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

            context('certificateReissuance', () => {
              const {
                certificateReissuance: expCertificateReissuance
              } = assertions
              const {
                enableAssertionsForNewBatchAPI
              } = expCertificateReissuance || {}

              if (enableAssertionsForNewBatchAPI === true &&
                expCertificateReissuance &&
                !expCertificateReissuance.certificates) {
                expCertificateReissuance.certificates = [{
                  action: 'renew',
                  certificateToReissue: expCertificateReissuance.certificateToReissue,
                  accompanyingCertificates: expCertificateReissuance.accompanyingCertificates
                }]
                delete expCertificateReissuance.certificateToReissue
                delete expCertificateReissuance.accompanyingCertificates
              }

              has('certificateReissuance') &&
              it('check certificateReissuance', () => {
                if (expCertificateReissuance) {
                  expect(output).to.have.property('certificateReissuance')
                } else {
                  expect(output).not.to.have.property('certificateReissuance')
                }
              })

              has('certificateReissuance.certificates') &&
              it('check certificateReissuance.certificates', () => {
                expect(output.certificateReissuance.certificates, 'length of certificateReissuance.certificates')
                  .to.be.an('array')
                  .and.to.have.lengthOf(expCertificateReissuance.certificates.length)
              })

              has('certificateReissuance.certificates') &&
              expCertificateReissuance.certificates.forEach((exp, idx) => {
                context(`certificateReissuance.certificates[${idx}]`, () => {
                  has(`certificateReissuance.certificates[${idx}].action`) &&
                  it('check action', () => {
                    expect(output).to.have.nested.property(
                      `certificateReissuance.certificates[${idx}].action`,
                      exp.action
                    )
                  })

                  has(`certificateReissuance.certificates[${idx}].certificateToReissue`) &&
                  it('check certificateToReissue', () => {
                    const act = output.certificateReissuance.certificates[idx].certificateToReissue
                    const actBarcodeData = act.barcodeData
                    const actCertName = resolveBarcodeDataToCertName(actBarcodeData)

                    const expCertName = exp.certificateToReissue
                    const expBarcodeData = resolveCertNameToBarcodeData(expCertName)

                    expect(actBarcodeData).to.equal(
                      expBarcodeData,
                      `expected reference to ${expCertName} but got ${actCertName}`
                    )
                  })

                  has(`certificateReissuance.certificates[${idx}].accompanyingCertificates`) &&
                  it('check accompanyingCertificates', () => {
                    expect(output.certificateReissuance.certificates[idx].accompanyingCertificates, 'length of accompanyingCertificates')
                      .to.be.an('array')
                      .and.to.have.lengthOf(exp.accompanyingCertificates.length)
                    exp.accompanyingCertificates.forEach((it, nestedIdx) => {
                      const act = output.certificateReissuance.certificates[idx].accompanyingCertificates[nestedIdx]
                      const actBarcodeData = act.barcodeData
                      const actCertName = resolveBarcodeDataToCertName(actBarcodeData)

                      const expCertName = it
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

            has('maskState') &&
            it('check maskState', () => {
              expect(output).to.have.nested.property(
                'maskState',
                assertions.maskState
              )
            })
          })
        })
      })
    })
  })
})
