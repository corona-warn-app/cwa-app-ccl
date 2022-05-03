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

const expectTextToMatch = (textDescriptor, textAssertionDescriptor, { timeUnderTest }) => {
  Object.entries(textAssertionDescriptor)
    .forEach(([languageCode, expStr]) => {
      const expPattern = new RegExp(expStr)
      const formatted = ccl.util.formatText(textDescriptor, languageCode, { now: timeUnderTest })
      expect(formatted).to.match(expPattern)
    })
}

describe('ccl/functions/getDccWalletInfo', async () => {
  const allDccSeries = fixtures.readAllDccSeriesSync()
  const allBNRs = fixtures.readAllBoosterNotificationRulesSync()
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
              boosterNotificationRules: allBNRs,
              invalidationRules: seriesDescriptor.invalidationRules || allIRs,
              features: {
                enableDCCReissuanceForExtension: Object.prototype.hasOwnProperty.call(testCase.features || {}, 'enableDCCReissuanceForExtension')
                  ? testCase.features.enableDCCReissuanceForExtension
                  : true
              }
            }

            // output = ccl.evaluateFunction('__analyzeDccWallet', input)
            output = ccl.api.getDccWalletInfo(input)
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

${chalk.cyan('Booster Notification Rules')} (${allBNRs.length} BNRs)
${terminal.yaml(allBNRs)}

${chalk.cyan('Output of the operation')}
${terminal.yaml(output)}

End of debugging: ${chalk.magenta(testCaseDescription)}`

            console.log(terminal.prefixLine(debugLog, prefix))
          })

          it('input matches JSON schema', async function () {
            const results = await ccl.schema.functions.getDccWalletInfo.input.validate(input)
            expect(results.errors, results.errors.map(it => it.stack).join('\n')).to.be.empty
          })

          it('output matches JSON schema', async function () {
            const results = await ccl.schema.functions.getDccWalletInfo.output.validate(output)
            expect(results.errors, results.errors.map(it => it.stack).join('\n')).to.be.empty
          })

          context('assertions', () => {
            const { assertions } = testCase
            const has = prop => Object.prototype.hasOwnProperty.call(assertions, prop) &&
              (typeof assertions[prop] === 'string' ? assertions[prop].trim().length > 0 : assertions[prop] !== null)

            has('admissionState') &&
            it('check admissionState', () => {
              expect(output).to.have.nested.property(
                'admissionState.value',
                assertions.admissionState
              )
            })

            has('mostRelevantCertificate') &&
            it('check mostRelevantCertificate', () => {
              const expCertName = assertions.mostRelevantCertificate
              const expBarcodeData = resolveCertNameToBarcodeData(expCertName)
              const actCertName = resolveBarcodeDataToCertName(output.mostRelevantCertificate.certificateRef.barcodeData)

              expect(output).to.have.nested.property(
                'mostRelevantCertificate.certificateRef.barcodeData',
                expBarcodeData,
                `expected reference to ${expCertName} but got ${actCertName}`
              )
            })

            has('vaccinationState') &&
            it('check vaccinationState', () => {
              expect(output).to.have.nested.property(
                'vaccinationState.value',
                assertions.vaccinationState
              )
            })

            has('vaccinationValidFrom') &&
            it('check vaccinationValidFrom', () => {
              const expValidFromMoment = resolveSeriesTime(assertions.vaccinationValidFrom)
              const expValidFrom = expValidFromMoment.utc().toISOString()
              expect(output).to.have.property(
                'vaccinationValidFrom',
                expValidFrom
              )
            })

            has('validUntil') &&
            it('check validUntil', () => {
              const expValidUntilMoment = resolveSeriesTime(assertions.validUntil)
              const expValidUntil = expValidUntilMoment.utc().toISOString()
              expect(output)
                .to.have.property('validUntil', expValidUntil)
            })

            has('mostRecentVaccination') &&
            it('check mostRecentVaccination', () => {
              const expCertName = assertions.mostRecentVaccination
              const expBarcodeData = resolveCertNameToBarcodeData(expCertName)
              const actCertName = resolveBarcodeDataToCertName(output.mostRecentVaccination.certificateRef.barcodeData)

              expect(output).to.have.nested.property(
                'mostRecentVaccination.certificateRef.barcodeData',
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
              expect(output.verification)
                .to.be.an('object')
                .and.to.have.property('certificates')
              expect(output.verification.certificates, 'length of verification.certificates')
                .to.be.an('array')
                .and.to.have.lengthOf(assertions.verificationCertificates.length)
              assertions.verificationCertificates.forEach((it, idx) => {
                const act = output.verification.certificates[idx]

                const expCertName = it.certificate
                const expBarcodeData = resolveCertNameToBarcodeData(expCertName)
                const actCertName = resolveBarcodeDataToCertName(act.certificateRef.barcodeData)

                expect(act).to.have.nested.property(
                  'certificateRef.barcodeData',
                  expBarcodeData,
                  `expected reference to ${expCertName} but got ${actCertName}`
                )
              })
            })

            context('walletInfo', () => {
              const expWalletInfo = assertions.walletInfo || {}
              const has = pathExpression => jp.query(expWalletInfo, `$..${pathExpression}`)
                .filter(it => it !== null)
                .length > 0

              context('admissionState', () => {
                const {
                  admissionState: expAdmissionState
                } = expWalletInfo

                has('admissionState.visible') &&
                it('check admissionState.visible', () => {
                  expect(output).to.have.nested.property(
                    'admissionState.visible',
                    expAdmissionState.visible
                  )
                })

                const admissionStateTexts = [
                  'badgeText', 'titleText', 'subtitleText', 'longText', 'stateChangeNotificationText'
                ]
                admissionStateTexts.forEach(textAttribute => {
                  has(`admissionState.${textAttribute}`) &&
                  it(`check admissionState.${textAttribute}`, () => {
                    expect(output).to.have.nested.property(`admissionState.${textAttribute}`)
                    const actTextDescriptor = output.admissionState[textAttribute]
                    const textAssertionDescriptor = expAdmissionState[textAttribute]
                    expectTextToMatch(
                      actTextDescriptor,
                      textAssertionDescriptor,
                      { timeUnderTest }
                    )
                  })
                })

                has('admissionState.faqAnchor') &&
                it('check admissionState.faqAnchor', () => {
                  expect(output).to.have.nested.property(
                    'admissionState.faqAnchor',
                    expAdmissionState.faqAnchor
                  )
                })

                has('admissionState.identifier') &&
                it('check admissionState.identifier', () => {
                  expect(output).to.have.nested.property(
                    'admissionState.identifier',
                    expAdmissionState.identifier
                  )
                })
              })

              context('vaccinationState', () => {
                const {
                  vaccinationState: expVaccinationState
                } = expWalletInfo

                has('vaccinationState.visible') &&
                it('check vaccinationState.visible', () => {
                  expect(output).to.have.nested.property(
                    'vaccinationState.visible',
                    expVaccinationState.visible
                  )
                })

                const vaccinationStateTexts = [
                  'titleText', 'subtitleText', 'longText'
                ]
                vaccinationStateTexts.forEach(textAttribute => {
                  has(`vaccinationState.${textAttribute}`) &&
                  it(`check vaccinationState.${textAttribute}`, () => {
                    expect(output).to.have.nested.property(`vaccinationState.${textAttribute}`)
                    const actTextDescriptor = output.vaccinationState[textAttribute]
                    const textAssertionDescriptor = expVaccinationState[textAttribute]
                    expectTextToMatch(
                      actTextDescriptor,
                      textAssertionDescriptor,
                      { timeUnderTest }
                    )
                  })
                })

                has('vaccinationState.faqAnchor') &&
                it('check vaccinationState.faqAnchor', () => {
                  expect(output).to.have.nested.property(
                    'vaccinationState.faqAnchor',
                    expVaccinationState.faqAnchor
                  )
                })
              })

              context('verification', () => {
                const {
                  verification: expVerification
                } = expWalletInfo

                has('verification') &&
                it('check verification', () => {
                  expect(output).to.have.nested.property('verification.certificates')
                  expect(output.verification.certificates, 'length of verification.certificates')
                    .to.be.an('array')
                    .and.to.have.lengthOf(expVerification.length)
                })

                has('verification') &&
                it('check verification[].certificate', () => {
                  const actVerification = output.verification

                  expVerification
                    .filter(it => it.certificate)
                    .forEach(({ certificate }, idx) => {
                      const expCertName = certificate
                      const expBarcodeData = resolveCertNameToBarcodeData(expCertName)
                      const actCertificate = actVerification.certificates[idx]
                      const actBarcodeData = actCertificate.certificateRef.barcodeData
                      const actCertName = resolveBarcodeDataToCertName(actBarcodeData)

                      expect(actCertificate).to.have.nested.property(
                        'certificateRef.barcodeData',
                        expBarcodeData,
                        `expected reference to ${expCertName} but got ${actCertName}`
                      )
                    })
                })

                has('verification') &&
                it('check verification[].buttonText', () => {
                  const actVerification = output.verification

                  expVerification
                    .filter(it => it.buttonText)
                    .forEach(({ buttonText }, idx) => {
                      const buttonTextAssertionDescriptor = buttonText
                      const actCertificate = actVerification.certificates[idx]
                      const actButtonTextDescriptor = actCertificate.buttonText
                      expectTextToMatch(
                        actButtonTextDescriptor,
                        buttonTextAssertionDescriptor,
                        { timeUnderTest }
                      )
                    })
                })
              })

              context('boosterNotification', () => {
                const {
                  boosterNotification: expBoosterNotification
                } = expWalletInfo

                has('boosterNotification.visible') &&
                it('check boosterNotification.visible', () => {
                  expect(output).to.have.nested.property(
                    'boosterNotification.visible',
                    expBoosterNotification.visible
                  )
                })

                has('boosterNotification.identifier') &&
                it('check boosterNotification.identifier', () => {
                  expect(output).to.have.nested.property(
                    'boosterNotification.identifier',
                    expBoosterNotification.identifier
                  )
                })

                const boosterNotificationTexts = [
                  'titleText', 'subtitleText', 'longText'
                ]
                boosterNotificationTexts.forEach(textAttribute => {
                  has(`boosterNotification.${textAttribute}`) &&
                  it(`check boosterNotification.${textAttribute}`, () => {
                    expect(output).to.have.nested.property(`boosterNotification.${textAttribute}`)
                    const actTextDescriptor = output.boosterNotification[textAttribute]
                    const textAssertionDescriptor = expBoosterNotification[textAttribute]
                    expectTextToMatch(
                      actTextDescriptor,
                      textAssertionDescriptor,
                      { timeUnderTest }
                    )
                  })
                })

                has('boosterNotification.faqAnchor') &&
                it('check boosterNotification.faqAnchor', () => {
                  expect(output).to.have.nested.property(
                    'boosterNotification.faqAnchor',
                    expBoosterNotification.faqAnchor
                  )
                })
              })

              context('certificateReissuance', () => {
                const {
                  certificateReissuance: expCertificateReissuance
                } = expWalletInfo
                const {
                  enableAssertionsForNewBatchAPI
                } = expCertificateReissuance || {}

                has('certificateReissuance') &&
                it('check certificateReissuance', () => {
                  if (expCertificateReissuance) {
                    expect(output).to.have.nested.property('certificateReissuance')
                  } else {
                    expect(output).not.to.have.nested.property('certificateReissuance')
                  }
                })

                has('certificateReissuance.reissuanceDivision.visible') &&
                it('check certificateReissuance.visible', () => {
                  expect(output).to.have.nested.property(
                    'certificateReissuance.reissuanceDivision.visible',
                    expCertificateReissuance.reissuanceDivision.visible
                  )
                })

                const certificateReissuanceTexts = [
                  'titleText', 'subtitleText', 'longText'
                ]
                certificateReissuanceTexts.forEach(textAttribute => {
                  has(`certificateReissuance.reissuanceDivision.${textAttribute}`) &&
                  it(`check certificateReissuance.reissuanceDivision.${textAttribute}`, () => {
                    expect(output).to.have.nested.property(`certificateReissuance.reissuanceDivision.${textAttribute}`)
                    const actTextDescriptor = output.certificateReissuance.reissuanceDivision[textAttribute]
                    const textAssertionDescriptor = expCertificateReissuance.reissuanceDivision[textAttribute]
                    expectTextToMatch(
                      actTextDescriptor,
                      textAssertionDescriptor,
                      { timeUnderTest }
                    )
                  })
                })

                has('certificateReissuance.reissuanceDivision.faqAnchor') &&
                it('check certificateReissuance.faqAnchor', () => {
                  expect(output).to.have.nested.property(
                    'certificateReissuance.reissuanceDivision.faqAnchor',
                    expCertificateReissuance.reissuanceDivision.faqAnchor
                  )
                })

                has('certificateReissuance.certificateToReissue') &&
                it('check certificateReissuance.certificateToReissue', () => {
                  const expCertName = expCertificateReissuance.certificateToReissue
                  const expBarcodeData = resolveCertNameToBarcodeData(expCertName)
                  const actBarcodeData = output.certificateReissuance.certificateToReissue.certificateRef.barcodeData
                  const actCertName = resolveBarcodeDataToCertName(actBarcodeData)

                  expect(output).to.have.nested.property(
                    'certificateReissuance.certificateToReissue.certificateRef.barcodeData',
                    expBarcodeData,
                    `expected reference to ${expCertName} but got ${actCertName}`
                  )
                })

                has('certificateReissuance.accompanyingCertificates') &&
                it('check certificateReissuance.accompanyingCertificates', () => {
                  expect(output.certificateReissuance.accompanyingCertificates)
                    .to.be.an('array')
                  expect(output.certificateReissuance.accompanyingCertificates, 'length of certificateReissuance.accompanyingCertificates')
                    .to.be.an('array')
                    .and.to.have.lengthOf(expCertificateReissuance.accompanyingCertificates.length)
                  expCertificateReissuance.accompanyingCertificates.forEach((it, idx) => {
                    const act = output.certificateReissuance.accompanyingCertificates[idx]
                    const actBarcodeData = act.certificateRef.barcodeData
                    const actCertName = resolveBarcodeDataToCertName(actBarcodeData)

                    const expCertName = it
                    const expBarcodeData = resolveCertNameToBarcodeData(expCertName)

                    expect(actBarcodeData).to.equal(
                      expBarcodeData,
                      `expected reference to ${expCertName} but got ${actCertName}`
                    )
                  })
                })

                enableAssertionsForNewBatchAPI &&
                has('certificateReissuance.certificateToReissue') &&
                it('[COMPATIBILITY] check certificateReissuance.certificates[0].action', () => {
                  expect(output.certificateReissuance.certificates)
                    .to.be.an('array')
                    .and.to.have.lengthOf(1)

                  expect(output).to.have.nested.property(
                    'certificateReissuance.certificates[0].action',
                    'renew'
                  )
                })

                enableAssertionsForNewBatchAPI &&
                has('certificateReissuance.certificateToReissue') &&
                it('[COMPATIBILITY] check certificateReissuance.certificates[0].certificateToReissue', () => {
                  expect(output.certificateReissuance.certificates)
                    .to.be.an('array')
                    .and.to.have.lengthOf(1)
                  const expCertName = expCertificateReissuance.certificateToReissue
                  const expBarcodeData = resolveCertNameToBarcodeData(expCertName)
                  const actBarcodeData = output.certificateReissuance.certificates[0].certificateToReissue.certificateRef.barcodeData
                  const actCertName = resolveBarcodeDataToCertName(actBarcodeData)

                  expect(output).to.have.nested.property(
                    'certificateReissuance.certificates[0].certificateToReissue.certificateRef.barcodeData',
                    expBarcodeData,
                    `expected reference to ${expCertName} but got ${actCertName}`
                  )
                })

                enableAssertionsForNewBatchAPI &&
                has('certificateReissuance.accompanyingCertificates') &&
                it('[COMPATIBILITY] check certificateReissuance.certificates[0].accompanyingCertificates', () => {
                  expect(output.certificateReissuance.certificates)
                    .to.be.an('array')
                    .and.to.have.lengthOf(1)
                  expect(output.certificateReissuance.certificates[0].accompanyingCertificates, 'length of certificateReissuance.certificates[0].accompanyingCertificates')
                    .to.be.an('array')
                    .and.to.have.lengthOf(expCertificateReissuance.accompanyingCertificates.length)
                  expCertificateReissuance.accompanyingCertificates.forEach((it, idx) => {
                    const act = output.certificateReissuance.certificates[0].accompanyingCertificates[idx]
                    const actBarcodeData = act.certificateRef.barcodeData
                    const actCertName = resolveBarcodeDataToCertName(actBarcodeData)

                    const expCertName = it
                    const expBarcodeData = resolveCertNameToBarcodeData(expCertName)

                    expect(actBarcodeData).to.equal(
                      expBarcodeData,
                      `expected reference to ${expCertName} but got ${actCertName}`
                    )
                  })
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
                    it('check action', () => {
                      expect(output).to.have.nested.property(
                        `certificateReissuance.certificates[${idx}].action`,
                        exp.action
                      )
                    })

                    it('check certificateToReissue', () => {
                      const act = output.certificateReissuance.certificates[idx].certificateToReissue.certificateRef
                      const actBarcodeData = act.barcodeData
                      const actCertName = resolveBarcodeDataToCertName(actBarcodeData)

                      const expCertName = exp.certificateToReissue
                      const expBarcodeData = resolveCertNameToBarcodeData(expCertName)

                      expect(actBarcodeData).to.equal(
                        expBarcodeData,
                        `expected reference to ${expCertName} but got ${actCertName}`
                      )
                    })

                    it('check accompanyingCertificates', () => {
                      expect(output.certificateReissuance.certificates[idx].accompanyingCertificates, 'length of accompanyingCertificates')
                        .to.be.an('array')
                        .and.to.have.lengthOf(exp.accompanyingCertificates.length)
                      exp.accompanyingCertificates.forEach((it, nestedIdx) => {
                        const act = output.certificateReissuance.certificats[idx].accompanyingCertificates[nestedIdx].certificateRef
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

              has('certificatesRevokedByInvalidationRules') &&
              it('check certificatesRevokedByInvalidationRules', () => {
                const {
                  certificatesRevokedByInvalidationRules: expCertificatesRevokedByInvalidationRules
                } = expWalletInfo

                expect(output.certificatesRevokedByInvalidationRules)
                  .to.be.an('array')
                expect(output.certificatesRevokedByInvalidationRules, 'length of certificatesRevokedByInvalidationRules')
                  .to.be.an('array')
                  .and.to.have.lengthOf(expCertificatesRevokedByInvalidationRules.length)
                expCertificatesRevokedByInvalidationRules.forEach((it, idx) => {
                  const act = output.certificatesRevokedByInvalidationRules[idx]
                  const actBarcodeData = act.certificateRef.barcodeData
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
      })
    })
  })
})
