const descriptor = {
  name: '__evaluateInvalidationRules',
  definition: {
    parameters: [
      { name: 'certificates', default: [] },
      { name: 'invalidationRules', default: [] },
      { name: 'validationClock' }
    ],
    logic: [
      {
        if: [
          {
            '!': [
              { var: 'invalidationRules' }
            ]
          },
          {
            return: [
              {
                init: [
                  'array'
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
          'filtered',
          {
            filter: [
              { var: 'certificates' },
              {
                script: [
                  {
                    if: [
                      {
                        '!': [
                          {
                            or: [
                              { var: 'it.hcert.v.0' },
                              { var: 'it.hcert.r.0' }
                            ]
                          }
                        ]
                      },
                      {
                        return: [
                          false
                        ]
                      }
                    ]
                  },
                  {
                    declare: [
                      'relevantRules',
                      {
                        filter: [
                          { var: 'invalidationRules' },
                          {
                            and: [
                              {
                                '===': [
                                  { var: 'rule.Country' },
                                  { var: 'it.cwt.iss' }
                                ]
                              },
                              {
                                'not-before': [
                                  { var: 'validationClock' },
                                  { var: 'rule.ValidFrom' }
                                ]
                              },
                              {
                                'not-after': [
                                  { var: 'validationClock' },
                                  { var: 'rule.ValidTo' }
                                ]
                              }
                            ]
                          },
                          'rule'
                        ]
                      }
                    ]
                  },
                  {
                    if: [
                      {
                        '!': [
                          { var: 'relevantRules' }
                        ]
                      },
                      {
                        return: [
                          false
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
                          'payload', { var: 'it.hcert' },
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
                          { var: 'relevantRules' },
                          {
                            '===': [
                              {
                                evaluate: [
                                  { var: 'rule.Logic' },
                                  { var: 'parameters' }
                                ]
                              },
                              false
                            ]
                          },
                          'rule'
                        ]
                      }
                    ]
                  },
                  {
                    return: [
                      {
                        '!!': [
                          { var: 'firstMatch' }
                        ]
                      }
                    ]
                  }
                ]
              },
              'it'
            ]
          }
        ]
      },
      {
        return: [
          { var: 'filtered' }
        ]
      }
    ]
  }
}

export default {
  getDescriptor: () => descriptor,
  toJSON: () => JSON.stringify(descriptor)
}
