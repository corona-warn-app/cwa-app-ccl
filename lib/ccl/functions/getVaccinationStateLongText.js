'use strict'

const descriptor = {
  name: 'getVaccinationStateLongText',
  definition: {
    parameters: [
      { name: 'now' },
      { name: 'dt' }
    ],
    logic: [
      {
        declare: [
          'diff',
          {
            '+': [
              {
                diffTime: [
                  {
                    plusTime: [
                      { var: 'dt' },
                      14,
                      'day'
                    ]
                  },
                  { var: 'now.utcDateTimeMidnight' },
                  'day'
                ]
              },
              1
            ]
          }
        ]
      },
      {
        declare: [
          'textDescriptor',
          {
            if: [
              {
                '>': [
                  { var: 'diff' },
                  0
                ]
              },
              {
                call: [
                  '__i18n.getQuantityDescriptor',
                  {
                    key: {
                      concatenate: [
                        'VACCINATION_STATE_',
                        'COMPLETE_IMMUNIZATION_PENDING',
                        '_LONG_TEXT'
                      ]
                    },
                    quantity: { var: 'diff' },
                    parameters: {
                      init: [
                        'array',
                        {
                          init: [
                            'object',
                            'type', 'number',
                            'value', { var: 'diff' }
                          ]
                        }
                      ]
                    }
                  }
                ]
              },
              // else
              {
                call: [
                  '__i18n.getTextDescriptor',
                  {
                    key: {
                      concatenate: [
                        'VACCINATION_STATE_',
                        'COMPLETE_IMMUNIZATION',
                        '_LONG_TEXT'
                      ]
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        return: [
          { var: 'textDescriptor' }
        ]
      }
    ]
  }
}

module.exports = {
  getDescriptor: () => descriptor,
  toJSON: () => JSON.stringify(descriptor)
}
