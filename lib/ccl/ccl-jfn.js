'use strict'

const jfn = require('./../jfn/jfn-main')

const functions = [
  require('./functions/__analyzeDccWallet'),
  require('./functions/__filterCertificatesByType'),
  require('./functions/__i18n.getQuantityDescriptor'),
  require('./functions/__i18n.getTextDescriptor'),
  require('./functions/__i18n.getTextBundle'),
  require('./functions/__sortCertificatesByDate'),
  require('./functions/__sortTestCertificatesByDate'),
  require('./functions/__sortVaccinationCertificatesByDate'),
  require('./functions/__toCertificateReference'),
  require('./functions/getDccWalletInfo'),
  require('./functions/getVaccinationStateSubtitleText'),
  require('./functions/getVaccinationStateLongText')
]

functions.forEach(it => {
  const { name, definition } = it.getDescriptor()
  jfn.addFunction(name, definition)
})

const evaluateFunction = (name, parameters) => {
  return jfn.evaluateFunction(name, parameters)
}

module.exports = {
  evaluateFunction,
  getFunctionDescriptors: () => [...functions]
}
