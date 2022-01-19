'use strict'

const chalk = require('chalk')
const fse = require('fs-extra')
const path = require('path')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const argv = yargs(hideBin(process.argv))
  .option('json-target', {
    string: true
  })
  .argv

const testCasesInJavaScript = [
  'time.moment.spec.js'
]

const convertJsonLogicTestCases = tests => {
  return tests
    .filter(it => typeof it !== 'string') // comments
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
    .map(it => require(`./../test/fixtures/jfn/jfn-tests/${it}`))
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
    testCases: allTestCases
  }

  if (argv.jsonTarget) {
    const targetFilepath = path.resolve(process.cwd(), argv.jsonTarget)
    await fse.ensureFile(targetFilepath)
    await fse.writeJSON(targetFilepath, data, { spaces: 2 })
    console.log(`Created JSON target ${chalk.cyan(argv.jsonTarget)}`)
  }
}

main()
  .then(() => console.log('Done.'))
  .catch(err => console.log('Error:', err))
