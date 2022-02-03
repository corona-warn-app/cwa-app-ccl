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
      },
      {
        name: 'validationRules'
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
          'allRCsWithFullImmunization',
          {
            filter: [
              { var: 'allRCs' },
              // the time difference between the time represented by `r[0].df` and the current device time is `<=` 180 days
              {
                and: [
                  {
                    '<=': [
                      {
                        diffTime: [
                          { var: 'now.localDateTime' },
                          { var: 'it.hcert.r.0.fr' },
                          'day'
                        ]
                      },
                      90
                    ]
                  },
                  {
                    '>=': [
                      {
                        diffTime: [
                          { var: 'now.localDateTime' },
                          { var: 'it.hcert.r.0.fr' },
                          'day'
                        ]
                      },
                      29
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
          'allVCsWithFullImmunization',
          {
            script: [
              {
                declare: [
                  'filtered',
                  {
                    filter: [
                      { var: 'allVCs' },
                      {
                        and: [
                          {
                            '>=': [
                              { var: 'it.hcert.v.0.dn' },
                              { var: 'it.hcert.v.0.sd' }
                            ]
                          },
                          {
                            or: [
                              // the time difference between the time represented by `v[0].dt` and the current device time is `>` 14 days
                              {
                                '>': [
                                  {
                                    diffTime: [
                                      { var: 'now.localDate' },
                                      { var: 'it.hcert.v.0.dt' },
                                      'day'
                                    ]
                                  },
                                  14
                                ]
                              },
                              // `v[0].dn` is `> 1` and `v[0].mp` equals `EU/1/20/1525` (Johnson & Johnson) (booster vaccination)
                              {
                                and: [
                                  {
                                    '>': [
                                      { var: 'it.hcert.v.0.dn' },
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
                              },
                              // `v[0].dn` is `> 2` (booster vaccination with other vaccine)
                              {
                                '>': [
                                  { var: 'it.hcert.v.0.dn' },
                                  2
                                ]
                              },
                              // v[0].dn` equals `1` and `v[0].sd` equals `1` and `v[0].mp` is one of `EU/1/20/1528` (Biontech), `EU/1/20/1507` (Moderna), or `EU/1/21/1529` (Astra Zeneca)
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
                                        'EU/1/21/1529' // Astra Zeneca
                                      ]
                                    ]
                                  }
                                ]
                              },
                              // new booster notation, e.g. 2/1
                              {
                                '>': [
                                  { var: 'it.hcert.v.0.dn' },
                                  { var: 'it.hcert.v.0.sd' }
                                ]
                              },
                              // 2/2 with a previous 1/1 or previous RC
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
                                  },
                                  {
                                    or: [
                                      {
                                        some: [
                                          { var: 'allVCs' },
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
                                                  { var: 'it.hcert.v.0.dt' }
                                                ]
                                              }
                                            ]
                                          },
                                          'inner'
                                        ]
                                      },
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
                                  }
                                ]
                              }
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
          'allVCsWithFullImmunizationDetectable',
          {
            script: [
              {
                declare: [
                  'filtered',
                  {
                    filter: [
                      { var: 'allVCs' },
                      {
                        and: [
                          {
                            '>=': [
                              { var: 'it.hcert.v.0.dn' },
                              { var: 'it.hcert.v.0.sd' }
                            ]
                          },
                          {
                            or: [
                              // the time difference between the time represented by `v[0].dt` and the current device time is `>` 14 days
                              {
                                '>': [
                                  {
                                    diffTime: [
                                      { var: 'now.localDate' },
                                      { var: 'it.hcert.v.0.dt' },
                                      'day'
                                    ]
                                  },
                                  14
                                ]
                              },
                              // `v[0].dn` is `> 1` and `v[0].mp` equals `EU/1/20/1525` (Johnson & Johnson) (booster vaccination)
                              {
                                and: [
                                  {
                                    '>': [
                                      { var: 'it.hcert.v.0.dn' },
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
                              },
                              // `v[0].dn` is `> 2` (booster vaccination with other vaccine)
                              {
                                '>': [
                                  { var: 'it.hcert.v.0.dn' },
                                  2
                                ]
                              },
                              // v[0].dn` equals `1` and `v[0].sd` equals `1` and `v[0].mp` is one of `EU/1/20/1528` (Biontech), `EU/1/20/1507` (Moderna), or `EU/1/21/1529` (Astra Zeneca)
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
                                        'EU/1/21/1529' // Astra Zeneca
                                      ]
                                    ]
                                  }
                                ]
                              },
                              // new booster notation, e.g. 2/1
                              {
                                '>': [
                                  { var: 'it.hcert.v.0.dn' },
                                  { var: 'it.hcert.v.0.sd' }
                                ]
                              }
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
              { var: 'allVCs' },
              {
                or: [
                  // `v[0].dn` is `> 1` and `v[0].mp` equals `EU/1/20/1525` (Johnson & Johnson) (booster vaccination)
                  {
                    and: [
                      {
                        '>': [
                          { var: 'it.hcert.v.0.dn' },
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
                  },
                  // `v[0].dn` is `> 2` (booster vaccination with other vaccine)
                  {
                    '>': [
                      { var: 'it.hcert.v.0.dn' },
                      2
                    ]
                  },
                  // `v[0].dn` is `v[0].sd` (new booster notation)
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
      {
        declare: [
          'allBoosterRCs',
          {
            filter: [
              { var: 'allRCs' },
              {
                and: [
                  {
                    '<=': [
                      {
                        diffTime: [
                          { var: 'now.localDateTime' },
                          { var: 'it.hcert.r.0.fr' },
                          'day'
                        ]
                      },
                      90
                    ]
                  },
                  {
                    '>=': [
                      {
                        diffTime: [
                          { var: 'now.localDateTime' },
                          { var: 'it.hcert.r.0.fr' },
                          'day'
                        ]
                      },
                      29
                    ]
                  },
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
                              'LP6464-4'
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
                              'LP217198-3'
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
                      { var: 'allBoosterRCs' }
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
          'allVCsAndRCsWithFullImmunizationDetectable',
          {
            script: [
              {
                declare: [
                  'merged',
                  {
                    merge: [
                      { var: 'allVCsWithFullImmunizationDetectable' },
                      { var: 'allRCsWithFullImmunization' },
                      { var: 'allBoosterRCs' }
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
            or: [
              {
                '>': [
                  {
                    count: [
                      { var: 'allBoosterVCs' }
                    ]
                  },
                  0
                ]
              },
              {
                '>': [
                  {
                    count: [
                      { var: 'allBoosterRCs' }
                    ]
                  },
                  0
                ]
              }
            ]
          }
        ]
      },
      // admission state
      {
        declare: [
          'has2G',
          {
            '>': [
              {
                count: [
                  { var: 'allVCsAndRCsWithFullImmunization' }
                ]
              },
              0
            ]
          }
        ]
      },
      {
        declare: [
          'hasPCR',
          {
            '>': [
              {
                count: [
                  { var: 'allTCsWithValidPCR' }
                ]
              },
              0
            ]
          }
        ]
      },
      {
        declare: [
          'hasRAT',
          {
            '>': [
              {
                count: [
                  { var: 'allTCsWithValidRAT' }
                ]
              },
              0
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
                  { var: 'hasBooster' },
                  { var: 'hasPCR' }
                ]
              },
              '1G_PLUS_PCR',
              // has2G && && hasBooster && hasRAT
              {
                and: [
                  { var: 'has2G' },
                  { var: 'hasBooster' },
                  { var: 'hasRAT' }
                ]
              },
              '1G_PLUS_RAT',
              // has2G && hasBooster
              {
                and: [
                  { var: 'has2G' },
                  { var: 'hasBooster' }
                ]
              },
              '1G',
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
                '>': [
                  {
                    count: [
                      { var: 'allVCsAndRCsWithFullImmunizationDetectable' }
                    ]
                  },
                  0
                ]
              },
              { var: 'allVCsAndRCsWithFullImmunizationDetectable.0' },
              // {
              //   '>': [
              //     {
              //       count: [
              //         { var: 'allVCsWithFullImmunization' }
              //       ]
              //     },
              //     0
              //   ]
              // },
              // { var: 'allVCsWithFullImmunization.0' },
              // // else if
              // {
              //   '>': [
              //     {
              //       count: [
              //         { var: 'allRCsWithFullImmunization' }
              //       ]
              //     },
              //     0
              //   ]
              // },
              // { var: 'allRCsWithFullImmunization.0' },
              // else if
              {
                '>': [
                  {
                    count: [
                      { var: 'allTCsWithValidPCR' }
                    ]
                  },
                  0
                ]
              },
              { var: 'allTCsWithValidPCR.0' },
              {
                '>': [
                  {
                    count: [
                      { var: 'allTCsWithValidRAT' }
                    ]
                  },
                  0
                ]
              },
              { var: 'allTCsWithValidRAT.0' },
              // else if, latest vc
              {
                '>': [
                  {
                    count: [
                      { var: 'allVCs' }
                    ]
                  },
                  0
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
                            certificates: { var: 'allVCs' },
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
              // else if, latest rc
              {
                '>': [
                  {
                    count: [
                      { var: 'allRCs' }
                    ]
                  },
                  0
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
              // else
              {
                script: [
                  // sort all certs by latest
                  {
                    declare: [
                      'allCertificatesSortedByDateAscending',
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
                      { var: 'allCertificatesSortedByDateAscending.0' }
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
                  'allVCsSortedByDateDescending',
                  {
                    sort: [
                      { var: 'allVCs' },
                      {
                        before: [
                          { var: 'a.hcert.v.0.dt' },
                          { var: 'b.hcert.v.0.dt' }
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                return: [
                  {
                    if: [
                      {
                        '>': [
                          {
                            count: [
                              { var: 'allVCsSortedByDateDescending' }
                            ]
                          },
                          0
                        ]
                      },
                      { var: 'allVCsSortedByDateDescending.0' },
                      null
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      // earliest complete vaccination certificate
      {
        declare: [
          'earliestCompleteVaccinationCertificate',
          {
            script: [
              {
                declare: [
                  'allVCsForEarliestCompleteVaccinationCertificate',
                  {
                    filter: [
                      { var: 'allVCs' },
                      {
                        '>=': [
                          { var: 'it.hcert.v.0.dn' },
                          { var: 'it.hcert.v.0.sd' }
                        ]
                      },
                      'it'
                    ]
                  }
                ]
              },
              {
                declare: [
                  'allVCsForEarliestCompleteVaccinationCertificateSorted',
                  {
                    sort: [
                      { var: 'allVCsForEarliestCompleteVaccinationCertificate' },
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
              {
                return: [
                  {
                    if: [
                      {
                        '>': [
                          {
                            count: [
                              { var: 'allVCsForEarliestCompleteVaccinationCertificateSorted' }
                            ]
                          },
                          0
                        ]
                      },
                      { var: 'allVCsForEarliestCompleteVaccinationCertificateSorted.0' },
                      null
                    ]
                  }
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
            in: [
              { var: 'admissionState' },
              [
                '1G_PLUS_PCR',
                '2G_PLUS_PCR'
              ]
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
            in: [
              { var: 'admissionState' },
              [
                '1G_PLUS_RAT',
                '2G_PLUS_RAT'
              ]
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
      {
        declare: [
          'verificationCertificatesAsReference',
          {
            map: [
              {
                var: 'verificationCertificates'
              },
              {
                call: [
                  '__toCertificateReference',
                  {
                    certificate: { var: 'it' }
                  }
                ]
              },
              'it'
            ]
          }
        ]
      },
      // vaccination state
      {
        declare: [
          'vaccinationStateFullImmunizationComplete',
          {
            '>': [
              {
                count: [
                  { var: 'allVCsWithFullImmunization' }
                ]
              },
              0
            ]
          }
        ]
      },
      {
        declare: [
          'vaccinationStateFullImmunizationPending',
          {
            '>': [
              {
                count: [
                  {
                    filter: [
                      { var: 'allVCs' },
                      {
                        and: [
                          {
                            '>=': [
                              { var: 'it.hcert.v.0.dn' },
                              { var: 'it.hcert.v.0.sd' }
                            ]
                          },
                          {
                            '<=': [
                              {
                                diffTime: [
                                  { var: 'now.localDateTime' },
                                  { var: 'it.hcert.v.0.dt' },
                                  'day'
                                ]
                              },
                              14
                            ]
                          }
                        ]
                      },
                      'it'
                    ]
                  }
                ]
              },
              0
            ]
          }
        ]
      },
      {
        declare: [
          'vaccinationStatePartialImmunization',
          {
            '>': [
              {
                count: [
                  {
                    filter: [
                      { var: 'allVCs' },
                      {
                        and: [
                          {
                            '<': [
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
              0
            ]
          }
        ]
      },
      {
        declare: [
          'vaccinationState',
          {
            if: [
              // if
              { var: 'vaccinationStateFullImmunizationComplete' },
              'COMPLETE_IMMUNIZATION',
              // else if
              { var: 'vaccinationStateFullImmunizationPending' },
              'COMPLETE_IMMUNIZATION_PENDING',
              // else if
              { var: 'vaccinationStatePartialImmunization' },
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
              '__allSorted',
              {
                call: [
                  '__sortCertificatesByDate',
                  {
                    certificates: { var: 'certificates' },
                    ascending: true
                  }
                ]
              },
              '__allVCs', { var: 'allVCs' },
              '__allVCsWithFullImmunization', { var: 'allVCsWithFullImmunization' },
              '__allRCs', { var: 'allRCs' },
              '__allRCsWithFullImmunization', { var: 'allRCsWithFullImmunization' },
              '__allVCsAndRCsWithFullImmunization', { var: 'allVCsAndRCsWithFullImmunization' },
              '__allBoosterVCs', { var: 'allBoosterVCs' },
              '__allBoosterRCs', { var: 'allBoosterRCs' },
              '__allTCsWithValidPCR', { var: 'allTCsWithValidPCR' },
              // "__allTCsWithValidPCR", { "call": ["__toCertificateReference", { "certificate": { "var": "allTCsWithValidPCR.0" }}]},
              '__has2G', { var: 'has2G' },
              '__hasPCR', { var: 'hasPCR' },
              '__hasRAT', { var: 'hasRAT' },
              '__mostRecentVaccinationCertificate', { var: 'mostRecentVaccinationCertificate' },
              '__verificationCertificates', { var: 'verificationCertificates' },
              'hasBooster', { var: 'hasBooster' },
              'admissionState', { var: 'admissionState' },
              'vaccinationState', { var: 'vaccinationState' },
              'vaccinationValidFrom', {
                if: [
                  { var: 'earliestCompleteVaccinationCertificate.hcert.v.0' },
                  {
                    if: [
                      {
                        and: [
                          {
                            '>=': [
                              { var: 'earliestCompleteVaccinationCertificate.hcert.v.0.dn' },
                              { var: 'earliestCompleteVaccinationCertificate.hcert.v.0.sd' }
                            ]
                          },
                          {
                            or: [
                              {
                                and: [
                                  {
                                    '===': [
                                      { var: 'earliestCompleteVaccinationCertificate.hcert.v.0.dn' },
                                      1
                                    ]
                                  },
                                  {
                                    '!==': [
                                      { var: 'earliestCompleteVaccinationCertificate.hcert.v.0.mp' },
                                      'EU/1/20/1525'
                                    ]
                                  }
                                ]
                              },
                              {
                                some: [
                                  { var: 'allRCs' },
                                  {
                                    before: [
                                      { var: 'inner.hcert.r.0.fr' },
                                      { var: 'earliestCompleteVaccinationCertificate.hcert.v.0.dt' }
                                    ]
                                  },
                                  'inner'
                                ]
                              }
                            ]
                          }
                        ]
                      },
                      {
                        plusTime: [
                          { var: 'earliestCompleteVaccinationCertificate.hcert.v.0.dt' },
                          0,
                          'day'
                        ]
                      },
                      {
                        plusTime: [
                          { var: 'earliestCompleteVaccinationCertificate.hcert.v.0.dt' },
                          15,
                          'day'
                        ]
                      }
                    ]
                  },
                  null
                ]
              },
              // '__mostRelevantCertificate', { var: 'mostRelevantCertificate' },
              'mostRelevantCertificate', { call: ['__toCertificateReference', { certificate: { var: 'mostRelevantCertificate' } }] },
              'mostRecentVaccination', { call: ['__toCertificateReference', { certificate: { var: 'mostRecentVaccinationCertificate' } }] },
              'verificationCertificates', {
                init: [
                  'object',
                  'certificates', { var: 'verificationCertificatesAsReference' }
                ]
              }
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
