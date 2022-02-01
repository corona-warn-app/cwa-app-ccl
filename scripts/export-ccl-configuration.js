import async from 'async'
import cbor from 'cbor'
import path from 'path'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import ccl from './../lib/ccl/index.js'
import { fileWriterFactory } from './util/dist.js'

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

  const fileWriter = fileWriterFactory({
    target: path.resolve(process.cwd(), argv.target)
  })

  // export CCL Configuration as JSON
  if (argv.jsonFilename) {
    await fileWriter.writeJSON(argv.jsonFilename, cclConfigurations, { spaces: 2 })
  }

  // export CCL Configuration as CBOR
  if (argv.cborFilename) {
    const asBuffer = await cbor.encodeAsync(cclConfigurations)

    await fileWriter.fanOutToOS(ctx => {
      return ctx.writeFile(argv.cborFilename, asBuffer)
    })
  }

  // export CCL Configuration as rules
  if (argv.target) {
    await async.forEach(cclConfigurations, async config => {
      await fileWriter.fanOutToRuleDistribution(ctx => {
        const filename = `${config.Identifier.toLowerCase()}.json`
        return ctx.writeJSON(filename, config)
      })
    })
  }
}

main()
  .then(() => console.log('Done.'))
  .catch(err => console.log('Error:', err))
