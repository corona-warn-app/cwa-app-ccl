'use strict'

const descriptor = {
  name: '__i18n.getTextDescriptor',
  definition: {
    parameters: [
      { name: 'key' },
      { name: 'parameters', default: [] }
    ],
    logic: [
      {
        declare: [
          'textBundle',
          {
            call: [
              '__i18n.getTextBundle'
            ]
          }
        ]
      },
      {
        declare: [
          'descriptor',
          {
            find: [
              { var: 'textBundle' },
              {
                '===': [
                  { var: 'it.name' },
                  { var: 'key' }
                ]
              },
              'it'
            ]
          }
        ]
      },
      {
        return: [
          {
            init: [
              'object',
              'type', { var: 'descriptor.type' },
              'localizedText', { var: 'descriptor.localizedText' },
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
