'use strict'

const dccData = require('./dcc-data')
const dccDecode = require('./dcc-decode')
const dccEncode = require('./dcc-encode')
const dccUtil = require('./dcc-util')
const dccSignature = require('./dcc-signature')
const dccDsc = require('./dcc-dsc')

module.exports = {
  data: { ...dccData },
  decode: {
    ...dccDecode
  },
  dsc: dccDsc,
  encode: {
    ...dccEncode
  },
  generate: require('./dcc-generate'),
  series: require('./dcc-series'),
  signature: {
    ...dccSignature
  },
  util: {
    ...dccUtil
  }
}
