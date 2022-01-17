'use strict'

const descriptor = {
  name: '__i18n.getText',
  definition: {
    parameters: [
      { name: 'key' },
      { name: 'parameters', default: [] }
    ],
    logic: [
      {
        declare: [
          'text',
          {
            call: [
              '__i18n.getTextByKey',
              {
                key: { var: 'key' },
                lang: 'de'
              }
            ]
          }
        ]
      },
      {
        return: [
          {
            init: [
              'object',
              'type', 'singular',
              'localizedString', { var: 'text' },
              'parameters', { var: 'parameters' }
            ]
          }
        ]
      }
    ]
  }
}

module.exports = {
  getDescriptor: () => descriptor,
  toJSON: () => JSON.stringify(descriptor)
}
