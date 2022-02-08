import async from 'async'
import moment from 'moment'

import generate from './dcc-generate.js'

const vaccineShortNamesByMedicalProduct = {
  'EU/1/20/1525': ['jj', 'johnson', 'janssen'],
  'EU/1/21/1529': ['astrazeneca', 'astra'],
  'EU/1/20/1528': ['biontech'],
  'EU/1/20/1507': ['moderna'],
  'EU/1/21/1618': ['novavax', 'nova']
}
const vaccineMetadataByMedicalProduct = {
  'EU/1/20/1525': { ma: 'ORG-100001417', vp: '1119305005' },
  'EU/1/21/1529': { ma: 'ORG-100001699', vp: '1119305005' },
  'EU/1/20/1528': { ma: 'ORG-100030215', vp: '1119349007' },
  'EU/1/20/1507': { ma: 'ORG-100031184', vp: '1119349007' },
  'EU/1/21/1618': { ma: 'ORG-100032020', vp: '1119305005' /* tbd */ }
}
const vaccineShortNames = Object.entries(vaccineShortNamesByMedicalProduct)
  .reduce((vaccineShortNames, [mp, shortNames]) => {
    return shortNames.reduce((vaccineShortNames, shortName) => {
      vaccineShortNames.push({ mp, shortName })
      return vaccineShortNames
    }, vaccineShortNames)
  }, [])

const resolveTimeRef = (timeRef, series, t0) => {
  timeRef = timeRef.trim()
  if (timeRef === 't0') {
    return t0.clone()
  } else if (/^\d{4}-\d{2}-\d{2}/.test(timeRef)) {
    return moment.utc(timeRef)
  } else if (/^t\d+$/.test(timeRef)) {
    const indexStr = timeRef.replace('t', '')
    const index = parseInt(indexStr)
    const anchor = resolveTime(series[index].time, index, series, t0)
    return anchor.clone()
  } else {
    const index = series.findIndex(it => {
      return it.vc === timeRef ||
        it.rc === timeRef ||
        it.tc === timeRef
    })
    if (index === -1) throw new Error(`Cannot resolve time reference '${timeRef}'`)
    const match = series[index]
    const anchor = resolveTime(match.time, index, series, t0)
    return anchor.clone()
  }
}

const durationPattern = /^P(?!$)(\d+Y)?(\d+M)?(\d+W)?(\d+D)?(T(?=\d+[HMS])(\d+H)?(\d+M)?(\d+S)?)?$/
const resolveTime = (time, idx, series, t0) => {
  if (time instanceof Date) {
    return moment.utc(time)
  } else if (moment.isMoment(time)) {
    return moment.utc(time)
  }

  const [timeRef, ...durationChunks] = time.split('+')
  const duration = durationChunks.join('+')
  if (duration && !durationPattern.test(duration)) {
    throw new Error(`Duration '${duration} not valid'`)
  }
  const anchor = resolveTimeRef(timeRef || `t${idx - 1}`, series, t0)
  return anchor.clone().add(duration)
}

const parseSeriesEntry = (it, time) => {
  if (it.vc) return parseSeriesEntryAsVC(it.vc, time)
  if (it.rc) return parseSeriesEntryAsRC(it.rc, time)
  if (it.tc) return parseSeriesEntryAsTC(it.tc, time)
  else throw new Error(`Unsupported series entry: ${JSON.stringify(it)}`)
}

const parseSeriesEntryAsVC = (dccShortDescriptor, time) => {
  const vaccine = vaccineShortNames
    .find(it => dccShortDescriptor.startsWith(it.shortName))
  if (vaccine) {
    const seriesStr = dccShortDescriptor.replace(vaccine.shortName, '')
    const [dnStr, sdStr] = seriesStr.split('/')
    const dn = parseInt(dnStr)
    const sd = parseInt(sdStr)
    const { ma, vp } = vaccineMetadataByMedicalProduct[vaccine.mp]
    return {
      dccType: 'vc',
      dccOverwrites: [
        `v.0.ma=${ma}`,
        `v.0.mp=${vaccine.mp}`,
        `v.0.vp=${vp}`,
        `v.0.dn=${dn}`,
        `v.0.sd=${sd}`,
        `v.0.dt=${time.format('YYYY-MM-DD')}`
      ]
    }
  }
  throw new Error(`Unsupported descriptor: ${dccShortDescriptor}`)
}
const parseSeriesEntryAsRC = (dccShortDescriptor, time) => {
  const df = moment(time).add(28, 'days')
  const du = moment(time).add(180, 'days')
  return {
    dccType: 'rc',
    dccOverwrites: [
      `r.0.fr=${time.format('YYYY-MM-DD')}`,
      `r.0.df=${df.format('YYYY-MM-DD')}`,
      `r.0.du=${du.format('YYYY-MM-DD')}`
    ]
  }
}

