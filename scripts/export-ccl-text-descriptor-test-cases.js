import chalk from 'chalk'
import fse from 'fs-extra'
import path from 'path'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import yaml from 'js-yaml'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const argv = yargs(hideBin(process.argv))
  .option('target', {
    alias: 't',
    string: true,
    default: 'dist'
  })
  .option('json-filename', {
    default: 'ccl-text-descriptor-test-cases.gen.json'
  })
  .argv

const main = async () => {
  const filepath = path.resolve(__dirname, './../test/fixtures/ccl/ccl-text-descriptors.yaml')
  const testCasesStr = fse.readFileSync(filepath, 'utf-8')
  const testCases = yaml.load(testCasesStr)

  if (argv.jsonFilename) {
    const data = {
      $comment: `Generated at ${new Date().toString()}`,
      testCases: testCases
    }

    const filepath = path.join(argv.target, argv.jsonFilename)
    const targetFilepath = path.resolve(process.cwd(), filepath)
    await fse.ensureFile(targetFilepath)
    await fse.writeJson(targetFilepath, data, { spaces: 2 })
    console.log(`Created JSON target ${chalk.cyan(filepath)}`)
  }
}

main()
  .then(() => console.log('Done.'))
  .catch(err => console.log('Error:', err))
