'use strict'

const async = require('async')
const fse = require('fs-extra')
const jfn = require('./../jfn/jfn-main')
const path = require('path')
const { Validator } = require('jsonschema')

const functions = [
  require('./functions/__analyzeDccWallet'),
  require('./functions/__filterCertificatesByType'),
  require('./functions/__i18n.getText'),
  require('./functions/__i18n.getTextBundle'),
  require('./functions/__i18n.getTextByKey'),
  require('./functions/__sortCertificatesByDate'),
  require('./functions/__sortVaccinationCertificatesByDate'),
  require('./functions/__toCertificateReference'),
  require('./functions/getDccWalletInfo'),
  require('./functions/getVaccinationStateShortText')
]

functions.forEach(it => {
  const { name, definition } = it.getDescriptor()
  jfn.add_function(name, definition)
})

// let initialized = false
// const initJfn = () => {
//   if (initialized === true) return

//   initialized = true
// }

const evaluateFunction = (name, parameters) => {
  return jfn.evaluateFunction(name, parameters)
}

const validateSchema = async (instance, $ref) => {
  const validator = new Validator()
  const relatedSchemes = [
    'ccl-commons.json',
    'ccl-configuration.json',
    'ccl-get-dcc-wallet-info.json',
    'dcc-validation-rule.json',
    'digital-covid-certificate-1.3.0.json'
  ]
  await async.forEach(relatedSchemes, async filename => {
    const filepath = path.resolve(__dirname, `./../../resources/json-schema/${filename}`)
    const schema = await fse.readJSON(filepath)
    validator.addSchema(schema)
  })

  // console.log('all schemas', Object.keys(validator.schemas))

  const [schemaRef] = $ref.split('#')
  if (!validator.schemas[schemaRef]) {
    throw new Error(`Schema reference not found: ${schemaRef}`)
  }

  const schema = { $ref }
  const result = validator.validate(instance, schema)
  return result
}

module.exports = {
  evaluateFunction,
  getFunctionDescriptors: () => functions,
  api: {
    getDccWalletInfo: input => {
      return evaluateFunction('getDccWalletInfo', input)
    }
  },
  schema: {
    validate: validateSchema,
    common: {
      systemTimeDependentTextResolverInput: {
        validate: instance => validateSchema(instance, 'https://ccl.coronawarn.app/ccl-commons.json#/$defs/systemTimeDependentTextResolverInput')
      }
    },
    functions: {
      getDccWalletInfo: {
        input: {
          validate: instance => validateSchema(instance, 'https://ccl.coronawarn.app/functions/getDccWalletInfo#/$defs/input')
        },
        output: {
          validate: instance => validateSchema(instance, 'https://ccl.coronawarn.app/functions/getDccWalletInfo#/$defs/output')
        }
      },
      getVaccinationStateShortText: {
        input: {
          validate: instance => validateSchema(instance, 'https://ccl.coronawarn.app/functions/getDccWalletInfo#/$defs/vaccinationStateShortTextResolverInput')
        },
        output: {
          validate: instance => validateSchema(instance, 'https://ccl.coronawarn.app/functions/getDccWalletInfo#/$defs/vaccinationStateShortTextResolverOutput')
        }
      }
    }
  }
}
