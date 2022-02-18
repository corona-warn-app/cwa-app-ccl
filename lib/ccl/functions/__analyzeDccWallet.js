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
          'allRelevantRCsAnnotated',
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
                              'it.__ageInDays',
                              {
                                diffTime: [
                                  { var: 'now.localDateTime' },
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
          'allRelevantVCsAnnotated',
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
                              'it.__isJanssen1of1',
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
                                  },
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
                              'it.__isBoosterSelfContained',
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
                              'it.__isTemporarilyEqualToBoosterSelfContained',
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
                              }
                            ]
                          },
                          {
                            assign: [
                              'it.__isRecoveryVaccinationSelfContained',
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
                                  },
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
                              'it.__isFullImmunizationSelfContained',
                              {
                                and: [
                                  { var: 'it.__isSeriesComplete' },
                                  {
                                    or: [
                                      { var: 'it.__isOlderThan14Days' },
                                      { var: 'it.__isBoosterSelfContained' },
                                      { var: 'it.__isRecoveryVaccinationSelfContained' }
                                      // // 2/2 with Janssen
                                      // {
                                      //   and: [
                                      //     {
                                      //       '>': [
                                      //         { var: 'it.hcert.v.0.dn' },
                                      //         1
                                      //       ]
                                      //     },
                                      //     {
                                      //       '===': [
                                      //         { var: 'it.hcert.v.0.mp' },
                                      //         'EU/1/20/1525'
                                      //       ]
                                      //     }
                                      //   ]
                                      // }
                                      // // assumed recovery vaccination, even for Janssen 1/1
                                      // {
                                      //   and: [
                                      //     {
                                      //       '===': [
                                      //         { var: 'it.hcert.v.0.dn' },
                                      //         1
                                      //       ]
                                      //     },
                                      //     {
                                      //       '===': [
                                      //         { var: 'it.hcert.v.0.sd' },
                                      //         1
                                      //       ]
                                      //     }
                                      //   ]
                                      // }
                                    ]
                                  },
                                  {
                                    '!': [
                                      { var: 'it.__isJanssen1of1' }
                                    ]
                                  }
                                ]
                              }
                            ]
                          },
                          {
                            assign: [
                              'it.__hasPreviousRC',
                              {
                                some: [
                                  { var: 'allRCs' },
                                  {
                                    before: [
                                      { var: 'inner.hcert.r.0.fr' },
                                      { var: 'it.hcert.v.0.dt' }
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
                                  { var: 'filtered' },
                                  {
                                    and: [
                                      // series complete
                                      {
                                        '===': [
                                          { var: 'inner.hcert.v.0.dn' },
                                          { var: 'inner.hcert.v.0.sd' }
                                        ]
                                      },
                                      {
                                        '===': [
                                          { var: 'inner.hcert.v.0.dn' },
                                          1
                                        ]
                                      },
                                      {
                                        or: [
                                          // not Janssen 1/1
                                          {
                                            '!': [
                                              // { var: 'inner.__isJanssen1of1' },
                                              {
                                                and: [
                                                  {
                                                    '===': [
                                                      { var: 'inner.hcert.v.0.dn' },
                                                      1
                                                    ]
                                                  },
                                                  {
                                                    '===': [
                                                      { var: 'inner.hcert.v.0.sd' },
                                                      1
                                                    ]
                                                  },
                                                  {
                                                    '===': [
                                                      { var: 'inner.hcert.v.0.mp' },
                                                      'EU/1/20/1525'
                                                    ]
                                                  }
                                                ]
                                              }
                                            ]
                                          },
                                          // { var: 'inner.__hasPreviousRC' }
                                          {
                                            some: [
                                              { var: 'allRCs' },
                                              {
                                                before: [
                                                  { var: 'inner2.hcert.r.0.fr' },
                                                  { var: 'inner.hcert.v.0.dt' }
                                                ]
                                              },
                                              'inner2'
                                            ]
                                          }
                                        ]
                                      },
                                      // administered before outer
                                      {
                                        before: [
                                          { var: 'inner.hcert.v.0.dt' },
                                          { var: 'it.hcert.v.0.dt' }
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
                              'it.__isBooster',
                              {
                                or: [
                                  { var: 'it.__isBoosterSelfContained' },
                                  { var: 'it.__hasPreviousRecoveryVaccination' },
                                  {
                                    and: [
                                      {
                                        or: [
                                          // new 2/1 notation
                                          {
                                            '>': [
                                              { var: 'it.hcert.v.0.dn' },
                                              { var: 'it.hcert.v.0.sd' }
                                            ]
                                          },
                                          // ol 2/2 notation
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
                                          }
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
                            assign: [
                              'it.__isFullImmunization',
                              {
                                and: [
                                  { var: 'it.__isSeriesComplete' },
                                  {
                                    or: [
                                      { var: 'it.__isOlderThan14Days' },
                                      { var: 'it.__isBoosterSelfContained' },
                                      { var: 'it.__isRecoveryVaccinationSelfContained' },
                                      { var: 'it.__hasPreviousRC' },
                                      { var: 'it.__hasPreviousRecoveryVaccination' }
                                    ]
                                  },
                                  {
                                    or: [
                                      {
                                        '!': [
                                          { var: 'it.__isJanssen1of1' }
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
                            assign: [
                              'it.__offsetInDays',
                              {
                                if: [
                                  {
                                    or: [
                                      { var: 'it.__isBoosterSelfContained' },
                                      { var: 'it.__isRecoveryVaccinationSelfContained' },
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
                                  { var: 'it.__isSeriesComplete' },
                                  {
                                    or: [
                                      {
                                        '!': [
                                          { var: 'it.__isJanssen1of1' }
                                        ]
                                      },
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
          'allVCs',
          {
            call: [
              '__filterCertificatesByType',
              {
                certificates: { var: 'certificates' },
                type: 'vc'
              }
            ]
          }
        ]
      },
      {
        declare: [
          'allRelevantRCsAnnotated',
          {
            map: [
              { var: 'allRelevantRCsAnnotated' },
              {
                script: [
                  {
                    assign: [
                      'it.__hasPreviousRecoveryVaccination',
                      {
                        some: [
                          { var: 'allRelevantVCsAnnotated' },
                          {
                            and: [
                              // series complete
                              {
                                '===': [
                                  { var: 'inner.hcert.v.0.dn' },
                                  { var: 'inner.hcert.v.0.sd' }
                                ]
                              },
                              {
                                '===': [
                                  { var: 'inner.hcert.v.0.dn' },
                                  1
                                ]
                              },
                              // administered before outer
                              {
                                before: [
                                  { var: 'inner.hcert.v.0.dt' },
                                  { var: 'it.hcert.r.0.fr' }
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
                      'it.__hasPreviousPartialVaccination',
                      {
                        some: [
                          { var: 'allRelevantVCsAnnotated' },
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
                              },
                              // administered before outer
                              {
                                before: [
                                  { var: 'inner.hcert.v.0.dt' },
                                  { var: 'it.hcert.r.0.fr' }
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
          'allValidRCs',
          {
            filter: [
              { var: 'allRelevantRCsAnnotated' },
              { var: 'it.__isValid' },
              'it'
            ]
          }
        ]
      },
      {
        declare: [
          'allVCsWithFullImmunization',
          {
            script: [
              {
                declare: [
                  'filtered',
                  {
                    filter: [
                      { var: 'allRelevantVCsAnnotated' },
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
                      '__sortVaccinationCertificatesByDate',
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
          'allRCsWithFullImmunization',
          {
            script: [
              {
                declare: [
                  'filtered',
                  {
                    filter: [
                      { var: 'allRelevantRCsAnnotated' },
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
                      '__sortRecoveryCertificatesByDate',
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
          'allVCsWithFullImmunizationSelfContained',
          {
            script: [
              {
                declare: [
                  'filtered',
                  {
                    filter: [
                      { var: 'allRelevantVCsAnnotated' },
                      { var: 'it.__isFullImmunizationSelfContained' },
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
          'allBoosterVCs',
          {
            filter: [
              { var: 'allRelevantVCsAnnotated' },
              // { var: 'it.__isBoosterSelfContained' },
              { var: 'it.__isBooster' },
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
              { var: 'allRelevantVCsAnnotated' },
              { var: 'it.__isTemporarilyEqualToBoosterSelfContained' },
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
              { var: 'allRelevantRCsAnnotated' },
              {
                or: [
                  {
                    and: [
                      { var: 'it.__isAlreadyValid' },
                      {
                        some: [
                          { var: 'allVCsWithFullImmunization' },
                          // before outer
                          {
                            before: [
                              { var: 'inner.hcert.v.0.dt' },
                              { var: 'it.hcert.r.0.fr' }
                            ]
                          },
                          'inner'
                        ]
                      }
                    ]
                  },
                  { var: 'it.__isValid' }
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
                                  72,
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
                                  48,
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
                  'merged',
                  {
                    merge: [
                      { var: 'allVCsWithFullImmunization' },
                      { var: 'allRCsWithFullImmunization' },
                      { var: 'allValidRCs' }
                      // { var: 'allBoosterRCs' }
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
          'allVCsAndRCsWithFullImmunizationSelfContained',
          {
            script: [
              {
                declare: [
                  'merged',
                  {
                    merge: [
                      { var: 'allVCsWithFullImmunizationSelfContained' },
                      { var: 'allValidRCs' }
                      // { var: 'allBoosterRCs' }
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
            or: [
              {
                '!!': [
                  { var: 'allVCsAndRCsWithFullImmunization' }
                ]
              },
              {
                '!!': [
                  { var: 'allVCsAndRCsWithFullImmunizationSelfContained' }
                ]
              }
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
            if: [
              // if
              {
                find: [
                  { var: 'allVCsAndRCsWithFullImmunization' },
                  {
                    '!!': [
                      { var: 'it.__isFullImmunization' }
                    ]
                  },
                  'it'
                ]
              },
              'COMPLETE_IMMUNIZATION',
              // else if
              {
                find: [
                  { var: 'allRelevantVCsAnnotated' },
                  {
                    and: [
                      {
                        after: [
                          { var: 'it.__fullImmunizationDate' },
                          { var: 'now.localDateTime' }
                        ]
                      },
                      {
                        '!': [
                          { var: 'it.__isJanssen1of1' }
                        ]
                      }
                    ]
                  },
                  'it'
                ]
              },
              'COMPLETE_IMMUNIZATION_PENDING',
              // else if
              {
                find: [
                  { var: 'allRelevantVCsAnnotated' },
                  {
                    or: [
                      {
                        '!': [
                          { var: 'it.__isSeriesComplete' }
                        ]
                      },
                      { var: 'it.__isJanssen1of1' }
                    ]
                  },
                  'it'
                ]
              },
              'PARTIAL_IMMUNIZATION',
              // else
              'OTHER'
            ]
          }
        ]
      },
      {
        return: [
          {
            init: [
              'object',
              // '__allVCs', { var: 'allVCs' },
              // '__allVCsWithFullImmunization', { var: 'allVCsWithFullImmunization' },
              // '__allRCs', { var: 'allRCs' },
              // '__allValidRCs', { var: 'allValidRCs' },
              // '__allVCsAndRCsWithFullImmunization', { var: 'allVCsAndRCsWithFullImmunization' },
              '__allBoosterVCs', { var: 'allBoosterVCs' },
              '__allBoosterRCs', { var: 'allBoosterRCs' },
              // '__allTCsWithValidPCR', { var: 'allTCsWithValidPCR' },
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
