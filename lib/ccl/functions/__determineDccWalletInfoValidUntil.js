import * as constants from './../ccl-constants.js'

const descriptor = {
  name: '__determineDccWalletInfoValidUntil',
  definition: {
    parameters: [
      { name: 'now' },
      { name: 'allTCsTypeRATLatestFirst' },
      { name: 'allTCsTypePCRLatestFirst' }
    ],
    logic: [
      {
        declare: [
          'dates',
          {
            init: [
              'array',
              {
                plusTime: [
                  { var: 'now.localDateTimeMidnight' },
                  1,
                  'day'
                ]
              }
            ]
          }
        ]
      },
      {
        if: [
          { var: 'allTCsTypeRATLatestFirst.0' },
          {
            assign: [
              'dates',
              {
                push: [
                  { var: 'dates' },
                  {
                    plusTime: [
                      { var: 'allTCsTypeRATLatestFirst.0.hcert.t.0.sc' },
                      constants.TC_RAT_VALIDITY_IN_HOURS,
                      'hour'
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
          { var: 'allTCsTypePCRLatestFirst.0' },
          {
            assign: [
              'dates',
              {
                push: [
                  { var: 'dates' },
                  {
                    plusTime: [
                      { var: 'allTCsTypePCRLatestFirst.0.hcert.t.0.sc' },
                      constants.TC_PCR_VALIDITY_IN_HOURS,
                      'hour'
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        declare: [
          'sortedAsc',
          {
            sort: [
              { var: 'dates' },
              {
                after: [
                  { var: 'a' },
                  { var: 'b' }
                ]
              }
            ]
          }
        ]
      },
      {
        return: [
          { var: 'sortedAsc.0' }
        ]
      }
    ]
  }
}

export default {
  getDescriptor: () => descriptor,
  toJSON: () => JSON.stringify(descriptor)
}
