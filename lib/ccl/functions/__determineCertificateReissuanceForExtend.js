import * as constants from './../ccl-constants.js'

const SECONDS_PER_DAY = 86400
const SECONDS_BEFORE_EXPIRATION_INCLUSIVE = SECONDS_PER_DAY * constants.DCC_REISSUANCE_EXTEND_DAYS_BEFORE_EXPIRATION_INCLUSIVE
const SECONDS_AFTER_EXPIRATION_EXCLUSIVE = SECONDS_PER_DAY * constants.DCC_REISSUANCE_EXTEND_DAYS_AFTER_EXPIRATION_EXCLUSIVE

const descriptor = {
  name: '__determineCertificateReissuanceForExtend',
  definition: {
    parameters: [
      { name: 'certificates' },
      { name: 'now' }
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
          'extendableCertificates',
          {
            script: [
              {
                declare: [
                  'filtered',
                  {
                    filter: [
                      { var: 'certificates' },
                      {
                        and: [
                          // VC or RC
                          {
                            or: [
                              { var: 'it.hcert.v.0' },
                              { var: 'it.hcert.r.0' }
                            ]
                          },
                          {
                            '===': [
                              { var: 'it.cwt.iss' },
                              'DE'
                            ]
                          },
                          {
                            in: [
                              { var: 'it.validityState' },
                              [
                                'VALID',
                                'EXPIRING_SOON',
                                'EXPIRED'
                              ]
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
                declare: [
                  'annotated',
                  {
                    map: [
                      { var: 'filtered' },
                      {
                        script: [
                          {
                            assign: [
                              'it.__isVC',
                              {
                                '!!': [
                                  { var: 'it.hcert.v.0' }
                                ]
                              }
                            ]
                          },
                          {
                            assign: [
                              'it.__isRC',
                              {
                                '!!': [
                                  { var: 'it.hcert.r.0' }
                                ]
                              }
                            ]
                          },
                          {
                            assign: [
                              'it.__dateOfEvent',
                              {
                                if: [
                                  { var: 'it.hcert.v.0' },
                                  { var: 'it.hcert.v.0.dt' },
                                  { var: 'it.hcert.r.0.fr' }
                                ]
                              }
                            ]
                          },
                          {
                            return: [
                              { var: 'it' }
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
                declare: [
                  'sorted',
                  {
                    call: [
                      '__sortCertificatesByDate',
                      {
                        certificates: { var: 'annotated' },
                        ascending: true
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
        ]
      },
      {
        declare: [
          'certificatesToReissue',
          {
            filter: [
              { var: 'extendableCertificates' },
              {
                and: [
                  {
                    '<=': [
                      {
                        '-': [
                          { var: 'it.cwt.exp' },
                          SECONDS_BEFORE_EXPIRATION_INCLUSIVE
                        ]
                      },
                      { var: 'now.timestamp' }
                    ]
                  },
                  {
                    '>': [
                      {
                        '+': [
                          { var: 'it.cwt.exp' },
                          SECONDS_AFTER_EXPIRATION_EXCLUSIVE
                        ]
                      },
                      { var: 'now.timestamp' }
                    ]
                  },
                  // no subsequent booster 3/3
                  {
                    if: [
                      { var: 'it.__isVC' },
                      // then
                      {
                        or: [
                          // no other VC after it (i.e. latest/youngest)
                          {
                            '!': [
                              {
                                some: [
                                  { var: 'extendableCertificates' },
                                  {
                                    and: [
                                      { var: 'inner.__isVC' },
                                      {
                                        after: [
                                          { var: 'inner.__dateOfEvent' },
                                          { var: 'it.__dateOfEvent' }
                                        ]
                                      }
                                    ]
                                  },
                                  'inner'
                                ]
                              }
                            ]
                          },
                          // ... or U18
                          {
                            '<': [
                              {
                                diffTime: [
                                  { var: 'now.localDate' },
                                  { var: 'it.hcert.dob' },
                                  'year'
                                ]
                              },
                              18
                            ]
                          }
                        ]
                      },
                      // else, it's an RC and no additional check applies
                      true
                    ]
                  }
                ]
              },
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
              { var: 'certificatesToReissue' }
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
        assign: [
          'reissuanceNode.certificateReissuance',
          {
            init: [
              'object',
              'textKeySuffix', '_EXTEND',
              'certificateToReissue', { var: 'certificatesToReissue.0' },
              'accompanyingCertificates', {
                init: [
                  'array'
                ]
              },
              'certificates', {
                map: [
                  { var: 'certificatesToReissue' },
                  {
                    init: [
                      'object',
                      'certificateToReissue', { var: 'it' },
                      'accompanyingCertificates', [],
                      'action', 'extend'
                    ]
                  },
                  'it'
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
