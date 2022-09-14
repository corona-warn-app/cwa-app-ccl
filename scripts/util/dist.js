import async from 'async'
import chalk from 'chalk'
import crypto from 'crypto'
import fse from 'fs-extra'
import path from 'path'

export const fileWriterFactory = ({ target, prefix }) => {
  const writeWrapper = writeFn => async (file, data, options) => {
    file = prefix ? `${prefix}-${file}` : file
    const targetFilepath = path.join(target, file)
    await fse.ensureFile(targetFilepath)
    await writeFn(targetFilepath, data, options)
    console.log(`Created ${chalk.cyan(path.relative(process.cwd(), targetFilepath))}.`)
  }

  const writeJSON = writeWrapper(fse.writeJSON)
  const writeFile = writeWrapper(fse.writeFile)

  const fanOutWrapper = prefixes => async callback => {
    await async.forEach(prefixes, async prefix => {
      const ctx = fileWriterFactory({ target, prefix })
      await callback(ctx, { prefix })
    })
  }

  const fanOutToAll = fanOutWrapper(['android', 'ios', 'rule-distribution'])
  const fanOutToOS = fanOutWrapper(['android', 'ios'])
  const fanOutToRuleDistribution = fanOutWrapper(['rule-distribution'])

  const ctx = {
    writeJSON,
    writeFile,
    fanOutToAll,
    fanOutToOS,
    fanOutToRuleDistribution
  }

  return ctx
}

export const hashJson = obj => {
  const str = JSON.stringify(obj)
  const hash = crypto.createHash('sha256')
  const data = hash.update(Buffer.from(str, 'utf-8'))
  const digest = data.digest().toString('hex')
  return digest
}
