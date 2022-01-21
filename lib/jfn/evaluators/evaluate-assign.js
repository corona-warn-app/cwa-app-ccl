export default (jfn, values, data) => {
  const identifier = jfn.apply(values[0], data)
  const value = jfn.apply(values[1], data)

  const type = typeof identifier
  if (type !== 'string') throw new Error(`First parameter of assign must be a string, got ${type}`)

  const identifierChunks = identifier.split('.')
  const propertyName = identifierChunks.pop()
  data = identifierChunks.reduce((data, chunk) => {
    return data[chunk]
  }, data)

  data[propertyName] = value

  return null
}
