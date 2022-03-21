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
        name: 'boosterNotificationRules'
      },
      {
        name: 'invalidationRules'
      }
    ],
    logic: [
      {
        declare: [
          'walletAnalysis',
          {
            call: [
              '__analyzeDccWallet',
              {
                os: { var: 'os' },
                language: { var: 'language' },
                now: { var: 'now' },
                certificates: { var: 'certificates' }
              }
            ]
          }
        ]
      },
      // admission state
      {
        declare: [
          'admissionState',
          {
            init: [
              'object',
              'value', { var: 'walletAnalysis.admissionState' },
              'faqAnchor', 'admission_policy',
              'visible', true
            ]
          }
        ]
      },
      {
        declare: [
          'admissionStateTextKeyComponent',
          {
            if: [
              {
                in: [
                  { var: 'walletAnalysis.admissionState' },
                  [
                    '2G_PLUS',
                    '2G_PLUS_PCR',
                    '2G_PLUS_RAT'
                  ]
                ]
              },
              '2G_PLUS',
              { var: 'walletAnalysis.admissionState' }
            ]
          }
        ]
      },
      {
        assign: [
          'admissionState.badgeText',
          {
            call: [
              '__i18n.getTextDescriptor',
              {
                key: {
                  concatenate: [
                    'ADMISSION_STATE_',
                    { var: 'admissionStateTextKeyComponent' },
                    '_BADGE_TEXT'
                  ]
                }
              }
            ]
          }
        ]
      },
      {
        assign: [
          'admissionState.titleText',
          {
            call: [
              '__i18n.getTextDescriptor',
              {
                key: 'ADMISSION_STATE_TITLE_TEXT'
              }
            ]
          }
        ]
      },
      {
        assign: [
          'admissionState.subtitleText',
          { var: 'admissionState.badgeText' }
        ]
      },
      {
        assign: [
          'admissionState.longText',
          {
            call: [
              '__i18n.getTextDescriptor',
              {
                key: {
                  concatenate: [
                    'ADMISSION_STATE_',
                    { var: 'admissionStateTextKeyComponent' },
                    '_LONG_TEXT'
                  ]
                }
              }
            ]
          }
        ]
      },
      {
        assign: [
          'admissionState.stateChangeNotificationText',
          {
            call: [
              '__i18n.getTextDescriptor',
              {
                key: {
                  concatenate: [
                    'ADMISSION_STATE_',
                    { var: 'admissionStateTextKeyComponent' },
                    '_SCN_TEXT'
                  ]
                }
              }
            ]
          }
        ]
      },
      {
        assign: [
          'admissionState.identifier',
          {
            if: [
              {
                in: [
                  { var: 'walletAnalysis.admissionState' },
                  [
                    '2G_PLUS',
                    '2G_PLUS_PCR',
                    '2G_PLUS_RAT'
                  ]
                ]
              },
              '2G_PLUS',
              // else
              { var: 'walletAnalysis.admissionState' }
            ]
          }
        ]
      },
      // vaccination state
      {
        declare: [
          'vaccinationState',
          {
            init: [
              'object',
              'value', { var: 'walletAnalysis.vaccinationState' }
            ]
          }
        ]
      },
      {
        assign: [
          'vaccinationState.visible',
          {
            '>': [
              {
                count: [
                  { var: 'walletAnalysis.allRelevantVCsAnnotated' }
                ]
              },
              0
            ]
          }
        ]
      },
      {
        if: [
          { var: 'vaccinationState.visible' },
          {
            assign: [
              'vaccinationState.titleText',
              {
                call: [
                  '__i18n.getTextDescriptor',
                  {
                    key: 'VACCINATION_STATE_TITLE_TEXT'
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        if: [
          { var: 'vaccinationState.visible' },
          {
            assign: [
              'vaccinationState.subtitleText',
              {
                init: [
                  'object',
                  'type', 'system-time-dependent',
                  'functionName', 'getVaccinationStateSubtitleText',
                  'parameters', {
                    init: [
                      'object',
                      'dt', { var: 'walletAnalysis.mostRecentVaccinationCertificate.hcert.v.0.dt' }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        if: [
          { var: 'vaccinationState.visible' },
          {
            assign: [
              'vaccinationState.longText',
              {
                if: [
                  {
                    '!==': [
                      { var: 'walletAnalysis.vaccinationState' },
                      'PARTIAL_IMMUNIZATION'
                    ]
                  },
                  {
                    init: [
                      'object',
                      'type', 'system-time-dependent',
                      'functionName', 'getVaccinationStateLongText',
                      'parameters', {
                        init: [
                          'object',
                          'dt', { var: 'walletAnalysis.mostRecentVaccinationCertificate.hcert.v.0.dt' },
                          'offsetInDays', { var: 'walletAnalysis.mostRecentVaccinationCertificate.__offsetInDays' }
                        ]
                      }
                    ]
                  },
                  // else
                  {
                    call: [
                      '__i18n.getTextDescriptor',
                      {
                        key: 'VACCINATION_STATE_PARTIAL_IMMUNIZATION_LONG_TEXT'
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      // verification certificates
      {
        declare: [
          'verificationCertificates',
          {
            init: [
              'object'
            ]
          }
        ]
      },
      {
        assign: [
          'verificationCertificates.certificates',
          {
            map: [
              { var: 'walletAnalysis.verificationCertificates' },
              {
                init: [
                  'object',
                  'buttonText', {
                    if: [
                      { var: 'it.hcert.t.0' },
                      {
                        call: [
                          '__i18n.getTextDescriptor',
                          {
                            key: 'PERSON_VIEW_TEST_CERTIFICATE'
                          }
                        ]
                      },
                      // else
                      {
                        call: [
                          '__i18n.getTextDescriptor',
                          {
                            key: 'PERSON_VIEW_2G_CERTIFICATE'
                          }
                        ]
                      }
                    ]
                  },
                  'certificateRef', {
                    init: [
                      'object',
                      'barcodeData', { var: 'it.barcodeData' }
                    ]
                  }
                ]
              },
              'it'
            ]
          }
        ]
      },
      // BNRs
      {
        declare: [
          'youngestVaccinationCertificate',
          {
            script: [
              {
                declare: [
                  'sorted',
                  {
                    call: [
                      '__sortVaccinationCertificatesByDate',
                      {
                        certificates: { var: 'walletAnalysis.allRelevantVCsAnnotated' },
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
      {
        declare: [
          'youngestRecoveryCertificate',
          {
            script: [
              {
                declare: [
                  'sorted',
                  {
                    call: [
                      '__sortRecoveryCertificatesByDate',
                      {
                        certificates: { var: 'walletAnalysis.allRelevantRCsAnnotated' },
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
      {
        declare: [
          'bnrMatch',
          {
            call: [
              '__evaluateBoosterNotificationRules',
              {
                vc: { var: 'youngestVaccinationCertificate' },
                rc: { var: 'youngestRecoveryCertificate' },
                boosterNotificationRules: { var: 'boosterNotificationRules' },
                validationClock: { var: 'now.utcDateTime' }
              }
            ]
          }
        ]
      },
      {
        declare: [
          'boosterNotification',
          {
            init: [
              'object',
              'identifier', { var: 'bnrMatch.Identifier' },
              'faqAnchor', 'vac_cert_booster'
            ]
          }
        ]
      },
      {
        assign: [
          'boosterNotification.visible',
          {
            '!!': [
              { var: 'bnrMatch' }
            ]
          }
        ]
      },
      {
        if: [
          { var: 'boosterNotification.visible' },
          {
            assign: [
              'boosterNotification.titleText',
              {
                call: [
                  '__i18n.getTextDescriptor',
                  {
                    key: 'BOOSTER_NOTIFICATION_TITLE_TEXT'
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        if: [
          { var: 'boosterNotification.visible' },
          {
            assign: [
              'boosterNotification.subtitleText',
              {
                call: [
                  '__i18n.getTextDescriptor',
                  {
                    key: 'BOOSTER_NOTIFICATION_SUBTITLE_TEXT'
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        if: [
          { var: 'boosterNotification.visible' },
          {
            assign: [
              'boosterNotification.longText',
              {
                init: [
                  'object',
                  'type', 'string',
                  'localizedText', {
                    init: [
                      'object',
                      'en', { var: 'bnrMatch.DescriptionByLang.en' },
                      'de', { var: 'bnrMatch.DescriptionByLang.de' }
                    ]
                  },
                  'parameters', []
                ]
              }
            ]
          }
        ]
      },
      {
        declare: [
          'validUntil', {
            call: [
              '__determineDccWalletInfoValidUntil',
              {
                now: { var: 'now' },
                allTCsTypeRATLatestFirst: { var: 'walletAnalysis.__allTCsWithValidRAT' },
                allTCsTypePCRLatestFirst: { var: 'walletAnalysis.__allTCsWithValidPCR' }
              }
            ]
          }
        ]
      },
      // DCC reissuance
      {
        declare: [
          // an empty object _or_ an object with a certificateReissuance property
          'reissuanceNode',
          {
            script: [
              // abort early with empty object
              {
                if: [
                  {
                    '!': [
                      { var: 'walletAnalysis.certificateReissuance' }
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
                declare: [
                  'certificateReissuance',
                  {
                    init: [
                      'object',
                      'reissuanceDivision', {
                        init: [
                          'object',
                          'visible', true,
                          'titleText', {
                            call: [
                              '__i18n.getTextDescriptor',
                              {
                                key: 'DCC_REISSUANCE_TITLE_TEXT'
                              }
                            ]
                          },
                          'subtitleText', {
                            call: [
                              '__i18n.getTextDescriptor',
                              {
                                key: 'DCC_REISSUANCE_SUBTITLE_TEXT'
                              }
                            ]
                          },
                          'longText', {
                            call: [
                              '__i18n.getTextDescriptor',
                              {
                                key: 'DCC_REISSUANCE_LONG_TEXT'
                              }
                            ]
                          }
                        ]
                      },
                      'certificateToReissue', {
                        call: [
                          '__toCertificateReference',
                          {
                            certificate: { var: 'walletAnalysis.certificateReissuance.certificateToReissue' }
                          }
                        ]
                      },
                      'accompanyingCertificates', {
                        map: [
                          { var: 'walletAnalysis.certificateReissuance.accompanyingCertificates' },
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
                  }
                ]
              },
              {
                return: [
                  {
                    init: [
                      'object',
                      'certificateReissuance', { var: 'certificateReissuance' }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      // invalidation rules
      {
        declare: [
          'certificatesRevokedByInvalidationRules',
          {
            map: [
              {
                call: [
                  '__evaluateInvalidationRules',
                  {
                    certificates: { var: 'certificates' },
                    invalidationRules: { var: 'invalidationRules' },
                    validationClock: { var: 'now.utcDateTime' }
                  }
                ]
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
      {
        return: [
          {
            init: [
              'object',
              'mostRelevantCertificate', {
                call: [
                  '__toCertificateReference',
                  {
                    certificate: { var: 'walletAnalysis.mostRelevantCertificate' }
                  }
                ]
              },
              'mostRecentVaccination', {
                call: [
                  '__toCertificateReference',
                  {
                    certificate: { var: 'walletAnalysis.mostRecentVaccination' }
                  }
                ]
              },
              'vaccinationValidFrom', { var: 'walletAnalysis.vaccinationValidFrom' },
              'hasBooster', { var: 'walletAnalysis.hasBooster' },
              'admissionState', { var: 'admissionState' },
              'vaccinationState', { var: 'vaccinationState' },
              'verification', { var: 'verificationCertificates' },
              'boosterNotification', { var: 'boosterNotification' },
              'validUntil', { var: 'validUntil' },
              { spread: [{ var: 'reissuanceNode' }] },
              'certificatesRevokedByInvalidationRules', { var: 'certificatesRevokedByInvalidationRules' }
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
