/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import { executeFromFile } from './../../util/execute-jfn-test-case.js'

describe('jfn/function-tests', () => {
  executeFromFile('test/fixtures/jfn/jfn-function-tests/is-same-person.spec.json', {
    transform: data => data
      .reduce((testCases, test) => {
        return test.scenarios.reduce((testCases, scenario) => {
          testCases.push({
            title: `${test.title} - ${scenario.title}`,
            functions: test.functions,
            evaluateFunction: {
              name: test.functionName,
              parameters: scenario.parameters
            },
            exp: scenario.exp,
            throws: scenario.throws
          })
          return testCases
        }, testCases)
      }, [])
  })
})
