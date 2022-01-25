export default (jfn, values, data) => {
  const scopedData = { ...data }
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
