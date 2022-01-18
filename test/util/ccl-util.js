'use strict'

const dcc = require('./dcc')

const mapBarcodeDataToCertificate = (barcodeData, { validityState }) => {
  const {
    iss, iat, exp,
    coseProtectedHeader, coseUnprotectedHeader,
    dcc: hcert
  } = dcc.decode.fromBarcodeData(barcodeData)
  const kid = dcc.util.getKID(coseProtectedHeader, coseUnprotectedHeader)
  const kidStr = kid.toString('base64')
  return {
    barcodeData,
    cose: {
      kid: kidStr
    },
    cwt: {
      iss, iat, exp
    },
    hcert,
    validityState
  }
}

module.exports = {
  mapBarcodeDataToCertificate
}
