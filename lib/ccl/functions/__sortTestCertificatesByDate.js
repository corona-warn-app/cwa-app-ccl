'use strict'

const descriptor = {
  name: '__sortTestCertificatesByDate',
  definition: {
    parameters: [
      { name: 'certificates' },
      { name: 'ascending', default: true }
    ],
    logic: [
      {
        declare: [
          'sorted',
          {
            if: [
              { var: 'ascending' },
              // sort ascending
              {
                sort: [
                  { var: 'certificates' },
                  {
                    after: [
                      { var: 'a.hcert.t.0.sc' },
                      { var: 'b.hcert.t.0.sc' }
                    ]
                  }
                ]
              },
              // sort descending
              {
                sort: [
                  { var: 'certificates' },
                  {
                    before: [
                      { var: 'a.hcert.t.0.sc' },
                      { var: 'b.hcert.t.0.sc' }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        return: [
          { var: 'sorted' }
        ]
      }
    ]
  }
}

module.exports = {
  getDescriptor: () => descriptor,
  toJSON: () => JSON.stringify(descriptor)
}
