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
              'faqAnchor', 'test'
            ]
          }
        ]
      },
      {
        assign: [
          'admissionState.visible',
          {
            if: [
              {
                '===': [
                  { var: 'walletAnalysis.admissionState' },
                  'OTHER'
                ]
              },
              false,
              // else
              true
            ]
          }
        ]
      },
      {
        if: [
          { var: 'admissionState.visible' },
          {
            script: [
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
                            { var: 'walletAnalysis.admissionState' },
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
                  {
                    call: [
                      '__i18n.getTextDescriptor',
                      {
                        key: {
                          concatenate: [
                            'ADMISSION_STATE_',
                            { var: 'walletAnalysis.admissionState' },
                            '_SUBTITLE_TEXT'
                          ]
                        }
                      }
                    ]
                  }
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
                            { var: 'walletAnalysis.admissionState' },
                            '_LONG_TEXT'
                          ]
                        }
                      }
                    ]
                  }
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
            init: [
              'object',
              'value', { var: 'walletAnalysis.vaccinationState' },
              'faqAnchor', 'test'
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
                  { var: 'walletAnalysis.__allVCs' }
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
            script: [
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
              },
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
                          'dt', { var: 'walletAnalysis.__mostRecentVaccinationCertificate.hcert.v.0.dt' }
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                assign: [
                  'vaccinationState.longText',
                  {
                    init: [
                      'object',
                      'type', 'system-time-dependent',
                      'functionName', 'getVaccinationStateLongText',
                      'parameters', {
                        init: [
                          'object',
                          'dt', { var: 'walletAnalysis.__mostRecentVaccinationCertificate.hcert.v.0.dt' }
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
      // verification certificates
      {
        declare: [
          'verificationCertificates',
          { var: 'walletAnalysis.verificationCertificates' }
        ]
      },
      {
        assign: [
          'verificationCertificates.certificates',
          {
            map: [
              { var: 'walletAnalysis.__verificationCertificates' },
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
                        certificates: { var: 'walletAnalysis.__allVCs' },
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
                        certificates: { var: 'walletAnalysis.__allRCs' },
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
                boosterNotificationRules: { var: 'boosterNotificationRules' }
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
              'faqAnchor', 'test'
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
            script: [
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
              },
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
              },
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
          }
        ]
      },
      {
        return: [
          {
            init: [
              'object',
              {
                spread: [
                  { var: 'walletAnalysis' }
                ]
              },
              'mostRelevantCertificate', { var: 'walletAnalysis.mostRelevantCertificate' },
              'mostRecentVaccination', { var: 'walletAnalysis.mostRecentVaccination' },
              'vaccinationValidFrom', { var: 'walletAnalysis.vaccinationValidFrom' },
              'hasBooster', { var: 'walletAnalysis.hasBooster' },
              'admissionState', { var: 'admissionState' },
              'vaccinationState', { var: 'vaccinationState' },
              // if commented out, iOS test fails
              // if commented in, iOS test pass
              // 'verificationCertificates', { var: 'verificationCertificates' },
              'verification', { var: 'verificationCertificates' },
              'bnrMatch', { var: 'bnrMatch' },
              'boosterNotification', { var: 'boosterNotification' },
              'validUntil', {
                plusTime: [
                  { var: 'now.localDateTime' },
                  1,
                  'day'
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
