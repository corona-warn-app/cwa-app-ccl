const descriptor = {
  name: 'getVaccinationStateLongText',
  definition: {
    parameters: [
      { name: 'now' },
      { name: 'dt' },
      { name: 'offsetInDays' }
    ],
    logic: [
      {
        declare: [
          'diff',
          {
            diffTime: [
              {
                plusTime: [
                  { var: 'dt' },
                  { var: 'offsetInDays' },
                  'day'
                ]
              },
              { var: 'now.utcDateTimeMidnight' },
              'day'
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

export default {
  getDescriptor: () => descriptor,
  toJSON: () => JSON.stringify(descriptor)
}
