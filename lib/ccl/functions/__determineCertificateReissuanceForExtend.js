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
          'annotatedCertificates',
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
                return: [
                  { var: 'annotated' }
                ]
              }
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
                  'filteredWithAnnotations',
                  {
                    filter: [
                      { var: 'annotated' },
                      // no other DCC on the same date and with a larger iat
                      {
                        '!': [
                          {
                            some: [
                              { var: 'annotated' },
                              {
                                and: [
                                  // not the same DCC
                                  {
                                    '!==': [
                                      { var: 'inner.barcodeData' },
                                      { var: 'it.barcodeData' }
                                    ]
                                  },
                                  // on the same day
                                  {
                                    '===': [
                                      { var: 'inner.__dateOfEvent' },
                                      { var: 'it.__dateOfEvent' }
                                    ]
                                  },
                                  // with a larger iat claim
                                  {
                                    '>': [
                                      { var: 'inner.cwt.iat' },
                                      { var: 'it.cwt.iat' }
                                    ]
                                  }
                                ]
                              },
                              'inner'
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
                        certificates: { var: 'filteredWithAnnotations' },
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
                  {
                    if: [
                      { var: 'it.__isVC' },
                      // then no other VC after it (i.e. latest/youngest)
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
              'identifier', 'extend',
              'textKeySuffix', 'EXTEND',
              'certificates', {
                map: [
                  { var: 'certificatesToReissue' },
                  {
                    init: [
                      'object',
                      'certificateToReissue', { var: 'it' },
                      'accompanyingCertificates', {
                        filter: [
                          { var: 'annotatedCertificates' },
                          {
                            and: [
                              {
                                before: [
                                  { var: 'inner.__dateOfEvent' },
                                  { var: 'it.__dateOfEvent' }
                                ]
                              },
                              // no other DCC on the same date with larger iat
                              {
                                '!': [
                                  {
                                    some: [
                                      { var: 'annotatedCertificates' },
                                      {
                                        and: [
                                          // not the same DCC
                                          {
                                            '!==': [
                                              { var: 'inner2.barcodeData' },
                                              { var: 'inner.barcodeData' }
                                            ]
                                          },
                                          // on the same day
                                          {
                                            '===': [
                                              { var: 'inner2.__dateOfEvent' },
                                              { var: 'inner.__dateOfEvent' }
                                            ]
                                          },
                                          // with a larger iat claim
                                          {
                                            '>': [
                                              { var: 'inner2.cwt.iat' },
                                              { var: 'inner.cwt.iat' }
                                            ]
                                          }
                                        ]
                                      },
                                      'inner2'
                                    ]
                                  }
                                ]
                              }
                            ]
                          },
                          'inner'
                        ]
                      },
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
