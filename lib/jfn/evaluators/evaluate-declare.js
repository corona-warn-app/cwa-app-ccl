export default (jfn, values, data) => {
  const identifier = jfn.apply(values[0], data)
  const type = typeof identifier
  if (type !== 'string') throw new Error(`First parameter of declare must be a string, got ${type}`)

  const value = jfn.apply(values[1], data)
  data[identifier] = value
  return null
}
