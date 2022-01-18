'use strict'

const fse = require('fs-extra')
const path = require('path')

const ccl = require('./../lib/ccl')

const target = process.argv[2]
if (!target) throw new Error('Required target parameter is missing')

const main = async () => {
  const targetFilepath = path.resolve(process.cwd(), target)
  await fse.ensureFile(targetFilepath)

  const functionDescriptors = ccl.getFunctionDescriptors()
  const allDescriptors = functionDescriptors
    .map(it => it.getDescriptor())

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

  await fse.writeJSON(targetFilepath, cclConfigurations)
}

main()
