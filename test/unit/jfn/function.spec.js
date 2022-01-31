/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import { executeFromFile } from './../../util/execute-jfn-test-case.js'

describe('jfn/function', () => {
  executeFromFile('test/fixtures/jfn/jfn-tests/function.spec.json')
})
