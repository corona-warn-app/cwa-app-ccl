'use strict'

const assert = require('assert')
const base45 = require('base45')
const cbor = require('cbor')
const zlib = require('pako')

const coseBufferFromBase45 = base45Str => {
  assert.strictEqual(typeof base45Str, 'string', 'base45Str must be a string')
  const bufferFromBase45 = base45.decode(base45Str)
  const uint8ArrayFromZip = zlib.inflate(bufferFromBase45)
  const coseBuffer = Buffer.from(uint8ArrayFromZip)
  return coseBuffer
}

const base45FromBarcodeData = barcodeData => {
  assert.strictEqual(typeof barcodeData, 'string', 'barcodeData must be a string')
  assert.ok(barcodeData.startsWith('HC1:'), 'barcodeData must start with `HC1:`, got ' + barcodeData)
  const base45Str = barcodeData.substr(4)
  return base45Str
}

const coseFromCoseBuffer = coseBuffer => {
  assert.ok(Buffer.isBuffer(coseBuffer), 'coseBuffer must be a buffer')
  const obj = cbor.decode(coseBuffer)
  const tag = obj.tag ? obj.tag : undefined
  const value = obj.value ? obj.value : obj
  if (tag) {
    assert.strictEqual(tag, 18, 'COSE tag must have value 18')
  }
  assert.ok(Array.isArray(value), `COSE value must be an array: ${typeof value};${Array.isArray(value)}`)
  const [p, u, plaintext, signers] = value
  return { p, u, plaintext, signers }
}

const cwtFromCwtBuffer = cwtBuffer => {
  const data = cbor.decode(cwtBuffer)
  if (data instanceof cbor.Tagged) {
    if (data.tag === 18) {
      assert.fail('COSE payload must be a CWT but got another COSE object. This typically happens if a lab/PoC encrypted and uploaded the entire COSE object instead of just the COSE payload')
    } else {
      assert.fail('COSE payload must be a CWT but got some unknown CBOR tagged object')
    }
  }
  assert.ok(data instanceof cbor.Map || data instanceof Map, 'cwt must be a CBOR Map')
  const iss = data.get(1)
  const exp = data.get(4)
  const iat = data.get(6)
  const hcert = data.get(-260)
  const dgc = hcert.get(1)
  return { iss, iat, exp, hcert, dgc }
}

const cwtFromCoseBuffer = coseBuffer => {
  const { plaintext: cwtBuffer, p, u } = coseFromCoseBuffer(coseBuffer)
  return {
    ...cwtFromCwtBuffer(cwtBuffer),
    coseProtectedHeader: cbor.decode(p),
    coseUnprotectedHeader: u
  }
}

const fromBarcodeData = barcodeData => {
  const base45Str = base45FromBarcodeData(barcodeData)
  const coseBuffer = coseBufferFromBase45(base45Str)
  return fromCoseBuffer(coseBuffer)
}

const fromCoseBuffer = coseBuffer => {
  const cwt = cwtFromCoseBuffer(coseBuffer)
  return { ...cwt, cose: coseBuffer }
}

module.exports = {
  fromBarcodeData
}
