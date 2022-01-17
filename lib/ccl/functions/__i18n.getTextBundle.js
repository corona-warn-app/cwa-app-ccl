'use strict'

const descriptor = {
  name: '__i18n.getTextBundle',
  definition: {
    parameters: [
    ],
    logic: [
      {
        return: [
          [
            {
              key: 'GREETING',
              texts: [
                { lang: 'en', text: 'Hello $1' },
                { lang: 'de', text: 'Hallo $1' },
                { lang: 'es', text: '¡$1, hola $1!' }
              ]
            },
            {
              key: 'ADMISSION_STATE_2G_BADGE_TEXT',
              texts: [
                { lang: 'de', text: '2G' }
              ]
            },
            {
              key: 'ADMISSION_STATE_2G_SHORT_TEXT',
              texts: [
                { lang: 'de', text: '2G' }
              ]
            },
            {
              key: 'ADMISSION_STATE_2G_LONG_TEXT',
              texts: [
                { lang: 'de', text: '2G' }
              ]
            },
            {
              key: 'VACCINATION_STATE_SUBTITLE',
              texts: [
                { lang: 'de', text: 'Komplett - short' }
              ]
            },
            {
              key: 'VACCINATION_STATE_COMPLETE_IMMUNIZATION_SHORT_TEXT',
              texts: [
                { lang: 'de', text: 'Komplett - short' }
              ]
            },
            {
              key: 'VACCINATION_STATE_COMPLETE_IMMUNIZATION_LONG_TEXT',
              texts: [
                { lang: 'de', text: 'Komplett long' }
              ]
            }
          ]
        ]
      }
    ]
  }
}

module.exports = {
  getDescriptor: () => descriptor,
  toJSON: () => JSON.stringify(descriptor)
}
