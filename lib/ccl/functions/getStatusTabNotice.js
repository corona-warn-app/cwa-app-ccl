const descriptor = {
  name: 'getStatusTabNotice',
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
      }
    ],
    logic: [
      {
        declare: [
          'visible',
          {
            'not-before': [
              { var: 'now.utcDateTime' },
              {
                plusTime: [
                  '2023-03-27T00:00:00+02:00',
                  0,
                  'hour'
                ]
              }
            ]
          }
        ]
      },
      {
        declare: [
          'output',
          {
            init: [
              'object',
              'visible', { var: 'visible' }
            ]
          }
        ]
      },
      {
        if: [
          {
            '!': [
              { var: 'visible' }
            ]
          },
          {
            return: [
              { var: 'output' }
            ]
          }
        ]
      },
      {
        assign: [
          'output.titleText',
          {
            call: [
              '__i18n.getTextDescriptor',
              {
                key: 'STATUS_TAB_NOTICE_TITLE_TEXT'
              }
            ]
          }
        ]
      },
      {
        assign: [
          'output.subtitleText',
          {
            call: [
              '__i18n.getTextDescriptor',
              {
                key: 'STATUS_TAB_NOTICE_SUBTITLE_TEXT'
              }
            ]
          }
        ]
      },
      {
        assign: [
          'output.longText',
          {
            call: [
              '__i18n.getTextDescriptor',
              {
                key: 'STATUS_TAB_NOTICE_LONG_TEXT'
              }
            ]
          }
        ]
      },
      {
        assign: [
          'output.faqAnchor',
          'ramp_down'
        ]
      },
      {
        return: [
          { var: 'output' }
        ]
      }
    ]
  }
}

export default {
  getDescriptor: () => descriptor,
  toJSON: () => JSON.stringify(descriptor)
}
