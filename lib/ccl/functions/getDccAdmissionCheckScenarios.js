const descriptor = {
  name: 'getDccAdmissionCheckScenarios',
  definition: {
    parameters: [
      {
        name: 'os'
      },
      {
        name: 'language'
      },
      {
        name: 'now'
      }
    ],
    logic: [
      {
        declare: [
          'scenarioAnalysis',
          {
            call: [
              '__analyzeDccAdmissionCheckScenario',
              {
                os: { var: 'os' },
                language: { var: 'language' },
                now: { var: 'now' }
              }
            ]
          }
        ]
      },
      // label text
      {
        declare: [
          'labelText',
          {
            init: [
              'object'
            ]
          }
        ]
      },
      {
        assign: [
          'labelText',
          {
            call: [
              '__i18n.getTextDescriptor',
              {
                // de: Status für folgendes Bundesland
                key: 'ADMISSION_SCENARIO_LABEL_TEXT'
              }
            ]
          }
        ]
      },
      // scenario selection
      {
        declare: [
          'scenarioSelection',
          {
            init: [
              'object'
            ]
          }
        ]
      },
      {
        assign: [
          'scenarioSelection.titleText',
          {
            call: [
              '__i18n.getTextDescriptor',
              {
                // de: Ihr Bundesland
                key: 'ADMISSION_SCENARIO_SELECTION_TITLE_TEXT'
              }
            ]
          }
        ]
      },
      {
        assign: [
          'scenarioSelection.items',
          {
            map: [
              { var: 'scenarioAnalysis.scenarioSelectionItems' },
              {
                init: [
                  'object',
                  'identifier', {
                    init: [
                      'object',
                      'value', { var: 'it.identifier' }
                    ]
                  },
                  'titleText', {
                    call: [
                      '__i18n.getTextDescriptor',
                      {
                        // de: Baden-Württemberg
                        key: {
                          concatenate: [
                            'ADMISSION_SCENARIO_SELECTION_',
                            {
                              toUpperCase: [
                                { var: 'it.identifier' }
                              ]
                            },
                            '_TITLE_TEXT'
                          ]
                        }
                      }
                    ]
                  },
                  'subtitleText', {
                    call: [
                      '__i18n.getTextDescriptor',
                      {
                        // de: no value
                        key: {
                          concatenate: [
                            'ADMISSION_SCENARIO_SELECTION_',
                            {
                              toUpperCase: [
                                { var: 'it.identifier' }
                              ]
                            },
                            '_SUBTITLE_TEXT'
                          ]
                        }
                      }
                    ]
                  },
                  'enabled', {
                    init: [
                      'object',
                      'value', { var: 'it.enabled' }
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
          {
            init: [
              'object',
              'labelText', { var: 'labelText' },
              'scenarioSelection', { var: 'scenarioSelection' }
            ]
          }
        ]
      }
    ]
  }
}

export default {
  getDescriptor: () => descriptor,
  toJSON: () => JSON.stringify(descriptor)
}
