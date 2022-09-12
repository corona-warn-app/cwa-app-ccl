const scenarios = [
  { identifier: 'DE', subtitle: true, enabled: true },
  { identifier: 'BW', subtitle: false, enabled: true },
  { identifier: 'BY', subtitle: false, enabled: true },
  { identifier: 'BE', subtitle: false, enabled: false },
  { identifier: 'BB', subtitle: false, enabled: false },
  { identifier: 'HB', subtitle: false, enabled: false },
  { identifier: 'HH', subtitle: false, enabled: false },
  { identifier: 'HE', subtitle: false, enabled: false },
  { identifier: 'MV', subtitle: false, enabled: false },
  { identifier: 'NI', subtitle: false, enabled: false },
  { identifier: 'NW', subtitle: false, enabled: false },
  { identifier: 'RP', subtitle: false, enabled: false },
  { identifier: 'SL', subtitle: false, enabled: false },
  { identifier: 'SN', subtitle: false, enabled: false },
  { identifier: 'ST', subtitle: false, enabled: false },
  { identifier: 'SH', subtitle: false, enabled: false },
  { identifier: 'TH', subtitle: false, enabled: false }
]

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
      // label text
      {
        declare: [
          'labelText',
          {
            call: [
              '__i18n.getTextDescriptor',
              {
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
              'object',
              'titleText', {
                call: [
                  '__i18n.getTextDescriptor',
                  {
                    key: 'ADMISSION_SCENARIO_SELECTION_TITLE_TEXT'
                  }
                ]
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
              scenarios,
              {
                script: [
                  {
                    declare: [
                      'scenarioSelectionItem',
                      {
                        init: [
                          'object',
                          'identifier', { var: 'it.identifier' },
                          'titleText', {
                            call: [
                              '__i18n.getTextDescriptor',
                              {
                                key: {
                                  concatenate: [
                                    'ADMISSION_SCENARIO_SELECTION_',
                                    { var: 'it.identifier' },
                                    '_TITLE_TEXT'
                                  ]
                                }
                              }
                            ]
                          },
                          'enabled', { var: 'it.enabled' }
                        ]
                      }
                    ]
                  },
                  {
                    if: [
                      { var: 'it.subtitle' },
                      {
                        assign: [
                          'scenarioSelectionItem.subtitleText',
                          {
                            call: [
                              '__i18n.getTextDescriptor',
                              {
                                key: {
                                  concatenate: [
                                    'ADMISSION_SCENARIO_SELECTION_',
                                    { var: 'it.identifier' },
                                    '_SUBTITLE_TEXT'
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
                    if: [
                      {
                        '!': [
                          { var: 'it.enabled' }
                        ]
                      },
                      {
                        assign: [
                          'scenarioSelectionItem.subtitleText',
                          {
                            call: [
                              '__i18n.getTextDescriptor',
                              {
                                key: 'ADMISSION_SCENARIO_SELECTION_SUBTITLE_TEXT_DISABLED'
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  },
                  {
                    return: [
                      { var: 'scenarioSelectionItem' }
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
