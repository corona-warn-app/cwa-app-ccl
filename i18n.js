'use strict'
const path = require('path')

const ccl = require('./lib/ccl')
const directoryPath = path.resolve(__dirname, './resources/i18n')

const main = async () => {
  const textDescriptors = await ccl.i18n.readTextDescriptorsFromDirectory(directoryPath)
  console.log('textDescriptors: %o', textDescriptors)
}
main()
