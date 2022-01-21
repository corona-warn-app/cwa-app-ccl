const descriptor = {
  name: 'getVaccinationStateSubtitleText',
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
              { var: 'now.utcDateTimeMidnight' },
              { var: 'dt' },
              'day'
            ]
          }
        ]
      },
      {
        declare: [
          'textDescriptor',
          {
            call: [
              '__i18n.getQuantityDescriptor',
              {
                key: 'VACCINATION_STATE_SUBTITLE_TEXT',
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
