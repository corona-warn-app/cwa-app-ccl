import Chance from 'chance'
import moment from 'moment'

export default seed => {
  const chance = seed ? new Chance(seed) : new Chance()

  chance.mixin({
    dob: () => {
      const age = chance.age({ type: 'adult' })
      const currentYear = 2021
      const min = moment().year(currentYear).subtract({ years: age + 1 }).startOf('year').toDate()
      const max = moment().year(currentYear).subtract({ years: age }).endOf('year').toDate()
      return chance.date({ min, max })
    },
    dobStr: () => {
      return moment(chance.dob()).format('YYYY-MM-DD')
    },
    twoCharacters: (options = {}) => {
      return chance.character(options) + chance.character(options)
    }
  })

  return chance
}
