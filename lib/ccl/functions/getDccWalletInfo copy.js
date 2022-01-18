'use strict'

const descriptor = {
  name: 'getDccWalletInfo',
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
                              { var: 'now.localDateTime' },
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
                '<=': [
                  {
                    diffTime: [
                      { var: 'now.localDateTime' },
                      { var: 'it.hcert.v.0.dt' },
                      'day'
                    ]
                  },
                  180
                ]
              },
              'it'
            ]
          }
        ]
      },
      {
        declare: [
          'allVCsAndRCsWithFullImmunization',
          {
            merge: [
              { var: 'allVCsWithFullImmunization' },
              { var: 'allRCsWithFullImmunization' }
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
          false
        ]
      },
      {
        declare: [
          'hasRAT',
          false
        ]
      },
      {
        declare: [
          'admissionState',
          {
            if: [
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
      {
        declare: [
          'admissionStateTexts',
          {
            init: [
              'object',
              'badgeText', {
                call: [
                  '__i18n.getText',
                  {
                    key: {
                      concatenate: [
                        'ADMISSION_STATE_',
                        { var: 'admissionState' },
                        '_BADGE_TEXT'
                      ]
                    }
                  }
                ]
              },
              'shortText', {
                call: [
                  '__i18n.getText',
                  {
                    key: {
                      concatenate: [
                        'ADMISSION_STATE_',
                        { var: 'admissionState' },
                        '_SHORT_TEXT'
                      ]
                    }
                  }
                ]
              },
              'longText', {
                call: [
                  '__i18n.getText',
                  {
                    key: {
                      concatenate: [
                        'ADMISSION_STATE_',
                        { var: 'admissionState' },
                        '_LONG_TEXT'
                      ]
                    }
                  }
                ]
              },
              'cwa:faqAnchor', 'dcc_admission_state'
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
                      { var: 'allVCsWithFullImmunization' }
                    ]
                  },
                  0
                ]
              },
              { var: 'allVCsWithFullImmunization.0' },
              // else if
              {
                '>': [
                  {
                    count: [
                      { var: 'allRCsWithFullImmunization' }
                    ]
                  },
                  0
                ]
              },
              { var: 'allRCsWithFullImmunization.0' },
              // else
              { var: 'certificates.0' }
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
              'array'
            ]
          }
        ]
      },
      {
        if: [
          {
            '===': [
              { var: 'admissionState' },
              '2G'
            ]
          },
          {
            push: [
              { var: 'verificationCertificates' },
              {
                init: [
                  'object',
                  'label', { call: ['__i18n.getText', { key: 'GREETING' }] },
                  'certificate', { call: ['__toCertificateReference', { certificate: { var: 'mostRelevantCertificate' } }] }
                ]
              }
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
        declare: [
          'vaccinationStateTexts',
          {
            init: [
              'object',
              'shortText', {
                call: [
                  '__i18n.getText',
                  {
                    key: {
                      concatenate: [
                        'VACCINATION_STATE_',
                        { var: 'vaccinationState' },
                        '_SHORT_TEXT'
                      ]
                    }
                  }
                ]
              },
              'longText', {
                call: [
                  '__i18n.getText',
                  {
                    key: {
                      concatenate: [
                        'VACCINATION_STATE_',
                        { var: 'vaccinationState' },
                        '_LONG_TEXT'
                      ]
                    }
                  }
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
              '__allVCs', { var: 'allVCs' },
              '__allVCsWithFullImmunization', { var: 'allVCsWithFullImmunization' },
              '__allRCs', { var: 'allRCs' },
              '__allRCsWithFullImmunization', { var: 'allRCsWithFullImmunization' },
              '__allVCsAndRCsWithFullImmunization', { var: 'allVCsAndRCsWithFullImmunization' },
              '__has2G', { var: 'has2G' },
              '__hasPCR', { var: 'hasPCR' },
              '__hasRAT', { var: 'hasRAT' },
              '__admissionState', { var: 'admissionState' },
              '__vaccinationState', { var: 'vaccinationState' },
              '__mostRelevantCertificate', { var: 'mostRelevantCertificate' },
              // "__text", { "call": ["__i18n.getText", { "key": "GREETING" }]},
              'admissionState', { var: 'admissionStateTexts' },
              'vaccinationState', { var: 'vaccinationStateTexts' },
              'mostRelevantCertificate', { call: ['__toCertificateReference', { certificate: { var: 'mostRelevantCertificate' } }] },
              'verification', {
                init: [
                  'object',
                  'certificates', { var: 'verificationCertificates' }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}

module.exports = {
  getDescriptor: () => descriptor,
  toJSON: () => JSON.stringify(descriptor)
}
