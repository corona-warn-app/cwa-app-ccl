/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import {
  executeFromFile
} from './../util/execute-jfn-test-case.js'
import {
  dist as distFixtures
} from './../util/fixtures.js'

describe('dist/ccl-test-cases', () => {
  distFixtures
    .findAllSync(/ccl-test-cases.gen.json$/)
    .forEach(relativeFilepath => {
      executeFromFile(relativeFilepath, {
        transform: data => data.testCases
          .map(testCase => {
            if (data.commonFunctions) testCase.functions = data.commonFunctions
            return testCase
          })
      })
    })
})
