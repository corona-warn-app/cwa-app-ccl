'use strict'

const descriptor = {
  name: '__i18n.getTextByKey',
  definition: {
    parameters: [
      { name: 'key' },
      { name: 'lang' },
      { name: 'defaultLang', default: 'en' }
    ],
    logic: [
      {
        declare: [
          'textBundle',
          {
            call: [
              '__i18n.getTextBundle'
            ]
          }
        ]
      },
      {
        declare: [
          'text',
          {
            find: [
              { var: 'textBundle' },
              {
                '===': [
                  { var: 'it.key' },
                  { var: 'key' }
                ]
              },
              'it'
            ]
          }
        ]
      },
      {
        if: [
          {
            missing: ['text']
          },
          {
            return: [
              null
            ]
          }
        ]
      },
      {
        declare: [
          'textInLang',
          {
            find: [
              { var: 'text.texts' },
              {
                '===': [
                  { var: 'it.lang' },
                  { var: 'lang' }
                ]
              },
              'it'
            ]
          }
        ]
      },
      {
        if: [
          { var: 'textInLang' },
          {
            return: [
              { var: 'textInLang.text' }
            ]
          }
        ]
      },
      {
        declare: [
          'textInDefaultLang',
          {
            find: [
              { var: 'text.texts' },
              {
                '===': [
                  { var: 'it.lang' },
                  { var: 'defaultLang' }
                ]
              },
              'it'
            ]
          }
        ]
      },
      {
        if: [
          { var: 'textInDefaultLang' },
          {
            return: [
              { var: 'textInDefaultLang.text' }
            ]
          },
          {
            return: [
              null
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