const parseSeriesEntryAsTC = (dccShortDescriptor, time) => {
  if (!/^[pcr|rat]/.test(dccShortDescriptor)) throw new Error(`Unknown test type: ${dccShortDescriptor}`)
  const sc = moment(time)
  const tt = dccShortDescriptor.startsWith('pcr')
    ? 'LP6464-4'
    : 'LP217198-3'
  return {
    dccType: 'tc',
    dccOverwrites: [
      `t.0.tt=${tt}`,
      `t.0.sc=${sc.millisecond(0).toISOString(true).replace('.000', '')}`
    ]
  }
}

const parseSeries = async ({ series, defaultDccDescriptor, t0 }) => {
  defaultDccDescriptor = defaultDccDescriptor || {}
  defaultDccDescriptor.dccOverwrites = defaultDccDescriptor.dccOverwrites || []
  defaultDccDescriptor.dccPiiSeed = defaultDccDescriptor.dccPiiSeed || '42'
  const dccDescriptors = await async.mapSeries(series, async it => {
    const idx = series.indexOf(it)
    const time = resolveTime(it.time, idx, series, t0)
    const dccDescriptor = it.dccDescriptor || {}
    const partialDccDescriptor = parseSeriesEntry(it, time)
    partialDccDescriptor.dccOverwrites = partialDccDescriptor.dccOverwrites || []
    partialDccDescriptor.cwtIat = it.cwtIat
      ? resolveTime(it.cwtIat, idx, series, t0)
      : time
    const mergedDccDescriptor = {
      ...defaultDccDescriptor,
      ...partialDccDescriptor,
      ...dccDescriptor,
      dccOverwrites: [
        ...defaultDccDescriptor.dccOverwrites,
        ...partialDccDescriptor.dccOverwrites,
        ...(dccDescriptor.dccOverwrites || [])
      ]
    }
    const {
      dcc,
      barcodeData
    } = await generate(mergedDccDescriptor)
    return {
      ...it,
      time,
      dccDescriptor: mergedDccDescriptor,
      dcc,
      barcodeData,
      validityState: it.validityState || 'VALID'
    }
  })
  return dccDescriptors
}

const parseSeriesDescriptor = async ({ seriesDescriptor }) => {
  const t0 = moment.utc(seriesDescriptor.t0)
  const defaultDccDescriptor = {
    ...(seriesDescriptor.defaultDccDescriptor || {}),
    dccPiiSeed: seriesDescriptor.description || seriesDescriptor.name
  }
  const series = await parseSeries({
    series: seriesDescriptor.series,
    t0,
    defaultDccDescriptor
  })

  const resolveCertNameToBarcodeData = certName => {
    const certificate = series
      .find(it => {
        return it.vc === certName ||
          it.rc === certName ||
          it.tc === certName
      })
    if (!certificate) return null
    return certificate.barcodeData
  }

  const resolveBarcodeDataToCertName = barcodeData => {
    const certificate = series.find(it => {
      return it.barcodeData === barcodeData
    })
    if (!certificate) return null
    return certificate.vc ||
      certificate.rc ||
      certificate.tc
  }

  const parseSeriesTestCase = testCase => {
    const timeUnderTest = resolveTime(testCase.time, -1, series, t0)
    const seriesUnderTest = series
      .filter(it => it.time.isSameOrBefore(timeUnderTest))
    return {
      ...testCase,
      timeUnderTest,
      seriesUnderTest
    }
  }

  const resolveSeriesTime = time => resolveTime(time, -1, series, t0)

  return {
    ...seriesDescriptor,
    t0,
    series,
    resolveCertNameToBarcodeData,
    resolveBarcodeDataToCertName,
    parseSeriesTestCase,
    resolveSeriesTime
  }
}

export default {
  resolveTime,
  parseSeries,
  parseSeriesDescriptor
}
