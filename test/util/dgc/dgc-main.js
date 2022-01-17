'use strict'

const dgcData = require('./dgc-data')
const dgcDecode = require('./dgc-decode')
const dgcEncode = require('./dgc-encode')
const dgcUtil = require('./dgc-util')
const dgcSignature = require('./dgc-signature')
const dgcDsc = require('./dgc-dsc')

module.exports = {
  data: { ...dgcData },
  decode: {
    ...dgcDecode
  },
  dsc: dgcDsc,
  encode: {
    ...dgcEncode
  },
  generate: require('./dgc-generate'),
  series: require('./dgc-series'),
  signature: {
    ...dgcSignature
  },
  util: {
    ...dgcUtil
  }
}
