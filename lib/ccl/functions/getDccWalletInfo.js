import * as constants from './../ccl-constants.js'

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
        name: 'scenarioIdentifier'
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
                certificates: { var: 'certificates' },
                scenarioIdentifier: { var: 'scenarioIdentifier' },
                invalidationRules: { var: 'invalidationRules' }
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
              'visible', true,
              'badgeText', {
                call: [
                  '__i18n.getTextDescriptor',
                  {
                    key: 'ADMISSION_STATE_OTHER_BADGE_TEXT'
                  }
                ]
              },
              'titleText', {
                call: [
                  '__i18n.getTextDescriptor',
                  {
                    key: 'ADMISSION_STATE_TITLE_TEXT'
                  }
                ]
              },
              'subtitleText', {
                call: [
                  '__i18n.getTextDescriptor',
                  {
                    key: 'ADMISSION_STATE_OTHER_BADGE_TEXT' // reuse badge text
                  }
                ]
              },
              'longText', {
                call: [
                  '__i18n.getTextDescriptor',
                  {
                    key: 'ADMISSION_STATE_OTHER_LONG_TEXT'
                  }
                ]
              },
              'stateChangeNotificationText', {
                call: [
                  '__i18n.getTextDescriptor',
                  {
                    key: 'ADMISSION_STATE_OTHER_LONG_TEXT' // reuse long text
                  }
                ]
              },
              'identifier', 'OTHER'
            ]
          }
        ]
      },
      // mask state
      {
        declare: [
          'maskState',
          {
            init: [
              'object',
              'identifier', { var: 'walletAnalysis.maskState' },
              'faqAnchor', 'mask_rules',
              'visible', {
                in: [
                  { var: 'walletAnalysis.maskState' },
                  ['MASK_REQUIRED', 'MASK_OPTIONAL']
                ]
              }
            ]
          }
        ]
      },
      {
        declare: [
          'maskStateScenarioTextKeyComponent',
          {
            if: [
              {
                in: [
                  { var: 'scenarioIdentifier' },
                  constants.FEDERAL_STATE_IDS
                ]
              },
              { var: 'scenarioIdentifier' },
              'DE' // default value
            ]
          }
        ]
      },
      {
        if: [
          { var: 'maskState.visible' },
          {
            assign: [
              'maskState.badgeText',
              {
                call: [
                  '__i18n.getTextDescriptor',
                  {
                    key: {
                      concatenate: [
                        'MASK_STATE_',
                        { var: 'walletAnalysis.maskState' },
                        '_TITLE_TEXT' // reuse title text
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
        if: [
          { var: 'maskState.visible' },
          {
            assign: [
              'maskState.titleText',
              {
                call: [
                  '__i18n.getTextDescriptor',
                  {
                    key: {
                      concatenate: [
                        'MASK_STATE_',
                        { var: 'walletAnalysis.maskState' },
                        '_TITLE_TEXT'
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
        if: [
          { var: 'maskState.visible' },
          {
            assign: [
              'maskState.subtitleText',
              {
                call: [
                  '__i18n.getTextDescriptor',
                  {
                    key: {
                      concatenate: [
                        'ADMISSION_SCENARIO_SELECTION_',
                        { var: 'maskStateScenarioTextKeyComponent' },
                        '_TITLE_TEXT'
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
        declare: [
          'maskStateScenarioTextKeyComponentLongText',
          {
            if: [
              {
                in: [
                  { var: 'scenarioIdentifier' },
                  [...constants.FEDERAL_STATE_IDS, 'EXTENDED']
                ]
              },
              'EXTENDED',
              'BASIC'
            ]
          }
        ]
      },
      {
        if: [
          { var: 'maskState.visible' },
          {
            assign: [
              'maskState.longText',
              {
                call: [
                  '__i18n.getTextDescriptor',
                  {
                    key: {
                      concatenate: [
                        'MASK_STATE_',
                        { var: 'walletAnalysis.maskState' },
                        '_LONG_TEXT_',
                        { var: 'maskStateScenarioTextKeyComponentLongText' }
                      ]
                    }
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
              'visible', true,
              'faqAnchor', 'vac_status'
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
                if: [
                  { var: 'walletAnalysis.mostRecentVaccinationCertificate' },
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
                  },
                  // else
                  {
                    call: [
                      '__i18n.getTextDescriptor',
                      {
                        key: 'VACCINATION_STATE_SUBTITLE_TEXT_NO_VACCINATION'
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
        if: [
          { var: 'vaccinationState.visible' },
          {
            assign: [
              'vaccinationState.longText',
              {
                if: [
                  {
                    in: [
                      { var: 'walletAnalysis.vaccinationState' },
                      [
                        'COMPLETE_IMMUNIZATION_PENDING',
                        'COMPLETE_BOOSTER_RC_PENDING',
                        'COMPLETE_IMMUNIZATION_RC_PENDING'
                      ]
                    ]
                  },
                  {
                    init: [
                      'object',
                      'type', 'system-time-dependent',
                      'functionName', 'getVaccinationStateLongTextV2',
                      'parameters', {
                        init: [
                          'object',
                          'date', {
                            if: [
                              {
                                in: [
                                  { var: 'walletAnalysis.vaccinationState' },
                                  [
                                    'COMPLETE_BOOSTER_RC_PENDING',
                                    'COMPLETE_IMMUNIZATION_RC_PENDING'
                                  ]
                                ]
                              },
                              { var: 'walletAnalysis.mostRecentRecoveryCertificate.hcert.r.0.fr' },
                              { var: 'walletAnalysis.mostRecentVaccinationCertificate.hcert.v.0.dt' }
                            ]
                          },
                          'offsetInDays', {
                            if: [
                              {
                                in: [
                                  { var: 'walletAnalysis.vaccinationState' },
                                  [
                                    'COMPLETE_BOOSTER_RC_PENDING',
                                    'COMPLETE_IMMUNIZATION_RC_PENDING'
                                  ]
                                ]
                              },
                              29,
                              { var: 'walletAnalysis.mostRecentVaccinationCertificate.__offsetInDays' }
                            ]
                          },
                          'vaccinationState', { var: 'walletAnalysis.vaccinationState' }
                        ]
                      }
                    ]
                  },
                  // else
                  {
                    call: [
                      '__i18n.getTextDescriptor',
                      {
                        key: {
                          concatenate: [
                            'VACCINATION_STATE_',
                            { var: 'walletAnalysis.vaccinationState' },
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
                        certificates: { var: 'walletAnalysis.allLegitimateVCs' },
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
                        certificates: { var: 'walletAnalysis.allLegitimateRCs' },
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
              'faqAnchor', 'vac_booster_basics'
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
                      { spread: [{ var: 'bnrMatch.DescriptionByLang' }] }
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
                                key: {
                                  concatenate: [
                                    'DCC_REISSUANCE_TITLE_TEXT_',
                                    { var: 'walletAnalysis.certificateReissuance.textKeySuffix' }
                                  ]
                                }
                              }
                            ]
                          },
                          'subtitleText', {
                            call: [
                              '__i18n.getTextDescriptor',
                              {
                                key: {
                                  concatenate: [
                                    'DCC_REISSUANCE_SUBTITLE_TEXT_',
                                    { var: 'walletAnalysis.certificateReissuance.textKeySuffix' }
                                  ]
                                }
                              }
                            ]
                          },
                          'longText', {
                            call: [
                              '__i18n.getTextDescriptor',
                              {
                                key: {
                                  concatenate: [
                                    'DCC_REISSUANCE_LONG_TEXT_',
                                    { var: 'walletAnalysis.certificateReissuance.textKeySuffix' }
                                  ]
                                }
                              }
                            ]
                          },
                          'faqAnchor', 'dcc_replacement',
                          'identifier', { var: 'walletAnalysis.certificateReissuance.identifier' },
                          'listTitleText', {
                            call: [
                              '__i18n.getTextDescriptor',
                              {
                                key: {
                                  concatenate: [
                                    'DCC_REISSUANCE_LIST_TITLE_TEXT_',
                                    { var: 'walletAnalysis.certificateReissuance.textKeySuffix' }
                                  ]
                                }
                              }
                            ]
                          },
                          'consentSubtitleText', {
                            call: [
                              '__i18n.getTextDescriptor',
                              {
                                key: {
                                  concatenate: [
                                    'DCC_REISSUANCE_CONSENT_SUBTITLE_TEXT_',
                                    { var: 'walletAnalysis.certificateReissuance.textKeySuffix' }
                                  ]
                                }
                              }
                            ]
                          }
                        ]
                      },
                      'certificates', {
                        map: [
                          { var: 'walletAnalysis.certificateReissuance.certificates' },
                          {
                            init: [
                              'object',
                              'action', { var: 'it.action' },
                              'certificateToReissue', {
                                call: [
                                  '__toCertificateReference',
                                  {
                                    certificate: { var: 'it.certificateToReissue' }
                                  }
                                ]
                              },
                              'accompanyingCertificates', {
                                map: [
                                  { var: 'it.accompanyingCertificates' },
                                  {
                                    call: [
                                      '__toCertificateReference',
                                      {
                                        certificate: { var: 'inner' }
                                      }
                                    ]
                                  },
                                  // NOTE: if this was `it` (i.e. same as in the outer context)
                                  // it fails on Android for some reason
                                  'inner'
                                ]
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
              'maskState', { var: 'maskState' },
              'vaccinationState', { var: 'vaccinationState' },
              'verification', { var: 'verificationCertificates' },
              'boosterNotification', { var: 'boosterNotification' },
              'validUntil', { var: 'validUntil' },
              { spread: [{ var: 'reissuanceNode' }] },
              'certificatesRevokedByInvalidationRules', { var: 'walletAnalysis.certificatesRevokedByInvalidationRules' }
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
