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
      },
      {
        name: 'certificates'
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
          {
            init: [
              'object',
              'type', 'string',
              'value', 'BW'
            ]
          }
        ]
      },
      {
        assign: [
          'scenarioBW.enabled',
          {
            init: [
              'object',
              'type', 'boolean',
              'value', true
            ]
          }
        ]
      },
      {
        assign: [
          'scenarioSelectionItems',
          {
            push: [
              { var: 'scenarioSelectionItems' },
              { var: 'scenarioBW' }
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
