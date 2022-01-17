'use strict'

const getKID = (protectedHeader, unprotectedHeader) => {
  const fallback = new Map().set(4, null)
  return [protectedHeader, unprotectedHeader, fallback]
    .find(it => it.has && it.has(4))
    .get(4)
}

module.exports = {
  getKID
}
