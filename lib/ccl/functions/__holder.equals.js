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
        declare: [
          'emptyBothGnt',
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
      {
        declare: [
          'emptyBothFnt',
          {
            and: [
              {
                '!': [
                  { var: 'holderAComponentsFnt' }
                ]
              },
              {
                '!': [
                  { var: 'holderBComponentsFnt' }
                ]
              }
            ]
          }
        ]
      },
      {
        if: [
          {
            or: [
              // (intersectionAGntWithBGnt.length >= 1 || emptyBothGnt) && intersectionAFntWithBFnt.length >= 1
              {
                and: [
                  {
                    or: [
                      {
                        '!!': [
                          { var: 'intersectionAGntWithBGnt' }
                        ]
                      },
                      { var: 'emptyBothGnt' }
                    ]
                  },
                  {
                    '!!': [
                      { var: 'intersectionAFntWithBFnt' }
                    ]
                  }
                ]
              },
              // (intersectionAFntWithBFnt.length >= 1 || emptyBothFnt) && intersectionAGntWithBGnt.length >= 1
              {
                and: [
                  {
                    or: [
                      {
                        '!!': [
                          { var: 'intersectionAFntWithBFnt' }
                        ]
                      },
                      { var: 'emptyBothFnt' }
                    ]
                  },
                  {
                    '!!': [
                      { var: 'intersectionAGntWithBGnt' }
                    ]
                  }
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
      {
        declare: [
          'intersectionAGntWithBFnt',
          {
            call: [
              '__intersectArrays',
              {
                arrayA: { var: 'holderAComponentsGnt' },
                arrayB: { var: 'holderBComponentsFnt' }
              }
            ]
          }
        ]
      },
      {
        declare: [
          'intersectionAFntWithBGnt',
          {
            call: [
              '__intersectArrays',
              {
                arrayA: { var: 'holderAComponentsFnt' },
                arrayB: { var: 'holderBComponentsGnt' }
              }
            ]
          }
        ]
      },
      {
        declare: [
          'emptyAGntAndBFnt',
          {
            and: [
              {
                '!': [
                  { var: 'holderAComponentsGnt' }
                ]
              },
              {
                '!': [
                  { var: 'holderBComponentsFnt' }
                ]
              }
            ]
          }
        ]
      },
      {
        declare: [
          'emptyAFntAndBGnt',
          {
            and: [
              {
                '!': [
                  { var: 'holderAComponentsFnt' }
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
      {
        if: [
          {
            or: [
              // (intersectionAFntWithBGnt.length >= 1 || emptyAFntAndBGnt) && intersectionAGntWithBFnt.length >= 1
              {
                and: [
                  {
                    or: [
                      {
                        '!!': [
                          { var: 'intersectionAFntWithBGnt' }
                        ]
                      },
                      { var: 'emptyAFntAndBGnt' }
                    ]
                  },
                  {
                    '!!': [
                      { var: 'intersectionAGntWithBFnt' }
                    ]
                  }
                ]
              },
              // (intersectionAGntWithBFnt.length >= 1 || emptyAGntAndBFnt) && intersectionAFntWithBGnt.length >= 1
              {
                and: [
                  {
                    or: [
                      {
                        '!!': [
                          { var: 'intersectionAGntWithBFnt' }
                        ]
                      },
                      { var: 'emptyAGntAndBFnt' }
                    ]
                  },
                  {
                    '!!': [
                      { var: 'intersectionAFntWithBGnt' }
                    ]
                  }
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
