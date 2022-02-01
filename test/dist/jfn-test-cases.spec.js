/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import {
  executeFromFile
} from './../util/execute-jfn-test-case.js'
import {
  dist as distFixtures
} from './../util/fixtures.js'

describe('dist/jfn-test-cases', () => {
  distFixtures
    .findAllSync(/jfn-test-cases.gen.json$/)
    .forEach(relativeFilepath => {
      executeFromFile(relativeFilepath, {
        transform: data => data.testCases
      })
    })
})
