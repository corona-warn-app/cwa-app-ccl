'use strict'

module.exports = (jfn, values, data) => {
  const uvci = jfn.apply(values[0], data)
  const index = jfn.apply(values[1], data)
  const optionalPrefix = 'URN:UVCI:'

  if (uvci === null || index < 0) {
    return null
  }

  const prefixlessUvci = uvci.startsWith(optionalPrefix) ? uvci.substring(optionalPrefix.length) : uvci
  const fragments = prefixlessUvci.split(/[/#:]/)
  return index < fragments.length ? fragments[index] : null
}
