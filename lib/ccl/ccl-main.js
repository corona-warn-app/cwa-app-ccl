import async from 'async'
import fse from 'fs-extra'
import path from 'path'
import { Validator } from 'jsonschema'
import { fileURLToPath } from 'url'

import { evaluateFunction, getFunctionDescriptors } from './ccl-jfn.js'

import * as i18n from './ccl-i18n.js'
import * as util from './ccl-util.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const validateSchema = async (instance, $ref) => {
  const validator = new Validator()
  const relatedSchemes = [
    'ccl-commons.json',
    'ccl-configuration.json',
    'ccl-get-dcc-wallet-info.json',
    'dcc-validation-rule.json',
    'digital-covid-certificate-1.3.0.json',
    'jfn-function-descriptor.json'
  ]
  await async.forEach(relatedSchemes, async filename => {
    const filepath = path.resolve(__dirname, `./../../resources/json-schema/${filename}`)
    const schema = await fse.readJSON(filepath)
    validator.addSchema(schema)
  })

  const [schemaRef] = $ref.split('#')
  if (!validator.schemas[schemaRef]) {
    throw new Error(`Schema reference not found: ${schemaRef}`)
  }

  const schema = { $ref }
  const result = validator.validate(instance, schema)
  return result
}

export default {
  i18n,
  util,
  evaluateFunction,
  getFunctionDescriptors,
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
