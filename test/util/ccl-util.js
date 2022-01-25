import dcc from './dcc/index.js'

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

export default {
  mapBarcodeDataToCertificate
}
