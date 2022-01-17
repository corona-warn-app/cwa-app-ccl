'use strict'

const assert = require('assert')
const base45 = require('base45')
const zlib = require('pako')

const toBarcodeData = coseBuffer => {
  assert.ok(Buffer.isBuffer(coseBuffer), 'coseBuffer must be a buffer')
  const uint8ArrayFromCose = zlib.deflate(coseBuffer)
  const base45Str = base45.encode(uint8ArrayFromCose)
  const barcodeData = `HC1:${base45Str}`
  return barcodeData
}

module.exports = {
  toBarcodeData
}
