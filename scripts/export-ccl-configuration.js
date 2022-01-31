import async from 'async'
import chalk from 'chalk'
import cbor from 'cbor'
import fse from 'fs-extra'
import path from 'path'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import ccl from './../lib/ccl/index.js'

const argv = yargs(hideBin(process.argv))
  .option('target', {
    alias: 't',
    string: true,
    default: 'dist'
  })
  .option('cbor-filename', {
    default: 'ccl-configuration.bin'
  })
  .option('json-filename', {
    default: 'ccl-configuration.json'
  })
  .argv

const main = async () => {
  const allDescriptors = ccl.getFunctionDescriptors()

  const cclConfiguration = {
    Identifier: 'CCL-DE-0001',
    Type: 'CCLConfiguration',
    Country: 'DE',
    Version: '1.0.0',
    SchemaVersion: '1.0.0',
    Engine: 'JsonFunctions',
    EngineVersion: '1.0.0',
    ValidFrom: '2022-01-01T00:00:00Z',
    ValidTo: '2030-12-31T00:00:00Z',
    Logic: {
      JfnDescriptors: allDescriptors
    }
  }
  const cclConfigurations = [
    cclConfiguration
  ]

  if (argv.jsonFilename) {
    const filepath = path.join(argv.target, argv.jsonFilename)
    const targetFilepath = path.resolve(process.cwd(), filepath)
    await fse.ensureFile(targetFilepath)
    await fse.writeJSON(targetFilepath, cclConfigurations)
    console.log(`Created JSON target ${chalk.cyan(filepath)}`)
  }

  if (argv.target) {
    await async.forEach(cclConfigurations, async config => {
      const filename = `${config.Identifier.toLowerCase()}.json`
      const target = path.join(argv.target, filename)
      const targetFilepath = path.resolve(process.cwd(), target)
      await fse.ensureFile(targetFilepath)
      await fse.writeJSON(targetFilepath, config)
      console.log(`Created JSON rule target ${chalk.cyan(target)}`)
    })
  }

  if (argv.cborFilename) {
    const asBuffer = await cbor.encodeAsync(cclConfigurations)

    const filepath = path.join(argv.target, argv.cborFilename)
    const targetFilepath = path.resolve(process.cwd(), filepath)
    await fse.ensureFile(targetFilepath)
    await fse.writeFile(targetFilepath, asBuffer)
    console.log(`Created CBOR target ${chalk.cyan(filepath)}`)
  }
}

main()
  .then(() => console.log('Done.'))
  .catch(err => console.log('Error:', err))
