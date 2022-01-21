import chalk from 'chalk'
import fse from 'fs-extra'
import got from 'got'
import path from 'path'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

const argv = yargs(hideBin(process.argv))
  .option('json-target', {
    string: true
  })
  .argv

const discoveryUrl = 'https://distribution.dcc-rules.de/bnrules'

const getBnrHashes = async () => {
  const response = await got({
    url: discoveryUrl,
    responseType: 'json'
  })
  const hashes = response.body.map(it => it.hash)
  return hashes
}

const getBnrByHash = async (hash) => {
  const response = await got({
    url: `${discoveryUrl}/${hash}`,
    responseType: 'json'
  })
  return response.body
}

const main = async () => {
  const hashes = await getBnrHashes()
  const allBnrs = await Promise.all(hashes.map(getBnrByHash))
  const allBnrsSorted = allBnrs.sort((a, b) => {
    return a.Identifier < b.Identifier ? -1 : 1
  })

  if (argv.jsonTarget) {
    const data = {
      $comment: `Generated at ${new Date().toString()}`,
      bnrs: allBnrsSorted
    }

    const targetFilepath = path.resolve(process.cwd(), argv.jsonTarget)
    await fse.ensureFile(targetFilepath)
    await fse.writeJSON(targetFilepath, data, { spaces: 2 })
    console.log(`Created JSON target ${chalk.cyan(argv.jsonTarget)}`)
  }
}

main()
  .then(() => console.log('Done.'))
  .catch(err => console.log('Error:', err))
