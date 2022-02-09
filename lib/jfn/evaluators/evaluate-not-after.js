import moment from 'moment'

export default (jfn, values, data) => {
  const left = jfn.apply(values[0], data)
  const right = jfn.apply(values[1], data)
  const third = jfn.apply(values[2], data)

  if (typeof left !== 'string' || typeof right !== 'string') return true

  const l = moment.utc(left)
  const r = moment.utc(right)
  const t = moment.utc(third)
  if (third) {
    if (typeof third !== 'string') return true
    return !l.isAfter(r) && !r.isAfter(t)
  }
  return !l.isAfter(r)
}
