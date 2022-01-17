'use strict'

const descriptor = {
  name: '__sortCertificatesByDate',
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
                      {
                        if: [
                          { var: 'a.hcert.v.0' },
                          { var: 'a.hcert.v.0.dt' },
                          { var: 'a.hcert.r.0' },
                          { var: 'a.hcert.r.0.df' },
                          { var: 'a.hcert.t.0' },
                          { var: 'a.hcert.t.0.sc' },
                          null
                        ]
                      },
                      {
                        if: [
                          { var: 'b.hcert.v.0' },
                          { var: 'b.hcert.v.0.dt' },
                          { var: 'b.hcert.r.0' },
                          { var: 'b.hcert.r.0.df' },
                          { var: 'b.hcert.t.0' },
                          { var: 'b.hcert.t.0.sc' },
                          null
                        ]
                      }
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
                      {
                        if: [
                          { var: 'a.hcert.v.0' },
                          { var: 'a.hcert.v.0.dt' },
                          { var: 'a.hcert.r.0' },
                          { var: 'a.hcert.r.0.df' },
                          { var: 'a.hcert.t.0' },
                          { var: 'a.hcert.t.0.sc' },
                          null
                        ]
                      },
                      {
                        if: [
                          { var: 'b.hcert.v.0' },
                          { var: 'b.hcert.v.0.dt' },
                          { var: 'b.hcert.r.0' },
                          { var: 'b.hcert.r.0.df' },
                          { var: 'b.hcert.t.0' },
                          { var: 'b.hcert.t.0.sc' },
                          null
                        ]
                      }
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
