'use strict'

const async = require('async')
const chalk = require('chalk')
const fse = require('fs-extra')
const path = require('path')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const fixtures = require('./../test/util/fixtures')
const dcc = require('./../test/util/dcc/dcc-main')

const ccl = require('./../lib/ccl')
const cclUtil = require('./../test/util/ccl-util')

const allDccSeries = fixtures.readAllDccSeriesSync()

const argv = yargs(hideBin(process.argv))
  .option('json-target', {
    string: true
  })
  .argv

const main = async () => {
  const allTestCases = []

  await async.forEach(allDccSeries, async seriesDescriptor => {
    const {
      parseSeriesTestCase
    } = await dcc.series.parseSeriesDescriptor({ seriesDescriptor })
    const seriesDescription = `${seriesDescriptor.filename} - ${seriesDescriptor.description}`

    await async.forEachOf(seriesDescriptor.testCases, async (testCase, idx) => {
      const {
        timeUnderTest,
        seriesUnderTest
      } = parseSeriesTestCase(testCase)
      const testCaseDescription = `test case #${idx + 1} at ${testCase.time}`

      const input = {
        os: 'android',
        language: 'en',
        now: ccl.util.mapMomentToNow(timeUnderTest),
        certificates: seriesUnderTest.map(it => {
          return cclUtil.mapBarcodeDataToCertificate(it.barcodeData, {
            validityState: 'VALID'
          })
        }),
        boosterNotificationRules: []
      }

      const output = ccl.evaluateFunction('getDccWalletInfo', input)

      const testCaseDescriptor = {
        title: `${seriesDescription} - ${testCaseDescription}`,
        functions: [],
        useDefaultCCLConfiguration: true,
        evaluateFunction: {
          name: 'getDccWalletInfo',
          parameters: input
        },
        exp: output
      }
      allTestCases.push(testCaseDescriptor)
    })
  })

  if (argv.jsonTarget) {
    const data = {
      $comment: `Generated at ${new Date().toString()}`,
      testCases: allTestCases
    }

    const targetFilepath = path.resolve(process.cwd(), argv.jsonTarget)
    await fse.ensureFile(targetFilepath)
    await fse.writeJSON(targetFilepath, data, { spaces: 2 })
    console.log(`Created JSON target ${chalk.cyan(argv.jsonTarget)}`)
  }
}

main()
  .then(() => console.log('Done.'))
  .catch(err => console.log('Error:', err))
