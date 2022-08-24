import jfn from './../jfn/jfn-main.js'

import __analyzeDccWallet from './functions/__analyzeDccWallet.js'
import __determineCertificateReissuanceForRenew from './functions/__determineCertificateReissuanceForRenew.js'
import __determineCertificateReissuanceForExtend from './functions/__determineCertificateReissuanceForExtend.js'
import __determineDccWalletInfoValidUntil from './functions/__determineDccWalletInfoValidUntil.js'
import __evaluateBoosterNotificationRules from './functions/__evaluateBoosterNotificationRules.js'
import __evaluateInvalidationRules from './functions/__evaluateInvalidationRules.js'
import __filterCertificatesByType from './functions/__filterCertificatesByType.js'
import __holderEquals from './functions/__holder.equals.js'
import __holderGetNameComponents from './functions/__holder.getNameComponents.js'
import __i18nGetQuantityDescriptor from './functions/__i18n.getQuantityDescriptor.js'
import __i18nGetTextDescriptor from './functions/__i18n.getTextDescriptor.js'
import __i18nGetTextBundle from './functions/__i18n.getTextBundle.js'
import __intersectArrays from './functions/__intersectArrays.js'
import __sortCertificatesByDate from './functions/__sortCertificatesByDate.js'
import __sortRecoveryCertificatesByDate from './functions/__sortRecoveryCertificatesByDate.js'
import __sortTestCertificatesByDate from './functions/__sortTestCertificatesByDate.js'
import __sortVaccinationCertificatesByDate from './functions/__sortVaccinationCertificatesByDate.js'
import __toCertificateReference from './functions/__toCertificateReference.js'
import getDccAdmissionCheckScenarios from './functions/getDccAdmissionCheckScenarios.js'
import getDccWalletInfo from './functions/getDccWalletInfo.js'
import getVaccinationStateSubtitleText from './functions/getVaccinationStateSubtitleText.js'
import getVaccinationStateLongText from './functions/getVaccinationStateLongText.js'
import getVaccinationStateLongTextV2 from './functions/getVaccinationStateLongTextV2.js'

const functions = [
  __analyzeDccWallet,
  __determineCertificateReissuanceForRenew,
  __determineCertificateReissuanceForExtend,
  __determineDccWalletInfoValidUntil,
  __evaluateBoosterNotificationRules,
  __evaluateInvalidationRules,
  __filterCertificatesByType,
  __holderEquals,
  __holderGetNameComponents,
  __i18nGetQuantityDescriptor,
  __i18nGetTextDescriptor,
  __i18nGetTextBundle,
  __intersectArrays,
  __sortCertificatesByDate,
  __sortRecoveryCertificatesByDate,
  __sortTestCertificatesByDate,
  __sortVaccinationCertificatesByDate,
  __toCertificateReference,
  getDccAdmissionCheckScenarios,
  getDccWalletInfo,
  getVaccinationStateSubtitleText,
  getVaccinationStateLongText,
  getVaccinationStateLongTextV2
]

functions.forEach(it => {
  const { name, definition } = it.getDescriptor()
  jfn.addFunction(name, definition)
})

export const evaluateFunction = (name, parameters) => {
  return jfn.evaluateFunction(name, parameters)
}

export const getFunctionDescriptors = () => [...functions].map(it => it.getDescriptor())
