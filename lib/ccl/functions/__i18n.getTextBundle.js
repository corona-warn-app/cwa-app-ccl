'use strict'

const path = require('path')

const i18n = require('./../ccl-i18n')

const _getDescriptor = () => {
  const directoryPath = path.resolve(__dirname, './../../../resources/i18n')
  const textDescriptors = i18n.readTextDescriptorsFromDirectory(directoryPath)
  const descriptor = {
    name: '__i18n.getTextBundle',
    definition: {
      parameters: [
      ],
      logic: [
        {
          return: [
            textDescriptors
          ]
        }
      ]
    }
  }
  return descriptor
}

module.exports = {
  getDescriptor: () => _getDescriptor(),
  toJSON: () => JSON.stringify(_getDescriptor())
}
