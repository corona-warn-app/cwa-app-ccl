/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai'
import fse from 'fs-extra'
import path from 'path'
import yaml from 'js-yaml'
import { fileURLToPath } from 'url'

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

      // TODO: input & output schemas not found (fix)
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
          const actLabelTextDescriptor = output.labelText
          const labelTextAssertionDescriptor = assertions.labelText

          expect(output).to.have.property('labelText')
          expectTextToMatch(
            actLabelTextDescriptor,
            labelTextAssertionDescriptor
          )
        })

        has('scenarioSelection') &&
        it('check scenarioSelection.titleText', () => {
          const actScenarioSelection = output.scenarioSelection
          const actTitleTextDescriptor = actScenarioSelection.titleText
          const titleTextAssertionDescriptor = assertions.scenarioSelection.titleText

          expect(actScenarioSelection).to.have.property('titleText')
          expectTextToMatch(
            actTitleTextDescriptor,
            titleTextAssertionDescriptor
          )
        })

        has('scenarioSelection') &&
        it('check scenarioSelection.items[]', () => {
          expect(output.scenarioSelection)
            .to.be.an('object')
            .and.to.have.property('items')
          expect(output.scenarioSelection.items)
            .to.be.an('array')
            .and.to.have.lengthOf(assertions.scenarioSelection.items.length)
        })

        has('scenarioSelection') &&
        it('check scenarioSelection.items[].identifier', () => {
          assertions.scenarioSelection.items
            .filter(it => it.identifier)
            .forEach(({ identifier }, idx) => {
              const expIdentifierName = identifier
              const actScenarioSelectionItem = output.scenarioSelection.items[idx]
              const actIdentifierName = actScenarioSelectionItem.identifier

              expect(actScenarioSelectionItem).to.have.nested.property(
                'identifier',
                expIdentifierName,
                `expected ${expIdentifierName} but got ${actIdentifierName}`
              )
            })
        })

        has('scenarioSelection') &&
        it('check scenarioSelection.items[].titleText', () => {
          assertions.scenarioSelection.items
            .filter(it => it.titleText)
            .forEach(({ titleText }, idx) => {
              const titleTextAssertionDescriptor = titleText
              const actScenarioSelectionItem = output.scenarioSelection.items[idx]
              const actTitleTextDescriptor = actScenarioSelectionItem.titleText

              expectTextToMatch(
                actTitleTextDescriptor,
                titleTextAssertionDescriptor
              )
            })
        })

        has('scenarioSelection') &&
        it('check scenarioSelection.items[].subtitleText', () => {
          assertions.scenarioSelection.items
            .forEach((it, idx) => {
              if (it.subtitleText) {
                const subtitleTextAssertionDescriptor = it.subtitleText
                const actScenarioSelectionItem = output.scenarioSelection.items[idx]
                const actSubtitleTextDescriptor = actScenarioSelectionItem.subtitleText

                expectTextToMatch(
                  actSubtitleTextDescriptor,
                  subtitleTextAssertionDescriptor
                )
              }
            })
        })

        has('scenarioSelection') &&
        it('check scenarioSelection.items[].enabled', () => {
          assertions.scenarioSelection.items
            .filter(it => it.enabled)
            .forEach(({ enabled }, idx) => {
              const expEnabledStatus = enabled
              const actScenarioSelectionItem = output.scenarioSelection.items[idx]
              const actEnabledStatus = actScenarioSelectionItem.enabled

              expect(actScenarioSelectionItem).to.have.nested.property(
                'enabled',
                expEnabledStatus,
                `expected ${expEnabledStatus} but got ${actEnabledStatus}`
              )
            })
        })
      })
    })
  })
})
