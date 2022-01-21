export default (jfn, values, data) => {
  const filtered = jfn.apply({ filter: values }, data)
  return filtered.length === 0
}
