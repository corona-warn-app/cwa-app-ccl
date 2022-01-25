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

export default {
  getDescriptor: () => descriptor,
  toJSON: () => JSON.stringify(descriptor)
}
