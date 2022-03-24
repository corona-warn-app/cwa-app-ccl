const descriptor = {
  name: 'getVaccinationStateLongTextV2',
  definition: {
    parameters: [
      { name: 'now' },
      { name: 'date' },
      { name: 'offsetInDays' },
      { name: 'vaccinationState' }
    ],
    logic: [
      {
        declare: [
          'diff',
          {
            diffTime: [
              {
                plusTime: [
                  { var: 'date' },
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
                        { var: 'vaccinationState' },
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
                        {
                          replaceAll: [
                            { var: 'vaccinationState' },
                            '_PENDING',
                            ''
                          ]
                        },
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
