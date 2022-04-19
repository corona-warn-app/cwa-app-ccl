const descriptor = {
  name: '__holder.getNameComponents',
  definition: {
    parameters: [
      { name: 'name' }
    ],
    logic: [
      {
        declare: [
          'cleanName',
          {
            toUpperCase: [
              { var: 'name' }
            ]
          }
        ]
      },
      ...([
        { pattern: '.', replacement: '<' },
        { pattern: '-', replacement: '<' },
        { pattern: 'Ä', replacement: 'AE' },
        { pattern: 'Ö', replacement: 'OE' },
        { pattern: 'Ü', replacement: 'UE' },
        // { pattern: 'AE', replacement: 'A' },
        // { pattern: 'OE', replacement: 'O' },
        // { pattern: 'UE', replacement: 'U' },
        { pattern: 'ß', replacement: 'SS' },
        { pattern: ' ', replacement: '<' },
        { pattern: '<<', replacement: '<' },
        { pattern: '<<', replacement: '<' }
      ].map(it => ({
        assign: [
          'cleanName',
          {
            replaceAll: [
              { var: 'cleanName' },
              it.pattern,
              it.replacement
            ]
          }
        ]
      }))),
      {
        declare: [
          'chunks',
          {
            filter: [
              {
                split: [
                  { var: 'cleanName' },
                  '<'
                ]
              },
              {
                and: [
                  {
                    '!==': [
                      { var: 'it' },
                      'DR'
                    ]
                  },
                  { var: 'it' }
                ]
              },
              'it'
            ]
          }
        ]
      },
      {
        return: [
          { var: 'chunks' }
        ]
      }
    ]
  }
}

export default {
  getDescriptor: () => descriptor,
  toJSON: () => JSON.stringify(descriptor)
}
