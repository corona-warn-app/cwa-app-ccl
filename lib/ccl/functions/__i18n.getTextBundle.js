import path from 'path'
import { fileURLToPath } from 'url'
import {
  readTextDescriptorsFromDirectory
} from './../ccl-i18n.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const _getDescriptor = () => {
  const directoryPath = path.resolve(__dirname, './../../../resources/i18n')
  const textDescriptors = readTextDescriptorsFromDirectory(directoryPath)
  const descriptor = {
    name: '__i18n.getTextBundle',
    definition: {
      parameters: [
      ],
      logic: [
        {
          return: [
            textDescriptors
          ]
        }
      ]
    }
  }
  return descriptor
}

export default {
  getDescriptor: () => _getDescriptor(),
  toJSON: () => JSON.stringify(_getDescriptor())
}
