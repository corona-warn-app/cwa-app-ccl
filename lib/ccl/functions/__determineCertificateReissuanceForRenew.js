const descriptor = {
  name: '__determineCertificateReissuanceForRenew',
  definition: {
    parameters: [
      { name: 'allRelevantVCsAndRCsAnnotatedWithContext' },
      { name: 'allRCs' }
    ],
    logic: [
      {
        declare: [
          'reissuanceNode',
          {
            init: [
              'object'
            ]
          }
        ]
      },
      {
        declare: [
          'hasNofM',
          {
            filter: [
              { var: 'allRelevantVCsAndRCsAnnotatedWithContext' },
              // 2/1, 3/1, etc.
              {
                and: [
                  { var: 'it.__isVC' },
                  {
                    '>': [
                      { var: 'it.hcert.v.0.dn' },
                      { var: 'it.hcert.v.0.sd' }
                    ]
                  }
                ]
              },
              'it'
            ]
          }
        ]
      },
      // return early if there is already a 2/1 or 3/1
      {
        if: [
          {
            '!!': [
              { var: 'hasNofM' }
            ]
          },
          {
            return: [
              { var: 'reissuanceNode' }
            ]
          }
        ]
      },
      {
        declare: [
          'certificateToReissue',
          {
            find: [
              { var: 'allRelevantVCsAndRCsAnnotatedWithContext' },
              { var: 'it.__isElegibleForReissuance' },
              'it'
            ]
          }
        ]
      },
      // return early if there is no certificate to reissue
      {
        if: [
          {
            '!': [
              { var: 'certificateToReissue' }
            ]
          },
          {
            return: [
              { var: 'reissuanceNode' }
            ]
          }
        ]
      },
      {
        declare: [
          'accompanyingCertificates',
          {
            init: [
              'array'
            ]
          }
        ]
      },
      {
        assign: [
          'reissuanceNode.certificateReissuance',
          {
            init: [
              'object',
              'identifier', 'renew',
              'textKeySuffix', 'RENEW',
              'certificates', {
                init: [
                  'array'
                ]
              }
            ]
          }
        ]
      },
      {
        declare: [
          'accompanyingRC',
          {
            find: [
              { var: 'allRCs' },
              {
                and: [
                  {
                    before: [
                      { var: 'it.hcert.r.0.fr' },
                      { var: 'certificateToReissue.__dateOfEvent' }
                    ]
                  },
                  {
                    '===': [
                      { var: 'it.cwt.iss' },
                      'DE'
                    ]
                  }
                ]
              },
              'it'
            ]
          }
        ]
      },
      {
        if: [
          { var: 'accompanyingRC' },
          {
            assign: [
              'accompanyingCertificates',
              {
                push: [
                  { var: 'accompanyingCertificates' },
                  { var: 'accompanyingRC' }
                ]
              }
            ]
          }
        ]
      },
      {
        declare: [
          'accompanyingVC',
          {
            find: [
              { var: 'allRelevantVCsAndRCsAnnotatedWithContext' },
              {
                and: [
                  {
                    or: [
                      { var: 'it.__isJanssen1Of1' },
                      { var: 'it.__isRecoveryVaccination' }
                    ]
                  },
                  {
                    before: [
                      { var: 'it.__dateOfEvent' },
                      { var: 'certificateToReissue.__dateOfEvent' }
                    ]
                  },
                  {
                    '===': [
                      { var: 'it.cwt.iss' },
                      'DE'
                    ]
                  }
                ]
              },
              'it'
            ]
          }
        ]
      },
      {
        if: [
          { var: 'accompanyingVC' },
          {
            assign: [
              'accompanyingCertificates',
              {
                push: [
                  { var: 'accompanyingCertificates' },
                  { var: 'accompanyingVC' }
                ]
              }
            ]
          }
        ]
      },
      {
        assign: [
          'reissuanceNode.certificateReissuance.certificates',
          {
            push: [
              { var: 'reissuanceNode.certificateReissuance.certificates' },
              {
                init: [
                  'object',
                  'certificateToReissue', { var: 'certificateToReissue' },
                  'accompanyingCertificates', { var: 'accompanyingCertificates' },
                  'action', 'renew'
                ]
              }
            ]
          }
        ]
      },
      {
        if: [
          // name mismatch in certificates (i.e. first and last name swapped)
          {
            some: [
              { var: 'accompanyingCertificates' },
              {
                '!': [
                  {
                    call: [
                      '__holder.equals',
                      {
                        holderA: { var: 'certificateToReissue.hcert' },
                        holderB: { var: 'it.hcert' }
                      }
                    ]
                  }
                ]
              },
              'it'
            ]
          },
          {
            return: [
              {
                init: [
                  'object'
                ]
              }
            ]
          }
        ]
      },
      {
        return: [
          { var: 'reissuanceNode' }
        ]
      }
    ]
  }
}

export default {
  getDescriptor: () => descriptor,
  toJSON: () => JSON.stringify(descriptor)
}
