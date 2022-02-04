export default (jfn, values, data) => {
  // TODO: fix poor man's deep copy
  // required for iOS compatibility
  const scopedData = JSON.parse(JSON.stringify(data))
  try {
    values.forEach(value => {
      jfn.apply(value, scopedData)
    })
  } catch (err) {
    if (err.return === true) {
      return err.data
    }
    throw err
  }
  return null
}
