/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import { executeFromFile } from './../../util/execute-jfn-test-case.js'

describe('jfn/scripts', () => {
  executeFromFile('test/fixtures/jfn/jfn-tests/script.spec.json')
})
