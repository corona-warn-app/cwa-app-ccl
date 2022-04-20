const descriptor = {
  name: '__intersectArrays',
  definition: {
    parameters: [
      { name: 'arrayA' },
      { name: 'arrayB' }
    ],
    logic: [
      {
        declare: [
          'intersection',
          {
            filter: [
              {
                var: 'arrayA'
              },
              {
                in: [
                  {
                    var: 'a'
                  },
                  {
                    var: 'arrayB'
                  }
                ]
              },
              'a'
            ]
          }
        ]
      },
      {
        return: [
          {
            var: 'intersection'
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
