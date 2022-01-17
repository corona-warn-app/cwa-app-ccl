'use strict'

const descriptor = {
  name: '__filterCertificatesByType',
  definition: {
    parameters: [
      { name: 'certificates' },
      { name: 'type' }
    ],
    logic: [
      {
        declare: [
          'filtered',
          {
            if: [
              // if
              {
                '===': [
                  { var: 'type' },
                  'vc'
                ]
              },
              {
                filter: [
                  { var: 'certificates' },
                  {
                    '!!': [
                      { var: 'it.hcert.v.0' }
                    ]
                  },
                  'it'
                ]
              },
              // else if
              {
                '===': [
                  { var: 'type' },
                  'rc'
                ]
              },
              {
                filter: [
                  { var: 'certificates' },
                  {
                    '!!': [
                      { var: 'it.hcert.r.0' }
                    ]
                  },
                  'it'
                ]
              },
              // else if
              {
                '===': [
                  { var: 'type' },
                  'tc'
                ]
              },
              {
                filter: [
                  { var: 'certificates' },
                  {
                    '!!': [
                      { var: 'it.hcert.t.0' }
                    ]
                  },
                  'it'
                ]
              },
              // else
              null
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

module.exports = {
  getDescriptor: () => descriptor,
  toJSON: () => JSON.stringify(descriptor)
}
