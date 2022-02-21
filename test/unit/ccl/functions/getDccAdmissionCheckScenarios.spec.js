/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai'
import fse from 'fs-extra'
import path from 'path'
import yaml from 'js-yaml'
import { fileURLToPath } from 'url'
import jp from 'jsonpath'

import chalk from 'chalk'
import terminal from '../../../util/terminal.js'

import ccl from '../../../../lib/ccl/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const filepath = path.resolve(__dirname, './../../../fixtures/ccl/ccl-admission-check-scenarios.yaml')
const testCasesStr = fse.readFileSync(filepath, 'utf-8')
const testCases = yaml.load(testCasesStr)

const expectTextToMatch = (textDescriptor, textAssertionDescriptor) => {
  Object.entries(textAssertionDescriptor)
    .forEach(([languageCode, expStr]) => {
      const expPattern = new RegExp(expStr)
      const formatted = ccl.util.formatText(textDescriptor, languageCode, {})
      expect(formatted).to.match(expPattern)
    })
}

describe('ccl/functions/getDccAdmissionCheckScenarios', async () => {
  testCases.forEach((testCase, idx) => {
    const _context = testCase.only === true ? context.only : context
    const testCaseDescription = `test case #${idx + 1} at ${testCase.time} - ${testCase.description || ''}`
    _context(testCaseDescription, () => {
      let input, output

      before(async () => {
        input = {
          os: 'android',
          language: 'en',
          now: Date.now()
        }

        // output = ccl.evaluateFunction('__analyzeDccAdmissionCheckScenario', input)
        output = ccl.api.getDccAdmissionCheckScenarios(input)
      })

      it('log series', () => {
        if (testCase.debug !== true) return

        const prefix = `${chalk.magenta('[DEBUG]')} `

        const debugLog = `Start of debugging: ${chalk.magenta(testCaseDescription)}

        ${chalk.cyan('Output of the operation')}
        ${terminal.yaml(output)}

        End of debugging: ${chalk.magenta(testCaseDescription)}`

        console.log(terminal.prefixLine(debugLog, prefix))
      })

      it('input matches JSON schema', async function () {
        const results = await ccl.schema.functions.getDccAdmissionCheckScenarios.input.validate(input)
        expect(results.errors, results.errors.map(it => it.stack).join('\n')).to.be.empty
      })

      it('output matches JSON schema', async function () {
        const results = await ccl.schema.functions.getDccAdmissionCheckScenarios.output.validate(output)
        expect(results.errors, results.errors.map(it => it.stack).join('\n')).to.be.empty
      })

      context('assertions', () => {
        const { assertions } = testCase
        const has = prop => Object.prototype.hasOwnProperty.call(assertions, prop) &&
          (typeof assertions[prop] === 'string' ? assertions[prop].trim().length > 0 : assertions[prop] !== null)

        has('labelText') &&
        it('check labelText', () => {
          expect(output).to.have.property(
            'labelText',
            assertions.labelText
          )
        })

        has('scenarioSelectionItems') &&
        it('check scenarioSelectionItems', () => {
          expect(output.scenarioSelection)
            .to.be.an('object')
            .and.to.have.property('items')
          expect(output.scenarioSelection.items, 'length of scenarioSelection.items')
            .to.be.an('array')
            .and.to.have.lengthOf(assertions.scenarioSelectionItems.length)
          assertions.scenarioSelectionItems.forEach((it, idx) => {
            const expIdentifierName = it.identifier
            const actScenarioSelectionItem = output.scenarioSelection.items[idx]
            const actIdentifierName = actScenarioSelectionItem.identifier

            expect(actScenarioSelectionItem).to.have.nested.property(
              'identifier',
              expIdentifierName,
              `expected ${expIdentifierName} but got ${actIdentifierName}`
            )
          })
        })

        context('admissionCheckScenarios', () => {
          const expAdmissionCheckScenarios = assertions.scenarioSelectionItems || {}
          const has = pathExpression => jp.query(expAdmissionCheckScenarios, `$..${pathExpression}`)
            .filter(it => it !== null)
            .length > 0

          context('scenarioSelection', () => {
            const {
              scenarioSelection: expScenarioSelection
            } = expAdmissionCheckScenarios

            has('scenarioSelection') &&
            it('check scenarioSelection.titleText', () => {
              const actScenarioSelection = output.scenarioSelection

              expScenarioSelection.filter(it => it.titleText)
              const titleTextAssertionDescriptor = expScenarioSelection.titleText
              const actTitleTextDescriptor = actScenarioSelection.titleText

              expectTextToMatch(
                actTitleTextDescriptor,
                titleTextAssertionDescriptor
              )
            })

            has('scenarioSelection') &&
            it('check scenarioSelection.items[]', () => {
              expect(output).to.have.nested.property('scenarioSelection.items')
              expect(output.scenarioSelection.items, 'length of scenarioSelection.items')
                .to.be.an('array')
                .and.to.have.lengthOf(expScenarioSelection.length)
            })

            has('scenarioSelection') &&
            it('check scenarioSelection.items[].identifier', () => {
              const actScenarioSelection = output.scenarioSelection

              expScenarioSelection
                .filter(it => it.identifier)
                .forEach(({ identifier }, idx) => {
                  const expIdentifierName = identifier
                  const actScenarioSelectionItem = actScenarioSelection.items[idx]
                  const actIdentifierName = actScenarioSelectionItem.identifier

                  expect(actScenarioSelectionItem).to.have.nested.property(
                    'identifier',
                    expIdentifierName,
                    `expected reference to ${expIdentifierName} but got ${actIdentifierName}`
                  )
                })
            })

            has('scenarioSelection') &&
            it('check scenarioSelection.items[].titleText', () => {
              const actScenarioSelection = output.scenarioSelection

              expScenarioSelection
                .filter(it => it.titleText)
                .forEach(({ titleText }, idx) => {
                  const titleTextAssertionDescriptor = titleText
                  const actScenarioSelectionItem = actScenarioSelection.items[idx]
                  const actTitleTextDescriptor = actScenarioSelectionItem.titleText

                  expectTextToMatch(
                    actTitleTextDescriptor,
                    titleTextAssertionDescriptor
                  )
                })
            })

            has('scenarioSelection') &&
            it('check scenarioSelection.items[].subtitleText', () => {
              const actScenarioSelection = output.scenarioSelection

              expScenarioSelection
                .filter(it => it.subtitleText)
                .forEach(({ subtitleText }, idx) => {
                  const subtitleTextAssertionDescriptor = subtitleText
                  const actScenarioSelectionItem = actScenarioSelection.items[idx]
                  const actSubtitleTextDescriptor = actScenarioSelectionItem.subtitleText

                  expectTextToMatch(
                    actSubtitleTextDescriptor,
                    subtitleTextAssertionDescriptor
                  )
                })
            })

            has('scenarioSelection') &&
            it('check scenarioSelection.items[].enabled', () => {
              const actScenarioSelection = output.scenarioSelection

              expScenarioSelection
                .filter(it => it.enabled)
                .forEach(({ enabled }, idx) => {
                  const expEnabledStatus = enabled
                  const actScenarioSelectionItem = actScenarioSelection.items[idx]
                  const actEnabledStatus = actScenarioSelectionItem.enabled

                  expect(actEnabledStatus).to.equal(expEnabledStatus)
                })
            })
          })
        })
      })
    })
  })
})
