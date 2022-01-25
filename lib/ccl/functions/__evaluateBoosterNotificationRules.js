const descriptor = {
  name: '__evaluateBoosterNotificationRules',
  definition: {
    parameters: [
      { name: 'vc' },
      { name: 'rc' },
      { name: 'boosterNotificationRules' }
    ],
    logic: [
      {
        if: [
          {
            '!': [
              { var: 'vc' }
            ]
          },
          {
            return: [
              null
            ]
          }
        ]
      },
      {
        declare: [
          'payload',
          { var: 'vc.hcert' }
        ]
      },
      {
        if: [
          { var: 'rc' },
          {
            assign: [
              'payload.r',
              { var: 'rc.hcert.r' }
            ]
          }
        ]
      },
      {
        declare: [
          'external',
          null
        ]
      },
      {
        declare: [
          'parameters',
          {
            init: [
              'object',
              'payload', { var: 'payload' },
              'external', { var: 'external' }
            ]
          }
        ]
      },
      {
        declare: [
          'firstMatch',
          {
            find: [
              { var: 'boosterNotificationRules' },
              {
                evaluate: [
                  { var: 'it.Logic' },
                  { var: 'parameters' }
                ]
              },
              'it'
            ]
          }
        ]
      },
      {
        if: [
          { var: 'firstMatch' },
          {
            assign: [
              'firstMatch.DescriptionByLang',
              {
                reduce: [
                  { var: 'firstMatch.Description' },
                  {
                    script: [
                      {
                        assign: [
                          {
                            concatenate: [
                              'accumulator.',
                              { var: 'current.lang' }
                            ]
                          },
                          { var: 'current.desc' }
                        ]
                      },
                      {
                        return: [
                          { var: 'accumulator' }
                        ]
                      }
                    ]
                  },
                  {
                    init: [
                      'object'
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        return: [
          { var: 'firstMatch' }
        ]
      }
    ]
  }
}

export default {
  getDescriptor: () => descriptor,
  toJSON: () => JSON.stringify(descriptor)
}
