const descriptor = {
  name: '__analyzeDccAdmissionCheckScenario',
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
      // scenario selection items
      {
        declare: [
          'scenarioSelectionItems',
          {
            init: [
              'array'
            ]
          }
        ]
      },
      // scenario: DE
      {
        declare: [
          'scenarioDE',
          {
            init: [
              'object'
            ]
          }
        ]
      },
      {
        assign: [
          'scenarioDE.identifier',
          'DE'
        ]
      },
      {
        assign: [
          'scenarioDE.enabled',
          true
        ]
      },
      // scenario: BW
      {
        declare: [
          'scenarioBW',
          {
            init: [
              'object'
            ]
          }
        ]
      },
      {
        assign: [
          'scenarioBW.identifier',
          'BW'
        ]
      },
      {
        assign: [
          'scenarioBW.enabled',
          true
        ]
      },
      // scenario: HH
      {
        declare: [
          'scenarioHH',
          {
            init: [
              'object'
            ]
          }
        ]
      },
      {
        assign: [
          'scenarioHH.identifier',
          'HH'
        ]
      },
      {
        assign: [
          'scenarioHH.enabled',
          false
        ]
      },
      {
        assign: [
          'scenarioSelectionItems',
          {
            push: [
              { var: 'scenarioSelectionItems' },
              { var: 'scenarioDE' },
              { var: 'scenarioBW' },
              { var: 'scenarioHH' }
            ]
          }
        ]
      },
      {
        return: [
          {
            init: [
              'object',
              'scenarioSelectionItems', { var: 'scenarioSelectionItems' }
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
