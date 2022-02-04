import moment from 'moment'

export default (jfn, values, data) => {
  const left = jfn.apply(values[0], data)
  const right = jfn.apply(values[1], data)

  if (typeof left !== 'string' || typeof right !== 'string') return true

  const l = moment.utc(left)
  const r = moment.utc(right)
  return !l.isBefore(r)
}
