'use strict'

const fse = require('fs-extra')
const path = require('path')
const yaml = require('js-yaml')

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

module.exports = {
  readAllDccSeriesSync
}
