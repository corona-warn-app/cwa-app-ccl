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
          'walletAnalysis',
          {
            call: [
              '__analyzeDccWallet',
              {
                os: { var: 'os' },
                language: { var: 'language' },
                now: { var: 'now' },
                certificates: { var: 'certificates' },
                validationRules: { var: 'validationRules' }
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
              'faqAnchor', 'test'
            ]
          }
        ]
      },
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
              { var: 'verificationCertificates.certificates' },
              {
                script: [
                  {
                    assign: [
                      'it.buttonText',
                      {
                        if: [
                          true,
                          {
                            call: [
                              '__i18n.getTextDescriptor',
                              {
                                key: 'PERSON_VIEW_2G_CERTIFICATE'
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
        return: [
          {
            init: [
              'object',
              {
                spread: [
                  { var: 'walletAnalysis' }
                ]
              },
              'admissionState', { var: 'admissionState' },
              'vaccinationState', { var: 'vaccinationState' },
              'verificationCertificates', { var: 'verificationCertificates' }
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
