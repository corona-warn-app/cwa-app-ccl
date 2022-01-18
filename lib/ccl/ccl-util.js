'use strict'

const moment = require('moment')
const { sprintf } = require('printj')

const { evaluateFunction } = require('./ccl-jfn')

const formatText = (textDescriptor, languageCode, { now }) => {
  // console.log(textDescriptor, languageCode)
  if (textDescriptor.type === 'string') {
    const formatString = textDescriptor.localizedText[languageCode]
    return formatString
  } else if (textDescriptor.type === 'plural') {
    const quantityStrings = textDescriptor.localizedText[languageCode]
    const quantity = textDescriptor.quantity
    const quantityKey = (() => {
      if (quantity === 0) return 'zero'
      if (quantity === 1) return 'one'
      if (quantity === 2) return 'two'
      return 'many'
    })()
    const formatString = quantityStrings[quantityKey]
    const formatParameters = textDescriptor.parameters.map(it => {
      return it.value
    })
    return sprintf(formatString, formatParameters)
  } else if (textDescriptor.type === 'system-time-dependent') {
    const functionName = textDescriptor.functionName
    const functionParameters = {
      ...textDescriptor.parameters,
      now: mapMomentToNow(now)
    }
    const newTextDescriptor = evaluateFunction(functionName, functionParameters)
    return formatText(newTextDescriptor, languageCode, { now })
  } else {
    throw new Error(`Unknown text type ${textDescriptor.type}`)
  }
}

const mapMomentToNow = mom => {
  return {
    timestamp: moment(mom).unix(),
    localDate: moment(mom).format('YYYY-MM-DD'),
    localDateTime: moment(mom).toISOString(),
    localDateTimeMidnight: moment(mom).utc().startOf('day').toISOString(),
    utcDate: moment(mom).utc().format('YYYY-MM-DD'),
    utcDateTime: moment(mom).utc().toISOString(),
    utcDateTimeMidnight: moment(mom).utc().startOf('day').toISOString()
  }
}

module.exports = {
  formatText,
  mapMomentToNow
}
