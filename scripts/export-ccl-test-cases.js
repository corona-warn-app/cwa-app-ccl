import async from 'async'
import moment from 'moment'
import path from 'path'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import ccl from './../lib/ccl/index.js'
import {
  fileWriterFactory,
  hashJson
} from './util/dist.js'
import { readJson } from './../lib/util/local-file.js'

import cclTestUtil from './../test/util/ccl-util.js'
import dcc from './../test/util/dcc/dcc-main.js'
import fixtures from './../test/util/fixtures.js'

const argv = yargs(hideBin(process.argv))
  .option('target', {
    alias: 't',
    string: true,
    default: 'dist'
  })
  .option('test-case-filename', {
    default: 'ccl-test-cases.gen.json'
  })
  .argv

const getTestCasesForGetDccAdmissionCheckScenarios = async () => {
  const allAdmissionCheckScenarios = fixtures.readAllAdmissionCheckScenariosSync()
  const cclDe0001 = await readJson('./dist/rule-distribution-ccl-de-0001.json')
  const allFunctions = cclDe0001.Logic.JfnDescriptors

  const allTestCases = []

  await async.forEach(allAdmissionCheckScenarios, async descriptor => {
    const input = {
      os: 'android',
      language: 'en',
      now: ccl.util.mapMomentToNow(moment.now())
    }

    const output = ccl.evaluateFunction('getDccAdmissionCheckScenarios', input)

    const testCaseDescriptor = {
      title: descriptor.description,
      functions: allFunctions,
      useDefaultCCLConfiguration: true,
      evaluateFunction: {
        name: 'getDccAdmissionCheckScenarios',
        parameters: input
      },
      exp: output
    }
    allTestCases.push(testCaseDescriptor)
  })

  return allTestCases
}

const getTestCasesForGetDccWalletInfo = async () => {
  const allDccSeries = fixtures.readAllDccSeriesSync()
  const cclDe0001 = await readJson('./dist/rule-distribution-ccl-de-0001.json')
  const allFunctions = cclDe0001.Logic.JfnDescriptors

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
          return cclTestUtil.mapBarcodeDataToCertificate(it.barcodeData, {
            validityState: it.validityState
          })
        }),
        boosterNotificationRules: []
      }

      const output = ccl.evaluateFunction('getDccWalletInfo', input)

      const testCaseDescriptor = {
        title: `${seriesDescription} - ${testCaseDescription}`,
        functions: allFunctions,
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

  return allTestCases
}

const main = async () => {
  const allTestCases = [
    ...(await getTestCasesForGetDccAdmissionCheckScenarios()),
    ...(await getTestCasesForGetDccWalletInfo())
  ]

  const fileWriter = fileWriterFactory({
    target: path.resolve(process.cwd(), argv.target)
  })

  if (argv.testCaseFilename) {
    const data = {
      $comment: `Generated at ${new Date().toString()}`,
      sourceHash: hashJson(allTestCases),
      sourceTreeish: process.env.CCL_TREEISH || 'unknown',
      testCases: allTestCases
    }

    await fileWriter.fanOutToOS(ctx => {
      return ctx.writeJSON(argv.testCaseFilename, data, { spaces: 2 })
    })
  }
}

main()
  .then(() => console.log('Done.'))
  .catch(err => console.log('Error:', err))
