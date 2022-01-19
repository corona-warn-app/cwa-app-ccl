'use strict'

const descriptor = {
  name: '__toCertificateReference',
  definition: {
    parameters: [
      { name: 'certificate' }
    ],
    logic: [
      {
        return: [
          {
            init: [
              'object',
              'certificateRef', {
                init: [
                  'object',
                  'barcodeData', { var: 'certificate.barcodeData' }
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
