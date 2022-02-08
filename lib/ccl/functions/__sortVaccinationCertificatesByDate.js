const descriptor = {
  name: '__sortVaccinationCertificatesByDate',
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
                    if: [
                      {
                        '===': [
                          { var: 'a.hcert.v.0.dt' },
                          { var: 'b.hcert.v.0.dt' }
                        ]
                      },
                      // then
                      {
                        '>': [
                          { var: 'a.cwt.iat' },
                          { var: 'b.cwt.iat' }
                        ]
                      },
                      {
                        after: [
                          { var: 'a.hcert.v.0.dt' },
                          { var: 'b.hcert.v.0.dt' }
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
                    if: [
                      {
                        '===': [
                          { var: 'a.hcert.v.0.dt' },
                          { var: 'b.hcert.v.0.dt' }
                        ]
                      },
                      // then
                      {
                        '<': [
                          { var: 'a.cwt.iat' },
                          { var: 'b.cwt.iat' }
                        ]
                      },
                      {
                        before: [
                          { var: 'a.hcert.v.0.dt' },
                          { var: 'b.hcert.v.0.dt' }
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

export default {
  getDescriptor: () => descriptor,
  toJSON: () => JSON.stringify(descriptor)
}
