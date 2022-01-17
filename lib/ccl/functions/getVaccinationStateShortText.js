'use strict'

const descriptor = {
  name: 'getVaccinationStateShortText',
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
            diffTime: [
              { var: 'now.localDate' },
              { var: 'dt' },
              'day'
            ]
          }
        ]
      },
      {
        return: [
          {
            call: [
              '__i18n.getText',
              {
                key: {
                  concatenate: [
                    'VACCINATION_STATE_SUBTITLE'
                  ]
                },
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
