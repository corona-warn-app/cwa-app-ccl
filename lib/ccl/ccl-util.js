import moment from 'moment'
import printj from 'printj'

import { evaluateFunction } from './ccl-jfn.js'

const currentTimeZone = '+01:00' // should be derived from device time
const getFormatParameters = parameters => parameters.map(it => {
  if (it.type === 'localDate') {
    return moment.utc(it.value).utcOffset(currentTimeZone).format('DD.MM.YYYY')
  } else if (it.type === 'localDateTime') {
    return moment.utc(it.value).utcOffset(currentTimeZone).format('DD.MM.YYYY, HH:mm \\U\\h\\r')
  } else if (it.type === 'utcDate') {
    return moment.utc(it.value).utcOffset(0).format('DD.MM.YYYY')
  } else if (it.type === 'utcDateTime') {
    return moment.utc(it.value).utcOffset(0).format('DD.MM.YYYY, HH:mm \\U\\h\\r')
  }
  return it.value
})

export const formatText = (textDescriptor, languageCode, { now }) => {
  // console.log(textDescriptor, languageCode)
  if (textDescriptor.type === 'string') {
    const formatString = textDescriptor.localizedText[languageCode]
    const formatParameters = getFormatParameters(textDescriptor.parameters)
    return printj.sprintf(formatString, ...formatParameters)
  } else if (textDescriptor.type === 'plural') {
    const quantityStrings = textDescriptor.localizedText[languageCode]
    const formatParameters = getFormatParameters(textDescriptor.parameters)
    const quantity = textDescriptor.quantityParameterIndex >= 0
      ? formatParameters[textDescriptor.quantityParameterIndex]
      : textDescriptor.quantity
    const quantityKey = (() => {
      if (quantity === 0) return 'zero'
      if (quantity === 1) return 'one'
      if (quantity === 2) return 'two'
      return 'many'
    })()
    const formatString = quantityStrings[quantityKey]
    return printj.sprintf(formatString, ...formatParameters)
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

export const mapMomentToNow = mom => {
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
