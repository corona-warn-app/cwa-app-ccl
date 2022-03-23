import * as constants from './../ccl-constants.js'

const descriptor = {
  name: '__analyzeDccWallet',
  definition: {
    parameters: [
      {
        name: 'os'
      },
      {
        name: 'language'
      },
      {
        name: 'now'
      },
      {
        name: 'certificates'
      }
    ],
    logic: [
      {
        declare: [
          'allRCs',
          {
            call: [
              '__filterCertificatesByType',
              {
                certificates: { var: 'certificates' },
                type: 'rc'
              }
            ]
          }
        ]
      },
      {
        declare: [
          'allRelevantRCsAnnotatedWithoutContext',
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
                          {
                            '!!': [
                              { var: 'it.hcert.r.0' }
                            ]
                          },
                          {
                            in: [
                              { var: 'it.validityState' },
                              [
                                'VALID',
                                'EXPIRING_SOON'
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
                              'it.__isRC',
                              true
                            ]
                          },
                          {
                            assign: [
                              'it.__dateOfEvent',
                              { var: 'it.hcert.r.0.fr' }
                            ]
                          },
                          {
                            assign: [
                              'it.__ageInDays',
                              {
                                diffTime: [
                                  { var: 'now.localDate' },
                                  { var: 'it.hcert.r.0.fr' },
                                  'day'
                                ]
                              }
                            ]
                          },
                          {
                            assign: [
                              'it.__isAlreadyValid',
                              {
                                '>=': [
                                  { var: 'it.__ageInDays' },
                                  29
                                ]
                              }
                            ]
                          },
                          {
                            assign: [
                              'it.__isStillValid',
                              {
                                '<=': [
                                  { var: 'it.__ageInDays' },
                                  90
                                ]
                              }
                            ]
                          },
                          // the date of the first test is >= 29 days and <= 90 days
                          {
                            assign: [
                              'it.__isValid',
                              {
                                and: [
                                  { var: 'it.__isAlreadyValid' },
                                  { var: 'it.__isStillValid' }
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
          'allRelevantVCsAnnotatedWithoutContext',
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
                          {
                            '!!': [
                              { var: 'it.hcert.v.0' }
                            ]
                          },
                          {
                            in: [
                              { var: 'it.hcert.v.0.mp' },
                              [
                                'EU/1/20/1528', // Biontech
                                'EU/1/20/1507', // Moderna
                                'EU/1/21/1529', // Astra
                                'EU/1/20/1525', // Janssen
                                'EU/1/21/1618' // Novavax
                              ]
                            ]
                          },
                          {
                            in: [
                              { var: 'it.validityState' },
                              [
                                'VALID',
                                'EXPIRING_SOON'
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
                              true
                            ]
                          },
                          {
                            assign: [
                              'it.__dateOfEvent',
                              { var: 'it.hcert.v.0.dt' }
                            ]
                          },
                          {
                            assign: [
                              'it.__ageInDays',
                              {
                                diffTime: [
                                  { var: 'now.localDate' },
                                  { var: 'it.hcert.v.0.dt' },
                                  'day'
                                ]
                              }
                            ]
                          },
                          {
                            assign: [
                              'it.__isOlderThan14Days',
                              {
                                '>': [
                                  { var: 'it.__ageInDays' },
                                  14
                                ]
                              }
                            ]
                          },
                          {
                            assign: [
                              'it.__isYoungerThan91Days',
                              {
                                '<=': [
                                  { var: 'it.__ageInDays' },
                                  90
                                ]
                              }
                            ]
                          },
                          {
                            assign: [
                              'it.__isSeriesComplete',
                              {
                                '>=': [
                                  { var: 'it.hcert.v.0.dn' },
                                  { var: 'it.hcert.v.0.sd' }
                                ]
                              }
                            ]
                          },
                          {
                            assign: [
                              'it.__is1Of1',
                              {
                                and: [
                                  {
                                    '===': [
                                      { var: 'it.hcert.v.0.dn' },
                                      1
                                    ]
                                  },
                                  {
                                    '===': [
                                      { var: 'it.hcert.v.0.sd' },
                                      1
                                    ]
                                  }
                                ]
                              }
                            ]
                          },
                          {
                            assign: [
                              'it.__is2Of2',
                              {
                                and: [
                                  {
                                    '===': [
                                      { var: 'it.hcert.v.0.dn' },
                                      2
                                    ]
                                  },
                                  {
                                    '===': [
                                      { var: 'it.hcert.v.0.sd' },
                                      2
                                    ]
                                  }
                                ]
                              }
                            ]
                          },
                          {
                            assign: [
                              'it.__isDnAboveSd',
                              {
                                '>': [
                                  { var: 'it.hcert.v.0.dn' },
                                  { var: 'it.hcert.v.0.sd' }
                                ]
                              }
                            ]
                          },
                          {
                            assign: [
                              'it.__isJanssen1Of1',
                              {
                                and: [
                                  { var: 'it.__is1Of1' },
                                  {
                                    '===': [
                                      { var: 'it.hcert.v.0.mp' },
                                      'EU/1/20/1525'
                                    ]
                                  }
                                ]
                              }
                            ]
                          },
                          {
                            assign: [
                              'it.__isNotJanssen1Of1',
                              {
                                '!': [
                                  { var: 'it.__isJanssen1Of1' }
                                ]
                              }
                            ]
                          },
                          {
                            assign: [
                              'it.__isBoosterWithoutContext',
                              {
                                and: [
                                  { var: 'it.__isSeriesComplete' },
                                  {
                                    '>': [
                                      { var: 'it.hcert.v.0.dn' },
                                      2
                                    ]
                                  }
                                ]
                              }
                            ]
                          },
                          {
                            assign: [
                              'it.__isRecoveryVaccinationWithoutContext',
                              {
                                and: [
                                  { var: 'it.__is1Of1' },
                                  {
                                    in: [
                                      { var: 'it.hcert.v.0.mp' },
                                      [
                                        'EU/1/20/1528', // Biontech
                                        'EU/1/20/1507', // Moderna
                                        'EU/1/21/1529', // Astra Zeneca
                                        'EU/1/21/1618' // Novavax
                                      ]
                                    ]
                                  }
                                ]
                              }
                            ]
                          },
                          {
                            assign: [
                              'it.__isTemporarilyEqualToBoosterWithoutContext',
                              {
                                or: [
                                  {
                                    and: [
                                      { var: 'it.__isSeriesComplete' },
                                      {
                                        '===': [
                                          { var: 'it.hcert.v.0.dn' },
                                          2
                                        ]
                                      },
                                      { var: 'it.__isOlderThan14Days' },
                                      { var: 'it.__isYoungerThan91Days' }
                                    ]
                                  },
                                  {
                                    and: [
                                      { var: 'it.__isRecoveryVaccinationWithoutContext' },
                                      { var: 'it.__isYoungerThan91Days' }
                                    ]
                                  }
                                ]
                              }
                            ]
                          },
                          {
                            assign: [
                              'it.__isFullImmunizationWithoutContext',
                              {
                                and: [
                                  { var: 'it.__isSeriesComplete' },
                                  {
                                    or: [
                                      { var: 'it.__isOlderThan14Days' },
                                      { var: 'it.__isTemporarilyEqualToBoosterWithoutContext' },
                                      { var: 'it.__isRecoveryVaccinationWithoutContext' }
                                    ]
                                  },
                                  { var: 'it.__isNotJanssen1Of1' }
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
          'allRelevantVCsAndRCsAnnotatedWithContext',
          {
            script: [
              {
                declare: [
                  'merged',
                  {
                    merge: [
                      { var: 'allRelevantRCsAnnotatedWithoutContext' },
                      { var: 'allRelevantVCsAnnotatedWithoutContext' }
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
                        certificates: { var: 'merged' },
                        ascending: true
                      }
                    ]
                  }
                ]
              },
              {
                declare: [
                  'annotated',
                  {
                    map: [
                      { var: 'sorted' },
                      {
                        script: [
                          {
                            assign: [
                              'it.__hasPreviousRC',
                              {
                                some: [
                                  { var: 'sorted' },
                                  {
                                    and: [
                                      { var: 'inner.__isRC' },
                                      {
                                        before: [
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
                          {
                            assign: [
                              'it.__isRecoveryVaccination',
                              {
                                or: [
                                  { var: 'it.__isRecoveryVaccinationWithoutContext' },
                                  {
                                    and: [
                                      { var: 'it.__isJanssen1Of1' },
                                      { var: 'it.__hasPreviousRC' }
                                    ]
                                  }
                                ]
                              }
                            ]
                          },
                          {
                            assign: [
                              'it.__hasSomePreviousVaccination',
                              {
                                some: [
                                  { var: 'sorted' },
                                  {
                                    and: [
                                      { var: 'inner.__isVC' },
                                      {
                                        before: [
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
                          {
                            assign: [
                              'it.__hasPreviousRecoveryVaccination',
                              {
                                some: [
                                  { var: 'sorted' },
                                  {
                                    and: [
                                      {
                                        or: [
                                          { var: 'inner.__isRecoveryVaccination' },
                                          { var: 'inner.__isRecoveryVaccinationWithoutContext' } // TODO: fixme, this should be redundant
                                        ]
                                      },
                                      {
                                        before: [
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
                          {
                            assign: [
                              'it.__isTemporarilyEqualToBooster',
                              {
                                or: [
                                  { var: 'it.__isTemporarilyEqualToBoosterWithoutContext' },
                                  {
                                    and: [
                                      {
                                        or: [
                                          { var: 'it.__isRecoveryVaccination' },
                                          { var: 'it.__isRecoveryVaccinationWithoutContext' } // TODO: fixme, this should be redundant
                                        ]
                                      },
                                      { var: 'it.__isYoungerThan91Days' }
                                    ]
                                  }
                                ]
                              }
                            ]
                          },
                          {
                            assign: [
                              'it.__isBooster',
                              {
                                or: [
                                  { var: 'it.__isBoosterWithoutContext' },
                                  {
                                    and: [
                                      { var: 'it.__isVC' },
                                      {
                                        or: [
                                          { var: 'it.__hasPreviousRecoveryVaccination' },
                                          // new 2/1 notation
                                          {
                                            and: [
                                              { var: 'it.__isDnAboveSd' },
                                              {
                                                '!': [
                                                  { var: 'it.__hasSomePreviousVaccination' }
                                                ]
                                              }
                                            ]
                                          },
                                          {
                                            and: [
                                              {
                                                or: [
                                                  // new 2/1 notation
                                                  { var: 'it.__isDnAboveSd' },
                                                  // old 2/2 notation
                                                  { var: 'it.__is2Of2' }
                                                ]
                                              },
                                              { var: 'it.__hasPreviousRC' }
                                            ]
                                          }
                                        ]
                                      }
                                    ]
                                  },
                                  {
                                    and: [
                                      { var: 'it.__isRC' },
                                      {
                                        or: [
                                          {
                                            and: [
                                              { var: 'it.__isAlreadyValid' },
                                              {
                                                some: [
                                                  { var: 'sorted' },
                                                  {
                                                    and: [
                                                      { var: 'inner.__isVC' },
                                                      {
                                                        or: [
                                                          { var: 'inner.__isFullImmunization' },
                                                          { var: 'inner.__isFullImmunizationWithoutContext' } // TODO: fixme, this should be redundant
                                                        ]
                                                      },
                                                      {
                                                        before: [
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
                                          { var: 'it.__isValid' }
                                        ]
                                      }
                                    ]
                                  }
                                ]
                              }
                            ]
                          },
                          {
                            assign: [
                              'it.__hasPreviousPartialVaccination',
                              {
                                some: [
                                  { var: 'sorted' },
                                  {
                                    and: [
                                      { var: 'inner.__isVC' },
                                      {
                                        or: [
                                          {
                                            and: [
                                              // 1/2
                                              {
                                                '===': [
                                                  { var: 'inner.hcert.v.0.dn' },
                                                  1
                                                ]
                                              },
                                              {
                                                '===': [
                                                  { var: 'inner.hcert.v.0.sd' },
                                                  2
                                                ]
                                              }
                                            ]
                                          },
                                          { var: 'inner.__isJanssen1Of1' }
                                        ]
                                      },
                                      // administered before outer
                                      {
                                        before: [
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
                          {
                            assign: [
                              'it.__isFullImmunization',
                              {
                                if: [
                                  { var: 'it.__isVC' },
                                  {
                                    and: [
                                      { var: 'it.__isSeriesComplete' },
                                      {
                                        or: [
                                          { var: 'it.__isFullImmunizationWithoutContext' },
                                          { var: 'it.__isOlderThan14Days' },
                                          { var: 'it.__isBooster' },
                                          { var: 'it.__isRecoveryVaccination' },
                                          { var: 'it.__hasPreviousRC' },
                                          { var: 'it.__hasPreviousRecoveryVaccination' }
                                        ]
                                      },
                                      {
                                        or: [
                                          { var: 'it.__isNotJanssen1Of1' },
                                          { var: 'it.__hasPreviousRC' }
                                        ]
                                      }
                                    ]
                                  },
                                  // else if
                                  { var: 'it.__isRC' },
                                  {
                                    or: [
                                      { var: 'it.__isValid' },
                                      {
                                        and: [
                                          { var: 'it.__isAlreadyValid' },
                                          {
                                            or: [
                                              { var: 'it.__hasPreviousRecoveryVaccination' },
                                              { var: 'it.__hasPreviousPartialVaccination' }
                                            ]
                                          }
                                        ]
                                      }
                                    ]
                                  },
                                  // else
                                  false
                                ]
                              }
                            ]
                          },
                          {
                            assign: [
                              'it.__offsetInDays',
                              {
                                if: [
                                  {
                                    or: [
                                      { var: 'it.__isBooster' },
                                      { var: 'it.__isRecoveryVaccination' },
                                      { var: 'it.__hasPreviousRC' },
                                      { var: 'it.__hasPreviousRecoveryVaccination' }
                                    ]
                                  },
                                  0,
                                  15
                                ]
                              }
                            ]
                          },
                          {
                            if: [
                              {
                                and: [
                                  { var: 'it.__isVC' },
                                  { var: 'it.__isSeriesComplete' },
                                  {
                                    or: [
                                      { var: 'it.__isNotJanssen1Of1' },
                                      { var: 'it.__hasPreviousRC' }
                                    ]
                                  }
                                ]
                              },
                              {
                                assign: [
                                  'it.__fullImmunizationDate',
                                  {
                                    plusTime: [
                                      { var: 'it.hcert.v.0.dt' },
                                      { var: 'it.__offsetInDays' },
                                      'day'
                                    ]
                                  }
                                ]
                              }
                            ]
                          },
                          {
                            assign: [
                              'it.__isElegibleForReissuance',
                              {
                                and: [
                                  { var: 'it.__isVC' },
                                  // issued by Germany
                                  {
                                    '===': [
                                      { var: 'it.cwt.iss' },
                                      'DE'
                                    ]
                                  },
                                  // 2 of 2
                                  {
                                    and: [
                                      {
                                        '===': [
                                          { var: 'it.hcert.v.0.dn' },
                                          { var: 'it.hcert.v.0.sd' }
                                        ]
                                      },
                                      {
                                        '===': [
                                          { var: 'it.hcert.v.0.dn' },
                                          2
                                        ]
                                      }
                                    ]
                                  },
                                  {
                                    or: [
                                      { var: 'it.__hasPreviousRecoveryVaccination' },
                                      {
                                        some: [
                                          { var: 'sorted' },
                                          {
                                            and: [
                                              {
                                                or: [
                                                  { var: 'inner.__isJanssen1Of1' }
                                                ]
                                              },
                                              {
                                                before: [
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
                                  }
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
                  'resorted',
                  {
                    call: [
                      '__sortCertificatesByDate',
                      {
                        certificates: { var: 'annotated' },
                        ascending: false
                      }
                    ]
                  }
                ]
              },
              {
                return: [
                  { var: 'resorted' }
                ]
              }
            ]
          }
        ]
      }, // end of allRelevantVCsAndRCsAnnotatedWithContext

      {
        declare: [
          'allRelevantRCsAnnotated',
          {
            filter: [
              { var: 'allRelevantVCsAndRCsAnnotatedWithContext' },
              { var: 'it.__isRC' },
              'it'
            ]
          }
        ]
      },
      {
        declare: [
          'allRelevantVCsAnnotated',
          {
            filter: [
              { var: 'allRelevantVCsAndRCsAnnotatedWithContext' },
              { var: 'it.__isVC' },
              'it'
            ]
          }
        ]
      },
      {
        declare: [
          'allBoosterVCs',
          {
            filter: [
              { var: 'allRelevantVCsAndRCsAnnotatedWithContext' },
              {
                and: [
                  { var: 'it.__isVC' },
                  { var: 'it.__isBooster' }
                ]
              },
              'it'
            ]
          }
        ]
      },
      {
        declare: [
          'allTemporarilyEqualToBoosterVCs',
          {
            filter: [
              { var: 'allRelevantVCsAndRCsAnnotatedWithContext' },
              { var: 'it.__isTemporarilyEqualToBooster' },
              'it'
            ]
          }
        ]
      },
      {
        declare: [
          'allBoosterRCs',
          {
            filter: [
              { var: 'allRelevantVCsAndRCsAnnotatedWithContext' },
              {
                and: [
                  { var: 'it.__isRC' },
                  { var: 'it.__isBooster' }
                ]
              },
              'it'
            ]
          }
        ]
      },
      {
        declare: [
          'allTCs',
          {
            call: [
              '__filterCertificatesByType',
              {
                certificates: { var: 'certificates' },
                type: 'tc'
              }
            ]
          }
        ]
      },
      {
        declare: [
          'allTCsWithValidPCR',
          {
            script: [
              {
                declare: [
                  'filtered',
                  {
                    filter: [
                      { var: 'allTCs' },
                      {
                        and: [
                          {
                            '===': [
                              { var: 'it.hcert.t.0.tt' },
                              'LP6464-4' // PCR
                            ]
                          },
                          {
                            '===': [
                              { var: 'it.hcert.t.0.tr' },
                              '260415000' // negative
                            ]
                          },
                          {
                            'not-after': [
                              { var: 'now.utcDateTime' },
                              {
                                plusTime: [
                                  { var: 'it.hcert.t.0.sc' },
                                  constants.TC_PCR_VALIDITY_IN_HOURS,
                                  'hour'
                                ]
                              }
                            ]
                          },
                          {
                            in: [
                              { var: 'it.validityState' },
                              [
                                'VALID',
                                'EXPIRING_SOON'
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
                  'sorted',
                  {
                    call: [
                      '__sortTestCertificatesByDate',
                      {
                        certificates: { var: 'filtered' },
                        ascending: false
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
          'allTCsWithValidRAT',
          {
            script: [
              {
                declare: [
                  'filtered',
                  {
                    filter: [
                      { var: 'allTCs' },
                      {
                        and: [
                          {
                            '===': [
                              { var: 'it.hcert.t.0.tt' },
                              'LP217198-3' // RAT
                            ]
                          },
                          {
                            '===': [
                              { var: 'it.hcert.t.0.tr' },
                              '260415000' // negative
                            ]
                          },
                          {
                            'not-after': [
                              { var: 'now.utcDateTime' },
                              {
                                plusTime: [
                                  { var: 'it.hcert.t.0.sc' },
                                  constants.TC_RAT_VALIDITY_IN_HOURS,
                                  'hour'
                                ]
                              }
                            ]
                          },
                          {
                            in: [
                              { var: 'it.validityState' },
                              [
                                'VALID',
                                'EXPIRING_SOON'
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
                  'sorted',
                  {
                    call: [
                      '__sortTestCertificatesByDate',
                      {
                        certificates: { var: 'filtered' },
                        ascending: false
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
          'allVCsAndRCsWithFullImmunization',
          {
            script: [
              {
                declare: [
                  'filtered',
                  {
                    filter: [
                      { var: 'allRelevantVCsAndRCsAnnotatedWithContext' },
                      { var: 'it.__isFullImmunization' },
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
                        certificates: { var: 'filtered' },
                        ascending: false
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
          'hasBooster',
          {
            '!!': [
              { var: 'allBoosterVCs' }
            ]
          }
        ]
      },
      {
        declare: [
          'hasBoosterEquivalent',
          {
            or: [
              {
                '!!': [
                  { var: 'allTemporarilyEqualToBoosterVCs' }
                ]
              },
              {
                '!!': [
                  { var: 'allBoosterRCs' }
                ]
              }
            ]
          }
        ]
      },
      {
        declare: [
          'hasBoosterOrEquivalent',
          {
            or: [
              { var: 'hasBooster' },
              { var: 'hasBoosterEquivalent' }
            ]
          }
        ]
      },
      // admission state
      {
        declare: [
          'has2G',
          {
            '!!': [
              { var: 'allVCsAndRCsWithFullImmunization' }
            ]
          }
        ]
      },
      {
        declare: [
          'hasPCR',
          {
            '!!': [
              { var: 'allTCsWithValidPCR' }
            ]
          }
        ]
      },
      {
        declare: [
          'hasRAT',
          {
            '!!': [
              { var: 'allTCsWithValidRAT' }
            ]
          }
        ]
      },
      {
        declare: [
          'admissionState',
          {
            if: [
              // has2G && && hasBooster && hasPCR
              {
                and: [
                  { var: 'has2G' },
                  { var: 'hasBoosterOrEquivalent' },
                  { var: 'hasPCR' }
                ]
              },
              '2G_PLUS_PCR',
              // has2G && && hasBooster && hasRAT
              {
                and: [
                  { var: 'has2G' },
                  { var: 'hasBoosterOrEquivalent' },
                  { var: 'hasRAT' }
                ]
              },
              '2G_PLUS_RAT',
              // has2G && hasBooster
              {
                and: [
                  { var: 'has2G' },
                  { var: 'hasBoosterOrEquivalent' }
                ]
              },
              '2G_PLUS',
              // has2G && hasPCR
              {
                and: [
                  { var: 'has2G' },
                  { var: 'hasPCR' }
                ]
              },
              '2G_PLUS_PCR',
              // has2G && !hasPCR && hasRAT
              {
                and: [
                  { var: 'has2G' },
                  {
                    '!': [
                      { var: 'hasPCR' }
                    ]
                  },
                  { var: 'hasRAT' }
                ]
              },
              '2G_PLUS_RAT',
              // has2G && !hasPCR && !hasRAT
              {
                and: [
                  { var: 'has2G' },
                  {
                    '!': [
                      { var: 'hasPCR' }
                    ]
                  },
                  {
                    '!': [
                      { var: 'hasRAT' }
                    ]
                  }
                ]
              },
              '2G',
              // !has2G && hasPCR
              {
                and: [
                  {
                    '!': [
                      { var: 'has2G' }
                    ]
                  },
                  { var: 'hasPCR' }
                ]
              },
              '3G_WITH_PCR',
              // !has2G && !hasPCR && hasRAT
              {
                and: [
                  {
                    '!': [
                      { var: 'has2G' }
                    ]
                  },
                  {
                    '!': [
                      { var: 'hasPCR' }
                    ]
                  },
                  { var: 'hasRAT' }
                ]
              },
              '3G_WITH_RAT',
              // else
              'OTHER'
            ]
          }
        ]
      },

      // most relevant certificate
      {
        declare: [
          'mostRelevantCertificate',
          {
            if: [
              {
                '!!': [
                  { var: 'allVCsAndRCsWithFullImmunization' }
                ]
              },
              { var: 'allVCsAndRCsWithFullImmunization.0' },
              // else if PCR
              {
                '!!': [
                  { var: 'allTCsWithValidPCR' }
                ]
              },
              { var: 'allTCsWithValidPCR.0' },
              // else if RAT
              {
                '!!': [
                  { var: 'allTCsWithValidRAT' }
                ]
              },
              { var: 'allTCsWithValidRAT.0' },
              // else if, latest VC
              {
                '!!': [
                  { var: 'allRelevantVCsAnnotated' }
                ]
              },
              {
                script: [
                  // sort all certs by latest
                  {
                    declare: [
                      'sorted',
                      {
                        call: [
                          '__sortCertificatesByDate',
                          {
                            certificates: { var: 'allRelevantVCsAnnotated' },
                            ascending: false
                          }
                        ]
                      }
                    ]
                  },
                  {
                    return: [
                      { var: 'sorted.0' }
                    ]
                  }
                ]
              },
              // else if, latest RC
              {
                '!!': [
                  { var: 'allRCs' }
                ]
              },
              {
                script: [
                  // sort all certs by latest
                  {
                    declare: [
                      'sorted',
                      {
                        call: [
                          '__sortCertificatesByDate',
                          {
                            certificates: { var: 'allRCs' },
                            ascending: false
                          }
                        ]
                      }
                    ]
                  },
                  {
                    return: [
                      { var: 'sorted.0' }
                    ]
                  }
                ]
              },
              // else, latest DCC
              {
                script: [
                  // sort all certs by latest
                  {
                    declare: [
                      'sorted',
                      {
                        call: [
                          '__sortCertificatesByDate',
                          {
                            certificates: { var: 'certificates' },
                            ascending: false
                          }
                        ]
                      }
                    ]
                  },
                  {
                    return: [
                      { var: 'sorted.0' }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      // most recent vaccination certificate
      {
        declare: [
          'mostRecentVaccinationCertificate',
          {
            script: [
              {
                declare: [
                  'sorted',
                  {
                    call: [
                      '__sortVaccinationCertificatesByDate',
                      {
                        certificates: { var: 'allRelevantVCsAnnotated' },
                        ascending: false
                      }
                    ]
                  }
                ]
              },
              {
                return: [
                  { var: 'sorted.0' }
                ]
              }
            ]
          }
        ]
      },
      // earliest complete vaccination certificate
      {
        declare: [
          'earliestCompleteVC',
          {
            script: [
              {
                declare: [
                  'filtered',
                  {
                    filter: [
                      { var: 'allRelevantVCsAnnotated' },
                      {
                        '!!': [
                          { var: 'it.__fullImmunizationDate' }
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
                      '__sortVaccinationCertificatesByDate',
                      {
                        certificates: { var: 'filtered' },
                        ascending: true
                      }
                    ]
                  }
                ]
              },
              {
                return: [
                  { var: 'sorted.0' }
                ]
              }
            ]
          }
        ]
      },
      // verification
      {
        declare: [
          'verificationCertificates',
          {
            init: [
              'array',
              { var: 'mostRelevantCertificate' }
            ]
          }
        ]
      },
      {
        if: [
          {
            and: [
              {
                in: [
                  { var: 'admissionState' },
                  [
                    '1G_PLUS_PCR',
                    '2G_PLUS_PCR'
                  ]
                ]
              },
              {
                '!==': [
                  { var: 'mostRelevantCertificate.barcodeData' },
                  { var: 'allTCsWithValidPCR.0.barcodeData' }
                ]
              }
            ]
          },
          {
            assign: [
              'verificationCertificates',
              {
                push: [
                  { var: 'verificationCertificates' },
                  { var: 'allTCsWithValidPCR.0' }
                ]
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
                in: [
                  { var: 'admissionState' },
                  [
                    '1G_PLUS_RAT',
                    '2G_PLUS_RAT'
                  ]
                ]
              },
              {
                '!==': [
                  { var: 'mostRelevantCertificate.barcodeData' },
                  { var: 'allTCsWithValidRAT.0.barcodeData' }
                ]
              }
            ]
          },
          {
            assign: [
              'verificationCertificates',
              {
                push: [
                  { var: 'verificationCertificates' },
                  { var: 'allTCsWithValidRAT.0' }
                ]
              }
            ]
          }
        ]
      },
      // vaccination state
      {
        declare: [
          'vaccinationState',
          {
            script: [
              {
                declare: [
                  'first',
                  { var: 'allRelevantVCsAndRCsAnnotatedWithContext.0' }
                ]
              },
              {
                if: [
                  {
                    and: [
                      { var: 'first.__isVC' },
                      { var: 'first.__isBooster' }
                    ]
                  },
                  {
                    return: [
                      'COMPLETE_BOOSTER'
                    ]
                  },
                  // else if
                  {
                    and: [
                      { var: 'first.__isRC' },
                      { var: 'first.__isBooster' },
                      { var: 'first.__hasSomePreviousVaccination' },
                      {
                        '!': [
                          { var: 'first.__hasPreviousPartialVaccination' }
                        ]
                      }
                    ]
                  },
                  {
                    return: [
                      'COMPLETE_BOOSTER_RC'
                    ]
                  },
                  // else if
                  {
                    and: [
                      { var: 'first.__isRC' },
                      { var: 'first.__hasSomePreviousVaccination' },
                      {
                        '!': [
                          { var: 'first.__hasPreviousPartialVaccination' }
                        ]
                      }
                    ]
                  },
                  {
                    return: [
                      'COMPLETE_BOOSTER_RC_PENDING'
                    ]
                  }
                ]
              },
              {
                declare: [
                  'immunizationMatch',
                  {
                    find: [
                      { var: 'allRelevantVCsAndRCsAnnotatedWithContext' },
                      {
                        and: [
                          {
                            or: [
                              { var: 'it.__isVC' },
                              // prevent that a single RC can lead to COMPLETE_IMMUNIZATION
                              { var: 'it.__hasSomePreviousVaccination' }
                            ]
                          },
                          { var: 'it.__isFullImmunization' }
                        ]
                      },
                      'it'
                    ]
                  }
                ]
              },
              {
                if: [
                  { var: 'immunizationMatch.__isVC' },
                  {
                    return: [
                      'COMPLETE_IMMUNIZATION'
                    ]
                  },
                  { var: 'immunizationMatch.__isRC' },
                  {
                    return: [
                      'COMPLETE_IMMUNIZATION_RC'
                    ]
                  }
                ]
              },
              {
                declare: [
                  'pendingImmunizationMatch',
                  {
                    find: [
                      { var: 'allRelevantVCsAndRCsAnnotatedWithContext' },
                      {
                        or: [
                          {
                            and: [
                              { var: 'it.__isRC' },
                              { var: 'it.__hasSomePreviousVaccination' },
                              {
                                '!': [
                                  { var: 'it.__isAlreadyValid' }
                                ]
                              }
                            ]
                          },
                          {
                            and: [
                              { var: 'it.__isVC' },
                              {
                                after: [
                                  { var: 'it.__fullImmunizationDate' },
                                  { var: 'now.localDateTime' }
                                ]
                              },
                              { var: 'it.__isNotJanssen1Of1' }
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
                  { var: 'pendingImmunizationMatch.__isVC' },
                  {
                    return: [
                      'COMPLETE_IMMUNIZATION_PENDING'
                    ]
                  },
                  { var: 'pendingImmunizationMatch.__isRC' },
                  {
                    return: [
                      'COMPLETE_IMMUNIZATION_RC_PENDING'
                    ]
                  }
                ]
              },
              {
                return: [
                  'PARTIAL_IMMUNIZATION'
                ]
              }
            ]
          }
        ]
      },
      {
        return: [
          {
            init: [
              'object',
              // '__allRelevantVCsAnnotated', { var: 'allRelevantVCsAnnotated' },
              '__allRelevantVCsAndRCsAnnotatedWithContext', { var: 'allRelevantVCsAndRCsAnnotatedWithContext' },
              // '__allVCsAndRCsWithFullImmunization', { var: 'allVCsAndRCsWithFullImmunization' },
              // '__allBoosterVCs', { var: 'allBoosterVCs' },
              '__allTCsWithValidRAT', { var: 'allTCsWithValidRAT' },
              '__allTCsWithValidPCR', { var: 'allTCsWithValidPCR' },
              // '__has2G', { var: 'has2G' },
              // '__hasPCR', { var: 'hasPCR' },
              // '__hasRAT', { var: 'hasRAT' },
              // '__earliestCompleteVC', { var: 'earliestCompleteVC' },
              'allRelevantVCsAnnotated', { var: 'allRelevantVCsAnnotated' },
              'allRelevantRCsAnnotated', { var: 'allRelevantRCsAnnotated' },
              'mostRecentVaccinationCertificate', { var: 'mostRecentVaccinationCertificate' },
              'verificationCertificates', { var: 'verificationCertificates' },
              'hasBooster', { var: 'hasBooster' },
              'hasBoosterEquivalent', { var: 'hasBoosterEquivalent' },
              'admissionState', { var: 'admissionState' },
              'vaccinationState', { var: 'vaccinationState' },
              'vaccinationValidFrom', { var: 'earliestCompleteVC.__fullImmunizationDate' },
              'mostRelevantCertificate', { var: 'mostRelevantCertificate' },
              'mostRecentVaccination', { var: 'mostRecentVaccinationCertificate' }
            ]
          }
        ]
      }
    ]
  }
}

export default {
  getDescriptor: () => descriptor,
  toJSON: () => JSON.stringify(descriptor)
}
