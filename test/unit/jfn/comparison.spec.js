/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import { executeFromFile } from '../../util/execute-jfn-test-case.js'

describe('jfn/comparison', () => {
  executeFromFile('test/fixtures/jfn/jfn-tests/comparison.spec.json')
})
