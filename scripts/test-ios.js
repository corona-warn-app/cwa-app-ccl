import {
  $,
  argv,
  cd,
  chalk,
  fs,
  path,
  within,
  which
} from 'zx'

const main = async () => {
  const cwd = process.cwd()
  const targetRootDir = path.resolve(cwd, './../json-functions-swift')
  const targetFilepath = path.resolve(targetRootDir, './Tests/jsonfunctionsTests/jfn-common-test-cases.json')
  const jfnTestCasesFilepath = path.resolve(cwd, './dist/ios-jfn-test-cases.gen.json')
  const cclTestCasesFilepath = path.resolve(cwd, './dist/ios-ccl-test-cases.gen.json')

  // argument processing
  const runBuild = argv.build !== false
  const testJfn = argv.jfn !== false
  const testCcl = argv.ccl !== false

  const copyAndTest = async filepath => {
    await within(async () => {
      await $`cp ${filepath} ${targetFilepath}`
      cd(targetRootDir)
      await $`swift test`
    })
  }

  try {
    // check prerequisites
    // - swift must be installed
    await which('swift')
    // - targetRootDir must exist
    fs.statSync(targetRootDir)

    if (runBuild) await $`npm run build`

    if (testJfn) await copyAndTest(jfnTestCasesFilepath)
    if (testCcl) await copyAndTest(cclTestCasesFilepath)
  } catch (err) {
    if (err.message.includes('not found: swift')) {
      console.log(`${chalk.red('ERROR')} - Required binary ${chalk.cyan('swift')} not found`)
      console.log(`> run ${chalk.gray('which swift')}`)
    } else if (err.syscall === 'stat' && err.message.includes('no such file or directory')) {
      console.log(`${chalk.red('ERROR')} - Required repository ${chalk.cyan('json-functions-swift')} not found`)
      console.log(`> expected at ${chalk.gray(targetRootDir)}`)
    } else {
      throw err
    }
  }
}
main()
