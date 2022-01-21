import moment from 'moment'
import transliteration from 'transliteration'
import chanceFactory from '../chance.js'

const VC_MP_JOHNSON_JOHNSON = 'EU/1/20/1525'
const VC_MP_ASTRA = 'EU/1/21/1529'
const VC_MP_BIONTECH = 'EU/1/20/1528'
const VC_MP_MODERNA = 'EU/1/20/1507'

const transliterate = str => transliteration.transliterate(str)
  .toUpperCase()
  .replace(/'/g, '')
  .replace(/-/g, '<')
  .replace(/ /g, '<')

const generateCi = ({ chance } = {}) => {
  chance = chance || chanceFactory()
  const ci = `01DE/00000/1119349007/${chance.string({ length: 25, alpha: true, numeric: true, casing: 'upper' })}`
  return ci
}

const generateVaccinationCertificate = ({ seed, piiSeed } = {}) => {
  seed = seed || parseInt(Math.random() * 10000)
  piiSeed = piiSeed || seed
  const chance = chanceFactory(seed)
  const piiChance = chanceFactory(piiSeed)
  const ver = '1.0.0'
  const gn = piiChance.first()
  const fn = piiChance.last()
  const gnt = transliterate(gn)
  const fnt = transliterate(fn)
  const dob = piiChance.dobStr()
  const tg = '840539006'
  const vp = chance.pickone(['1119349007', '1119305005', 'J07BX03'])
  const mp = chance.pickone(['EU/1/20/1528', 'EU/1/20/1507', 'EU/1/21/1529', 'EU/1/20/1525', 'CVnCoV', 'Sputnik-V', 'Convidecia', 'EpiVacCorona', 'BBIBP-CorV', 'Inactivated-SARS-CoV-2-Vero-Cell', 'CoronaVac', 'Covaxin'])
  const ma = chance.pickone(['ORG-100001699', 'ORG-100030215', 'ORG-100001417', 'ORG-100031184', 'ORG-100006270', 'ORG-100013793', 'ORG-100020693', 'ORG-100010771', 'ORG-100024420', 'ORG-100032020', 'Gamaleya-Research-Institute', 'Vector-Institute', 'Sinovac-Biotech', 'Bharat-Biotech'])
  const { dn, sd } = chance.pickone(mp === VC_MP_JOHNSON_JOHNSON
    ? [{ dn: 1, sd: 1 }]
    : [VC_MP_ASTRA, VC_MP_BIONTECH, VC_MP_MODERNA].includes(mp)
        ? [{ dn: 1, sd: 2 }, { dn: 2, sd: 2 }]
        : [{ dn: 1, sd: 2 }, { dn: 2, sd: 2 }])
  const dt = moment().subtract(chance.integer({ min: 2, max: 30 }), 'days').format('YYYY-MM-DD')
  const co = 'DE'
  const is = 'Robert Koch-Institut'
  const ci = generateCi({ chance })

  const dcc = {
    ver,
    nam: {
      gn, fn, gnt, fnt
    },
    dob,
    v: [{
      tg,
      vp,
      mp,
      ma,
      dn,
      sd,
      dt,
      co,
      is,
      ci
    }]
  }
  return dcc
}

const generateTestCertificate = ({ seed, now = moment(), piiSeed } = {}) => {
  seed = seed || parseInt(Math.random() * 10000)
  piiSeed = piiSeed || seed
  const chance = chanceFactory(seed)
  const piiChance = chanceFactory(piiSeed)
  const ver = '1.0.0'
  const gn = piiChance.first()
  const fn = piiChance.last()
  const gnt = transliterate(gn)
  const fnt = transliterate(fn)
  const dob = piiChance.dobStr()
  const tg = '840539006'
  const tt = chance.pickone(['LP6464-4', 'LP217198-3'])
  const nm = chance.string({ length: 25, alpha: true, numeric: true, casing: 'upper' })
  const ma = chance.pickone(['1232', '1304', '1065', '1331', '1484', '1242', '1223', '1173', '1244'])
  const tr = chance.pickone(['260415000'])
  const tc = chance.pickone(['Test Centre 1', 'Test Facility 2', 'General Practitioner 3'])
  const co = 'DE'
  const is = 'Robert Koch-Institut'
  const ci = generateCi({ chance })
  const sc = moment(now).subtract(chance.natural({ min: 10, max: 2160 }), 'minutes').millisecond(0).toISOString(true).replace('.000', '')
  const dr = moment(now).millisecond(0).toISOString(true).replace('.000', '')

  const dcc = {
    ver,
    nam: {
      gn, fn, gnt, fnt
    },
    dob,
    t: [{
      tg,
      tt,
      nm,
      ma,
      sc,
      dr,
      tr,
      tc,
      co,
      is,
      ci
    }]
  }
  return dcc
}

const generateRecoveryCertificate = ({ seed, now = moment(), piiSeed } = {}) => {
  seed = seed || parseInt(Math.random() * 10000)
  piiSeed = piiSeed || seed
  const chance = chanceFactory(seed)
  const piiChance = chanceFactory(piiSeed)
  const ver = '1.0.0'
  const gn = piiChance.first()
  const fn = piiChance.last()
  const gnt = transliterate(gn)
  const fnt = transliterate(fn)
  const dob = piiChance.dobStr()
  const tg = '840539006'
  const _fr = moment(now).subtract(chance.integer({ min: 15, max: 30 }), 'days')
  const fr = _fr.format('YYYY-MM-DD')
  const co = 'DE'
  const is = 'Robert Koch-Institut'
  const df = moment(_fr).add(28, 'days').format('YYYY-MM-DD')
  const du = moment(_fr).add(180, 'days').format('YYYY-MM-DD')
  const ci = generateCi({ chance })

  const dcc = {
    ver,
    nam: {
      gn, fn, gnt, fnt
    },
    dob,
    r: [{
      tg,
      fr,
      co,
      is,
      df,
      du,
      ci
    }]
  }
  return dcc
}

export default {
  generateTestCertificate,
  generateVaccinationCertificate,
  generateRecoveryCertificate,
  transliterate
}
