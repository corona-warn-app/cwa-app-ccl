import fse from 'fs-extra'
import path from 'path'
import yaml from 'js-yaml'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dccSeriesFilenamePattern = /^dcc-series.*\.yaml$/
const fixturesDirectoryPath = path.resolve(__dirname, './../fixtures')

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

export default {
  readAllDccSeriesSync
}
