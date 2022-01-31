/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
import { executeFromFile } from './../../util/execute-jfn-test-case.js'

describe('jfn/function-tests', () => {
  executeFromFile('test/fixtures/jfn/jfn-function-tests/is-same-person.spec.json')
})
