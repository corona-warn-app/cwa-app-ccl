/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai'
import fse from 'fs-extra'
import path from 'path'
import yaml from 'js-yaml'
import { fileURLToPath } from 'url'
import moment from 'moment'

import chalk from 'chalk'
import terminal from '../../../util/terminal.js'

import ccl from '../../../../lib/ccl/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const filepath = path.resolve(__dirname, './../../../fixtures/ccl/ccl-status-tab-notice.yaml')
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

describe('ccl/functions/getStatusTabNotice', async () => {
  testCases.forEach((testCase, idx) => {
    const _context = testCase.only === true ? context.only : context
    const testCaseDescription = `test case #${idx + 1} at ${testCase.time} - ${testCase.description || ''}`
    _context(testCaseDescription, () => {
      let timeUnderTest
      let input, output

      before(async () => {
        timeUnderTest = moment(testCase.now) || moment.now()

        input = {
          os: 'android',
          language: 'en',
          now: ccl.util.mapMomentToNow(timeUnderTest)
        }

        output = ccl.api.getStatusTabNotice(input)
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
        const results = await ccl.schema.functions.getStatusTabNotice.input.validate(input)
        expect(results.errors, results.errors.map(it => it.stack).join('\n')).to.be.empty
      })

      it('output matches JSON schema', async function () {
        const results = await ccl.schema.functions.getStatusTabNotice.output.validate(output)
        expect(results.errors, results.errors.map(it => it.stack).join('\n')).to.be.empty
      })

      context('assertions', () => {
        const { assertions } = testCase
        const has = prop => Object.prototype.hasOwnProperty.call(assertions, prop) &&
          (typeof assertions[prop] === 'string' ? assertions[prop].trim().length > 0 : assertions[prop] !== null)

        has('visible') &&
        it('check visible', () => {
          expect(output).to.have.nested.property(
            'visible',
            assertions.visible
          )
        })

        const statusTabNoticeTexts = [
          'titleText', 'subtitleText', 'longText'
        ]
        statusTabNoticeTexts.forEach(textAttribute => {
          has(textAttribute) &&
          it(`check ${textAttribute}`, () => {
            expect(output).to.have.nested.property(textAttribute)
            const actTextDescriptor = output[textAttribute]
            const textAssertionDescriptor = assertions[textAttribute]
            expectTextToMatch(
              actTextDescriptor,
              textAssertionDescriptor,
              { timeUnderTest }
            )
          })
        })

        has('faqAnchor') &&
        it('check faqAnchor', () => {
          expect(output).to.have.nested.property(
            'faqAnchor',
            assertions.faqAnchor
          )
        })
      })
    })
  })
})
