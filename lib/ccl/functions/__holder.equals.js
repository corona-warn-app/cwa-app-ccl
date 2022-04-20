const descriptor = {
  name: '__holder.equals',
  definition: {
    parameters: [
      { name: 'holderA' },
      { name: 'holderB' }
    ],
    logic: [
      {
        if: [
          {
            '!==': [
              {
                trim: [
                  { var: 'holderA.dob' }
                ]
              },
              {
                trim: [
                  { var: 'holderB.dob' }
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
          'holderAComponentsGnt',
          {
            call: [
              '__holder.getNameComponents',
              {
                name: { var: 'holderA.nam.gnt' }
              }
            ]
          }
        ]
      },
      {
        declare: [
          'holderAComponentsFnt',
          {
            call: [
              '__holder.getNameComponents',
              {
                name: { var: 'holderA.nam.fnt' }
              }
            ]
          }
        ]
      },
      {
        declare: [
          'holderBComponentsGnt',
          {
            call: [
              '__holder.getNameComponents',
              {
                name: { var: 'holderB.nam.gnt' }
              }
            ]
          }
        ]
      },
      {
        declare: [
          'holderBComponentsFnt',
          {
            call: [
              '__holder.getNameComponents',
              {
                name: { var: 'holderB.nam.fnt' }
              }
            ]
          }
        ]
      },
      {
        declare: [
          'intersectionAGntWithBGnt',
          {
            call: [
              '__intersectArrays',
              {
                arrayA: { var: 'holderAComponentsGnt' },
                arrayB: { var: 'holderBComponentsGnt' }
              }
            ]
          }
        ]
      },
      {
        declare: [
          'intersectionAFntWithBFnt',
          {
            call: [
              '__intersectArrays',
              {
                arrayA: { var: 'holderAComponentsFnt' },
                arrayB: { var: 'holderBComponentsFnt' }
              }
            ]
          }
        ]
      },
      {
        if: [
          {
            and: [
              {
                or: [
                  // match in gnt
                  {
                    '!!': [
                      { var: 'intersectionAGntWithBGnt' }
                    ]
                  },
                  // both gnt are empty
                  {
                    and: [
                      {
                        '!': [
                          { var: 'holderAComponentsGnt' }
                        ]
                      },
                      {
                        '!': [
                          { var: 'holderBComponentsGnt' }
                        ]
                      }
                    ]
                  }
                ]
              },
              // match in fnt
              {
                '!!': [
                  { var: 'intersectionAFntWithBFnt' }
                ]
              }
            ]
          },
          {
            return: [
              true
            ]
          }
        ]
      },
      // {
      //   declare: [
      //     'intersectionAGntWithBFnt',
      //     {
      //       call: [
      //         '__intersectArrays',
      //         {
      //           arrayA: { var: 'holderAComponentsGnt' },
      //           arrayB: { var: 'holderBComponentsFnt' }
      //         }
      //       ]
      //     }
      //   ]
      // },
      // {
      //   declare: [
      //     'intersectionAFntWithBGnt',
      //     {
      //       call: [
      //         '__intersectArrays',
      //         {
      //           arrayA: { var: 'holderAComponentsFnt' },
      //           arrayB: { var: 'holderBComponentsGnt' }
      //         }
      //       ]
      //     }
      //   ]
      // },
      // {
      //   if : [
      //     {
      //       and: [
      //         // match in intersectionAGntWithBFnt
      //         {
      //           '!!': [
      //             { var: 'intersectionAGntWithBFnt' }
      //           ]
      //         },
      //         // match in intersectionAFntWithBGnt
      //         {
      //           '!!': [
      //             { var: 'intersectionAFntWithBGnt' }
      //           ]
      //         }
      //       ]
      //     },
      //     {
      //       return: [
      //         true
      //       ]
      //     }
      //   ]
      // },
      {
        return: [
          false
        ]
      }
    ]
  }
}

export default {
  getDescriptor: () => descriptor,
  toJSON: () => JSON.stringify(descriptor)
}
