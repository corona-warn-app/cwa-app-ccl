import fse from 'fs-extra'
import path from 'path'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { fileURLToPath } from 'url'

import dynamicTests from './../test/fixtures/jfn/jfn-tests/time.moment.spec.js'

import {
  fileWriterFactory,
  hashJson,
  chunkifyTestCases
} from './util/dist.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const argv = yargs(hideBin(process.argv))
  .option('target', {
    alias: 't',
    string: true,
    default: 'dist'
  })
  .option('json-filename', {
    default: 'jfn-test-cases.gen.json'
  })
  .argv
const testCasesInJavaScript = [
  dynamicTests
]

const convertJsonLogicTestCases = tests => {
  return tests
    .filter(it => typeof it !== 'string') // filter out comments
    .reduce((allTestCases, [rule, data, expected], idx) => {
      allTestCases.push({
        title: `test case ${idx} - ${JSON.stringify(rule)} - ${JSON.stringify(data)} - ${JSON.stringify(expected)}`,
        logic: rule,
        data: data,
        exp: expected
      })
      return allTestCases
    }, [])
}

const getJsonLogicTestCases = async () => {
  const dirpath = path.resolve(__dirname, './../test/fixtures/jfn/json-logic-tests')
  const allFiles = await fse.readdir(dirpath)
  const allJsonFiles = allFiles.filter(it => it.endsWith('.json'))
  const allTestCasesNested = await Promise.all(allJsonFiles.map(async it => {
    const filepath = path.resolve(dirpath, it)
    const testCaseFile = await fse.readJSON(filepath)
    return convertJsonLogicTestCases(testCaseFile)
  }))
  const allTestCases = allTestCasesNested.flat(1)
  return allTestCases
}

const convertCertLogicTestCases = ({ name: sut, cases }) => {
  return cases.reduce((allTestCases, { name, certLogicExpression, assertions }) => {
    return assertions.reduce((allTestCases, { data, expected }, idx) => {
      allTestCases.push({
        title: `${sut} - ${name} - #${idx + 1} with ${JSON.stringify(data)}`,
        logic: certLogicExpression,
        data: data,
        exp: expected
      })
      return allTestCases
    }, allTestCases)
  }, [])
}

const getCertLogicTestCases = async () => {
  const dirpath = path.resolve(__dirname, './../test/fixtures/jfn/certlogic-tests')
  const allFiles = await fse.readdir(dirpath)
  const allJsonFiles = allFiles.filter(it => it.endsWith('.json'))
  const allTestCasesNested = await Promise.all(allJsonFiles.map(async it => {
    const filepath = path.resolve(dirpath, it)
    const testCaseFile = await fse.readJSON(filepath)
    return convertCertLogicTestCases(testCaseFile)
  }))
  const allTestCases = allTestCasesNested.flat(1)
  return allTestCases
}

const convertJsonFunctionsTestCases = async testCases => testCases

const getJsonFunctionsTestCases = async () => {
  const dirpath = path.resolve(__dirname, './../test/fixtures/jfn/jfn-tests')
  const allFiles = await fse.readdir(dirpath)
  const allJsonFiles = allFiles.filter(it => it.endsWith('.json'))
  const allTestCasesNested = await Promise.all(allJsonFiles.map(async it => {
    const filepath = path.resolve(dirpath, it)
    const testCaseFile = await fse.readJSON(filepath)
    return convertJsonFunctionsTestCases(testCaseFile)
  }))
  const allTestCases = allTestCasesNested.flat(1)
  return allTestCases
}

const getJavaScriptTestCases = async () => {
  return testCasesInJavaScript
    // .map(it => require(`./../test/fixtures/jfn/jfn-tests/${it}`))
    .map(it => it)
    .flat(1)
}

const convertJsonFunctionsFunctionTestCases = async testCases => {
  return testCases.reduce((allTestCases, { title: mainTitle, functions, functionName, scenarios }) => {
    return scenarios.reduce((allTestCases, { title, parameters, exp }) => {
      allTestCases.push({
        title: `${mainTitle} - ${title}`,
        functions,
        evaluateFunction: {
          name: functionName,
          parameters: parameters
        },
        exp
      })
      return allTestCases
    }, allTestCases)
  }, [])
}

const getJsonFunctionsFunctionTestCases = async () => {
  const dirpath = path.resolve(__dirname, './../test/fixtures/jfn/jfn-function-tests')
  const allFiles = await fse.readdir(dirpath)
  const allJsonFiles = allFiles.filter(it => it.endsWith('.json'))
  const allTestCasesNested = await Promise.all(allJsonFiles.map(async it => {
    const filepath = path.resolve(dirpath, it)
    const testCaseFile = await fse.readJSON(filepath)
    return convertJsonFunctionsFunctionTestCases(testCaseFile)
  }))
  const allTestCases = allTestCasesNested.flat(1)
  return allTestCases
}

const main = async () => {
  const allTestCasesNested = await Promise.all([
    getJsonLogicTestCases(),
    getCertLogicTestCases(),
    getJsonFunctionsTestCases(),
    getJavaScriptTestCases(),
    getJsonFunctionsFunctionTestCases()
  ])
  const allTestCases = allTestCasesNested
    .flat(1)
    .sort((a, b) => {
      return a.title > b.title ? 1 : -1
    })
  const data = {
    $comment: `Generated at ${new Date().toString()}`,
    sourceHash: hashJson(allTestCases),
    sourceTreeish: process.env.CCL_TREEISH || 'unknown',
    testCases: allTestCases
  }

  const fileWriter = fileWriterFactory({
    target: path.resolve(process.cwd(), argv.target)
  })

  if (argv.jsonFilename) {
    await fileWriter.fanOutToOS(async (ctx, { prefix: os }) => {
      const targetData = {
        ...data,
        testCases: data.testCases.filter(it => {
          if (os === 'android' && it.androidOptional === true) return false
          if (os === 'ios' && it.iosOptional === true) return false
          return true
        })
      }
      const chunks = chunkifyTestCases(targetData, 3)
      return Promise.all([
        ctx.writeJSON(argv.jsonFilename, targetData),
        ...(chunks.map(chunk => {
          return ctx.writeJSON(`${argv.jsonFilename}.chunk${chunks.indexOf(chunk)}`, chunk)
        }))
      ])
    })
  }
}

main()
  .then(() => console.log('Done.'))
  .catch(err => console.log('Error:', err))
