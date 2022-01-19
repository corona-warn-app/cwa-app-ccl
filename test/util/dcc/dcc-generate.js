'use strict'

const jp = require('jsonpath')
const moment = require('moment')

const dccData = require('./dcc-data')
const dccDsc = require('./dcc-dsc')
const dccEncode = require('./dcc-encode')
const dccSignature = require('./dcc-signature')

const parseRelativeDateStr = str => {
  if (!str) return [0, 'seconds']

  const amount = parseInt(str)
  const amountStr = `${amount}`
  const unit = str.substr(amountStr.length)
    .replace(/-/g, '')

  return [amount, unit]
}

const isRelativeDateStr = str => {
  const pattern = /^-?\d+\w+$/
  return pattern.test(str)
}

const deriveMomentOrDefault = (str, defaultMoment = moment()) => {
  const dropMs = m => moment.unix(m.unix())
  if (!str) return dropMs(defaultMoment)

  if (isRelativeDateStr(str)) {
    return dropMs(moment().add(...parseRelativeDateStr(str)))
  } else {
    return moment(str)
  }
}

const isIntegerAttribute = pathExpression => {
  return pathExpression.endsWith('.dn') || // vc
    pathExpression.endsWith('.sd') // vc
}

const isDateAttribute = pathExpression => {
  return pathExpression.endsWith('.dt') || // vc
    pathExpression.endsWith('.fr') || // rc
    pathExpression.endsWith('.df') || // rc
    pathExpression.endsWith('.du') // rc
}

const isDateTimeAttribute = pathExpression => {
  return pathExpression.endsWith('sc') // tc
}

const generate = async ({
  // base64-encoded string
  // optional
  coseKid,
  coseKidProtect = false,
  cwtIss = 'DE',
  // a value for a moment constructor
  // or a relative date string such as
  // 5days, -2hours, 2years, etc.
  // optional
  cwtIat,
  // same as cwtIat
  // optional
  cwtExp,
  // vc, tc, or rc
  dccType,
  // optional
  dccSeed,
  // optional
  dccPiiSeed,
  // optional
  dccOverwrites = [],
  now = moment()
}) => {
  if (!['vc', 'tc', 'rc'].includes(dccType)) {
    throw new Error(`Invalid DCC type ${dccType}`)
  }

  dccSeed = dccSeed || parseInt(Math.random() * 10000)
  dccPiiSeed = dccPiiSeed || dccSeed
  now = moment(now)

  const dccGeneratorFunction = dccType === 'vc'
    ? 'generateVaccinationCertificate'
    : dccType === 'tc'
      ? 'generateTestCertificate'
      : 'generateRecoveryCertificate'
  const dcc = dccData[dccGeneratorFunction]({ seed: dccSeed, now, piiSeed: dccPiiSeed })

  if (Array.isArray(dccOverwrites) && dccOverwrites.length > 0) {
    // log.info('Applying attribute overwrites')
    dccOverwrites.forEach(param => {
      const [partialPath, _newValue] = param.split('=')
      const pathExpression = `$..${partialPath}`
      if (_newValue === undefined) {
        const pathComponents = jp.parse(pathExpression)
        const leafComponent = pathComponents.pop()
        const parentPathExpression = jp.stringify(pathComponents)
        jp.apply(dcc, parentPathExpression, node => {
          delete node[leafComponent.expression.value]
          return node
        })
      } else {
        const newValue = _newValue === 'null'
          ? null
          : isIntegerAttribute(pathExpression) && `${parseInt(_newValue)}` === _newValue
            ? parseInt(_newValue, 10)
            : isDateAttribute(pathExpression) && isRelativeDateStr(_newValue)
              ? deriveMomentOrDefault(_newValue).format('YYYY-MM-DD')
              : isDateTimeAttribute(pathExpression) && isRelativeDateStr(_newValue)
                ? deriveMomentOrDefault(_newValue).millisecond(0).toISOString(true).replace('.000', '')
                : _newValue
        jp.value(dcc, pathExpression, newValue)
      }
    })
  }

  const _iat = deriveMomentOrDefault(cwtIat)
  const iat = _iat.valueOf() / 1000
  const _exp = deriveMomentOrDefault(cwtExp, moment(_iat).add(1, 'year'))
  const exp = _exp.valueOf() / 1000
  const dsc = dccDsc.load()

  const coseBuffer = await dccSignature.sign({
    dcc: dcc,
    iss: cwtIss,
    iat,
    exp,
    signer: dsc.signer,
    kid: coseKid !== undefined ? coseKid : dsc.kid,
    protectedKid: coseKidProtect,
    alg: dsc.alg
  })

  const barcodeData = dccEncode.toBarcodeData(coseBuffer)
  return {
    dcc,
    barcodeData
  }
}

module.exports = generate
