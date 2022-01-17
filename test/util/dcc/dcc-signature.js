'use strict'

const assert = require('assert')
const cbor = require('cbor')
const cose = require('cose-js')
const moment = require('moment')

const sign = async ({
  dcc,
  iss = 'DE',
  iat = moment().unix(),
  exp = moment().add(1, 'year').unix(),
  signer,
  kid = 'f1sfUVIx8CA=',
  alg = 'ES256',
  protectedKid = false
}) => {
  assert.strictEqual(typeof iat, 'number', 'iat must be a number')
  assert.strictEqual(typeof exp, 'number', 'exp must be a number')

  const hcert = new cbor.Map()
  hcert.set(1, dcc)
  const cwt = new cbor.Map()
  cwt.set(1, iss)
  cwt.set(4, exp)
  cwt.set(6, iat)
  cwt.set(-260, hcert)
  const payload = cbor.encode(cwt)

  const headers = {
    p: {
      alg
    },
    u: {}
  }
  if (kid) {
    if (protectedKid) headers.p.kid = Buffer.from(kid, 'base64')
    else headers.u.kid = Buffer.from(kid, 'base64')
  }

  const signedCoseBuffer = await cose.sign.create(headers, payload, signer)
  return signedCoseBuffer
}

module.exports = {
  sign
}
