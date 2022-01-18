'use strict'

const descriptor = {
  name: '__toCertificateReference',
  definition: {
    parameters: [
      { name: 'certificate' }
    ],
    logic: [
      // {
      //   declare: [
      //     'ci',
      //     {
      //       if: [
      //         // if
      //         { var: 'certificate.hcert.v.0' },
      //         { var: 'certificate.hcert.v.0.ci' },
      //         // else if
      //         { var: 'certificate.hcert.r.0' },
      //         { var: 'certificate.hcert.r.0.ci' },
      //         // else if
      //         { var: 'certificate.hcert.t.0' },
      //         { var: 'certificate.hcert.t.0.ci' },
      //         // else
      //         null
      //       ]
      //     }
      //   ]
      // },
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
