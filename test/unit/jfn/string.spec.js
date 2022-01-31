/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import { executeFromFile } from './../../util/execute-jfn-test-case.js'

describe('jfn/array', () => {
  executeFromFile('test/fixtures/jfn/jfn-tests/string.spec.json')
})
