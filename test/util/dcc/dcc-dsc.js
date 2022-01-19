'use strict'

const crypto = require('crypto')

const load = () => {
  const keyPair = crypto.generateKeyPairSync('ec', {
    namedCurve: 'P-256'
  })

  const signer = {
    key: keyPair.privateKey.export({
      format: 'jwk'
    })
  }
  const kid = 'cwafUVIx8CA=' // random made-up kid
  const alg = 'ES256'

  return { signer, kid, alg }
}

module.exports = {
  load
}
