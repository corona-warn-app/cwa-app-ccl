import fse from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const rootDirectoryPath = path.resolve(__dirname, './../../')
const resolve = relativeFilepath => path.resolve(rootDirectoryPath, relativeFilepath)

export const readJson = relativeFilepath => fse.readJson(resolve(relativeFilepath))
export const readJsonSync = relativeFilepath => fse.readJsonSync(resolve(relativeFilepath))
