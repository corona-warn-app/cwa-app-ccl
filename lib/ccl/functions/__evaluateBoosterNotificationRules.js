const descriptor = {
  name: '__evaluateBoosterNotificationRules',
  definition: {
    parameters: [
      { name: 'vc' },
      { name: 'rc' },
      { name: 'boosterNotificationRules' },
      { name: 'validationClock' }
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
      // process partial dob
      {
        declare: [
          'dobChunks',
          {
            split: [
              { var: 'payload.dob' },
              '-'
            ]
          }
        ]
      },
      {
        declare: [
          'newDob',
          {
            if: [
              // if dob is complete
              {
                '===': [
                  {
                    count: [
                      { var: 'dobChunks' }
                    ]
                  },
                  3
                ]
              },
              // then leave it as-is
              { var: 'payload.dob' },
              // else if dob is partial YYYY-MM
              {
                '===': [
                  {
                    count: [
                      { var: 'dobChunks' }
                    ]
                  },
                  2
                ]
              },
              // then add `-01` to complete the date
              {
                concatenate: [
                  { var: 'payload.dob' },
                  '-01'
                ]
              },
              // else if dob is partial YYYY
              {
                and: [
                  {
                    '===': [
                      {
                        count: [
                          { var: 'dobChunks' }
                        ]
                      },
                      1
                    ]
                  },
                  // first chunk is not empty
                  {
                    '!!': [
                      { var: 'dobChunks.0' }
                    ]
                  }
                ]
              },
              // then add `-01-01` to complete the date
              {
                concatenate: [
                  { var: 'payload.dob' },
                  '-01-01'
                ]
              },
              // else, set it to 18 years
              {
                plusTime: [
                  { var: 'validationClock' },
                  -18,
                  'year'
                ]
              }
            ]
          }
        ]
      },
      {
        assign: [
          'payload.dob',
          { var: 'newDob' }
        ]
      },
      {
        if: [
          {
            '!==': [
              {
                count: [
                  {
                    split: [
                      { var: 'payload.dob' },
                      '-'
                    ]
                  }
                ]
              },
              3
            ]
          },
          {
            assign: [
              'payload.dob',
              {
                plusTime: [
                  { var: 'validationClock' },
                  -18,
                  'year'
                ]
              }
            ]
          }
        ]
      },
      {
        declare: [
          'external',
          {
            init: [
              'object',
              'validationClock', { var: 'validationClock' }
            ]
          }
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
