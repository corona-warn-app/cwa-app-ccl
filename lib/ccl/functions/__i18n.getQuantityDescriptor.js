'use strict'

const descriptor = {
  name: '__i18n.getQuantityDescriptor',
  definition: {
    parameters: [
      { name: 'key' },
      { name: 'quantity' },
      { name: 'quantityParameterIndex', default: -1 },
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
        declare: [
          'quantityAttribute',
          {
            if: [
              {
                '>=': [
                  { var: 'quantityParameterIndex' },
                  0
                ]
              },
              'quantityParameterIndex',
              // else
              'quantity'
            ]
          }
        ]
      },
      {
        declare: [
          'quantityAttributeValue',
          {
            if: [
              {
                '>=': [
                  { var: 'quantityParameterIndex' },
                  0
                ]
              },
              { var: 'quantityParameterIndex' },
              // else
              { var: 'quantity' }
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
              { var: 'quantityAttribute' }, { var: 'quantityAttributeValue' },
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
