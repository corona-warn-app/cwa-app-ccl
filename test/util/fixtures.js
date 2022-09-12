import fse from 'fs-extra'
import path from 'path'
import yaml from 'js-yaml'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const bnrFilenamePattern = /^bnr.*\.json$/
const irFilenamePattern = /^ir.*\.json$/
const dccSeriesFilenamePattern = /^dcc-series.*\.yaml$/
const fixturesDirectoryPath = path.resolve(__dirname, './../fixtures')
const distDirectoryPath = path.resolve(__dirname, './../../dist')

const readAllAdmissionCheckScenariosSync = () => {
  const directoryPath = path.resolve(fixturesDirectoryPath, 'ccl')
  const filenames = ['ccl-admission-check-scenarios.yaml']

  const data = filenames.reduce((allData, filename) => {
    const filepath = path.resolve(directoryPath, filename)
    const dataStr = fse.readFileSync(filepath)
    const data = yaml.load(dataStr)
      .map(it => {
        return {
          ...it,
          filename
        }
      })
    allData.push(...data)
    return allData
  }, [])

  return data
}

const readAllDccSeriesSync = () => {
  const directoryPath = path.resolve(fixturesDirectoryPath, 'ccl')
  const filenames = fse.readdirSync(directoryPath)
    .filter(filename => dccSeriesFilenamePattern.test(filename))

  const series = filenames.reduce((allSeries, filename) => {
    const filepath = path.resolve(directoryPath, filename)
    const seriesStr = fse.readFileSync(filepath)
    const series = yaml.load(seriesStr)
      .map(it => {
        return {
          ...it,
          filename
        }
      })
    allSeries.push(...series)
    return allSeries
  }, [])

  return series
}

const readAllBoosterNotificationRulesSync = () => {
  const directoryPath = path.resolve(fixturesDirectoryPath, 'ccl')
  const filenames = fse.readdirSync(directoryPath)
    .filter(filename => bnrFilenamePattern.test(filename))

  const allRules = filenames.reduce((allRules, filename) => {
    const filepath = path.resolve(directoryPath, filename)
    const bnr = fse.readJSONSync(filepath)
    allRules.push(bnr)
    return allRules
  }, [])

  return allRules
}

const readAllInvalidationRulesSync = () => {
  const directoryPath = path.resolve(fixturesDirectoryPath, 'ccl')
  const filenames = fse.readdirSync(directoryPath)
    .filter(filename => irFilenamePattern.test(filename))

  const allRules = filenames.reduce((allRules, filename) => {
    const filepath = path.resolve(directoryPath, filename)
    const bnr = fse.readJSONSync(filepath)
    allRules.push(bnr)
    return allRules
  }, [])

  return allRules
}

export const dist = {
  findAllSync: pattern => {
    const relativeFilepaths = fse.readdirSync(distDirectoryPath)
      .filter(filename => pattern.test(filename))
      .map(filename => `dist/${filename}`)
    return relativeFilepaths
  }
}

export default {
  readAllAdmissionCheckScenariosSync,
  readAllDccSeriesSync,
  readAllBoosterNotificationRulesSync,
  readAllInvalidationRulesSync
}
