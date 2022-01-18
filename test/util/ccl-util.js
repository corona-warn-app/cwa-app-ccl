'use strict'

const moment = require('moment')
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

const mapMomentToNow = mom => {
  return {
    timestamp: moment(mom).unix(),
    localDate: moment(mom).format('YYYY-MM-DD'),
    localDateTime: moment(mom).toISOString(),
    localDateTimeMidnight: moment(mom).utc().startOf('day').toISOString(),
    utcDate: moment(mom).utc().format('YYYY-MM-DD'),
    utcDateTime: moment(mom).utc().toISOString(),
    utcDateTimeMidnight: moment(mom).utc().startOf('day').toISOString()
  }
}

module.exports = {
  mapBarcodeDataToCertificate,
  mapMomentToNow
}
