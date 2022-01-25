import assert from 'assert'
import base45 from 'base45'
import zlib from 'pako'

const toBarcodeData = coseBuffer => {
  assert.ok(Buffer.isBuffer(coseBuffer), 'coseBuffer must be a buffer')
  const uint8ArrayFromCose = zlib.deflate(coseBuffer)
  const base45Str = base45.encode(uint8ArrayFromCose)
  const barcodeData = `HC1:${base45Str}`
  return barcodeData
}

export default {
  toBarcodeData
}
