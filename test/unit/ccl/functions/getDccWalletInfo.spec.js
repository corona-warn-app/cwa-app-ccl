/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
'use strict'

const { expect } = require('chai')
const moment = require('moment')
const jp = require('jsonpath')
const path = require('path')
const fse = require('fs-extra')
const yaml = require('js-yaml')

const ccl = require('../../../../lib/ccl')

const cclUtil = require('../../../util/ccl-util')
const dcc = require('../../../util/dcc/dcc-main')

describe('ccl/functions/getDccWalletInfo', async () => {
  const filenames = [
    'dcc-series-sample.yaml',
    'dcc-series-janssen.yaml',
    'dcc-series-recovery.yaml',
    'dcc-series-standard-vaccination.yaml'
  ]
  const presets = filenames.reduce((allPresets, filename) => {
    const filepath = path.resolve(__dirname, `./../../../fixtures/ccl/${filename}`)
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

      const resolveCertRefToBarcodeData = certRef => {
        const certificate = series
          .find(it => {
            return it.vc === certRef ||
              it.rc === certRef ||
              it.tc === certRef
          })
        if (!certificate) return null
        return certificate.barcodeData
      }

      const resolveBarcodeDataToCertRef = barcodeData => {
        const certificate = series.find(it => {
          return it.barcodeData === barcodeData
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

            // output = ccl.evaluateFunction('__analyzeDccWallet', input)
            output = ccl.api.getDccWalletInfo(input)
          })

          it('series under test is not empty', () => {
            expect(seriesUnderTest)
              .to.have.lengthOf.at.least(1)
          })

          it('log series', () => {
            if (testCase.debug !== true) return

            const chalk = require('chalk')
            const terminal = require('../../../util/terminal')

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
            expect(results.errors, JSON.stringify(results.errors, null, '  ')).to.be.empty
          })

          it('output matches JSON schema', async function () {
            const results = await ccl.schema.functions.getDccWalletInfo.output.validate(output)
            expect(results.errors, JSON.stringify(results.errors, null, '  ')).to.be.empty
          })

          context('assertions', () => {
            const { assertions } = testCase
            // const has = propertyPath => Object.prototype.hasOwnProperty.call(assertions, prop) &&
            //   (typeof assertions[prop] === 'string' ? assertions[prop].trim().length > 0 : assertions[prop] !== null)
            // const has = pathExpression => jp.query(assertions, `$..${pathExpression}`)
            //   .filter(it => it !== null)
            //   .length > 0
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
              const expCertRef = assertions.mostRelevantCertificate
              const expBarcodeData = resolveCertRefToBarcodeData(expCertRef)
              const actCertRef = resolveBarcodeDataToCertRef(output.mostRelevantCertificate.certificateRef.barcodeData)

              expect(output).to.have.nested.property(
                'mostRelevantCertificate.certificateRef.barcodeData',
                expBarcodeData,
                `expected reference to ${expCertRef} but got ${actCertRef}`
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
              const expValidFromMoment = dcc.series.resolveTime(assertions.vaccinationValidFrom, -1, series, t0)
              const expValidFrom = expValidFromMoment.utc().toISOString()
              expect(output).to.have.property(
                'vaccinationValidFrom',
                expValidFrom
              )
            })

            has('mostRecentVaccination') &&
            it('check mostRecentVaccination', () => {
              const expCertRef = assertions.mostRecentVaccination
              const expBarcodeData = resolveCertRefToBarcodeData(expCertRef)
              const actCertRef = resolveBarcodeDataToCertRef(output.mostRecentVaccination.certificateRef.barcodeData)

              expect(output).to.have.nested.property(
                'mostRecentVaccination.certificateRef.barcodeData',
                expBarcodeData,
                `expected reference to ${expCertRef} but got ${actCertRef}`
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

                const expBarcodeData = resolveCertRefToBarcodeData(it.certificate)
                const expCertRef = resolveBarcodeDataToCertRef(expBarcodeData)
                const actCertRef = resolveBarcodeDataToCertRef(act.certificateRef.barcodeData)

                expect(act).to.have.nested.property(
                  'certificateRef.barcodeData',
                  expBarcodeData,
                  `expected reference to ${expCertRef} but got ${actCertRef}`
                )
              })
            })

            const format = (textDescriptor, languageCode) => {
              // console.log(textDescriptor, languageCode)
              if (textDescriptor.type === 'string') {
                const formatString = textDescriptor.localizedText[languageCode]
                return formatString
              } else if (textDescriptor.type === 'plural') {
                const quantityStrings = textDescriptor.localizedText[languageCode]
                const quantity = textDescriptor.quantity
                const quantityKey = (() => {
                  if (quantity === 0) return 'zero'
                  if (quantity === 1) return 'one'
                  if (quantity === 2) return 'two'
                  return 'many'
                })()
                const formatString = quantityStrings[quantityKey]
                const { sprintf } = require('printj')
                const formatParameters = textDescriptor.parameters.map(it => {
                  return it.value
                })
                return sprintf(formatString, formatParameters)
              } else if (textDescriptor.type === 'system-time-dependent') {
                const functionName = textDescriptor.functionName
                const now = timeUnderTest
                const functionParameters = {
                  ...textDescriptor.parameters,
                  now: cclUtil.mapMomentToNow(now)
                }
                const newTextDescriptor = ccl.evaluateFunction(functionName, functionParameters)
                return format(newTextDescriptor, languageCode)
              } else {
                throw new Error(`Unknown text type ${textDescriptor.type}`)
              }
            }

            const expectTextToMatch = (textDescriptor, expDescriptor) => {
              Object.entries(expDescriptor)
                .forEach(([languageCode, expStr]) => {
                  const expPattern = new RegExp(expStr)
                  const formatted = format(textDescriptor, languageCode)
                  expect(formatted).to.match(expPattern)
                })
            }

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
                  'badgeText', 'titleText', 'subtitleText', 'longText'
                ]
                admissionStateTexts.forEach(textAttribute => {
                  has(`admissionState.${textAttribute}`) &&
                  it(`check admissionState.${textAttribute}`, () => {
                    expect(output).to.have.nested.property(`admissionState.${textAttribute}`)
                    expectTextToMatch(
                      output.admissionState[textAttribute],
                      expAdmissionState[textAttribute]
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
                    expectTextToMatch(
                      output.vaccinationState[textAttribute],
                      expVaccinationState[textAttribute]
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
                      const expCertRef = certificate
                      const expBarcodeData = resolveCertRefToBarcodeData(expCertRef)
                      const actCertificate = actVerification.certificates[idx]
                      const actBarcodeData = actCertificate.certificateRef.barcodeData
                      const actCertRef = resolveBarcodeDataToCertRef(actBarcodeData)

                      expect(actCertificate).to.have.nested.property(
                        'certificateRef.barcodeData',
                        expBarcodeData,
                        `expected reference to ${expCertRef} but got ${actCertRef}`
                      )
                    })
                })

                has('verification') &&
                it('check verification[].buttonText', () => {
                  const actVerification = output.verification

                  expVerification
                    .filter(it => it.buttonText)
                    .forEach(({ buttonText }, idx) => {
                      const expButtonText = buttonText
                      const actCertificate = actVerification.certificates[idx]
                      const actButtonText = actCertificate.buttonText
                      expectTextToMatch(actButtonText, expButtonText)
                    })
                })
              })
            })
          })
        })
      })
    })
  })
})
