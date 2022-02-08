const descriptor = {
  name: '__sortRecoveryCertificatesByDate',
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
                          { var: 'a.hcert.r.0.fr' },
                          { var: 'b.hcert.r.0.fr' }
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
                          { var: 'a.hcert.r.0.fr' },
                          { var: 'b.hcert.r.0.fr' }
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
                          { var: 'a.hcert.r.0.fr' },
                          { var: 'b.hcert.r.0.fr' }
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
                          { var: 'a.hcert.r.0.fr' },
                          { var: 'b.hcert.r.0.fr' }
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
