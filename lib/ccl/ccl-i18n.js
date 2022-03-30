import fse from 'fs-extra'
import path from 'path'
import util from 'util'
import { Validator } from 'jsonschema'
import { XMLParser } from 'fast-xml-parser'
import { readJsonSync } from './../util/local-file.js'

const internalI18nSchema = readJsonSync('lib/ccl/ccl-i18n-internal-schema.json')
const i18nDirectoryPattern = /^([a-z]{2})$/
const xmlCommentPropName = '__comment'

const mapXmlTreeToSchema = it => {
  // fix for empty tags which should be empty strings (e.g. <TagName />)
  it.string = Array.isArray(it.string) && it.string.length === 0 ? '' : it.string

  const tag = Object.keys(it)[0]
  const valueArrOrStr = it[tag]
  const valueObj = Array.isArray(valueArrOrStr)
    ? (valueArrOrStr.length === 1 ? valueArrOrStr[0] : valueArrOrStr.map(mapXmlTreeToSchema))
    : valueArrOrStr
  const value = valueObj['#text'] || valueObj
  const attributes = it[':@'] || {}

  return { tag, value, attributes }
}

const validateInternalSchemaAndThrowOnError = entries => {
  const validator = new Validator()
  const {
    errors: jsonSchemaErrors
  } = validator.validate(entries, internalI18nSchema)
  if (jsonSchemaErrors.length !== 0) {
    const err = new Error('Unexpected schema errors')
    err.errors = jsonSchemaErrors
    throw err
  }
}

const mapEntryToTextDescriptor = languageCode => (it, idx, arr) => {
  if (it.tag === xmlCommentPropName) return it

  const commentEntry = arr[idx - 1]
  if (commentEntry?.tag !== xmlCommentPropName) {
    throw new Error(util.format('No comment found for %j', it))
  }

  const name = it.attributes.name
  const descriptor = {
    name
  }
  if (it.tag === 'string') {
    descriptor.type = 'string'
    descriptor.localizedText = {
      [languageCode]: it.value
        .replace(/(^"|"$)/g, '')
        .replace(/\\n/g, '\n')
    }
  } if (it.tag === 'plurals') {
    descriptor.type = 'plural'
    descriptor.localizedText = {
      [languageCode]: it.value.reduce((map, it) => {
        map[it.attributes.quantity] = it.value
          .replace(/(^"|"$)/g, '')
          .replace(/\\n/g, '\n')
        return map
      }, {})
    }
  }
  return {
    descriptor
  }
}

const sortByName = (a, b) => a.name < b.name ? -1 : 1

const getTextDescriptorsFromXml = (xmlData, languageCode) => {
  const xmlParser = new XMLParser({
    ignoreAttributes: false,
    commentPropName: xmlCommentPropName,
    attributeNamePrefix: '',
    preserveOrder: true
  })

  const xmlTree = xmlParser.parse(xmlData)
  const entries = xmlTree[1]
    .resources.map(mapXmlTreeToSchema)

  validateInternalSchemaAndThrowOnError(entries)

  const textDescriptors = entries
    .map(mapEntryToTextDescriptor(languageCode))
    .filter(it => it.tag !== xmlCommentPropName)

  return textDescriptors
}

export const readTextDescriptorsFromDirectory = directoryPath => {
  const allEntries = fse.readdirSync(directoryPath, { withFileTypes: true })
  const relevantDirectories = allEntries
    .filter(it => it.isDirectory())
    .filter(it => i18nDirectoryPattern.test(it.name))
    .map(it => it.name)

  const textDescriptorsByFile = relevantDirectories.map(directoryName => {
    const [, languageCode] = i18nDirectoryPattern.exec(directoryName)
    const filepath = path.resolve(directoryPath, directoryName, 'strings.xml')
    const xmlData = fse.readFileSync(filepath, 'utf-8')
    return getTextDescriptorsFromXml(xmlData, languageCode)
  })

  const allTextDescriptors = textDescriptorsByFile
    .reduce((allTextDescriptors, textDescriptors) => {
      return textDescriptors.reduce((allTextDescriptors, { descriptor }) => {
        const existingDescriptor = allTextDescriptors.find(it => it.name === descriptor.name)

        if (!existingDescriptor) {
          allTextDescriptors.push({ ...descriptor })
        } else if (existingDescriptor.type !== descriptor.type) {
          throw new Error(`Conflicting text descriptor types for ${descriptor.name}`)
        } else if (descriptor.type === 'string') {
          existingDescriptor.localizedText = {
            ...existingDescriptor.localizedText,
            ...descriptor.localizedText
          }
        } else if (descriptor.type === 'plural') {
          existingDescriptor.localizedText = {
            ...existingDescriptor.localizedText,
            ...descriptor.localizedText
          }
        }

        return allTextDescriptors
      }, allTextDescriptors)
    }, [])
    .sort(sortByName)

  return allTextDescriptors
}
