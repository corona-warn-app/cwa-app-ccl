import {
  $,
  argv,
  cd,
  chalk,
  fs,
  path,
  within
} from 'zx'

const main = async () => {
  const cwd = process.cwd()
  const targetRootDir = path.resolve(cwd, './../cwa-kotlin-jfn')
  const targetFilepath = path.resolve(targetRootDir, './src/test/resources/jfn-common-test-cases.gen.json')
  const jfnTestCasesFilepath = path.resolve(cwd, './dist/android-jfn-test-cases.gen.json')
  const cclTestCasesFilepath = path.resolve(cwd, './dist/android-ccl-test-cases.gen.json')

  // argument processing
  const runBuild = argv.build !== false
  const testJfn = argv.jfn !== false
  const testCcl = argv.ccl !== false
  const gradleInfo = argv.i || argv.info

  const copyAndTest = async filepath => {
    await within(async () => {
      await $`cp ${filepath} ${targetFilepath}`
      cd(targetRootDir)
      if (gradleInfo) await $`./gradlew test -i`
      else await $`./gradlew test`
    })
  }

  try {
    // check prerequisites
    // - targetRootDir must exist
    fs.statSync(targetRootDir)

    if (runBuild) await $`npm run build`

    if (testJfn) await copyAndTest(jfnTestCasesFilepath)
    if (testCcl) await copyAndTest(cclTestCasesFilepath)
  } catch (err) {
    if (err.syscall === 'stat' && err.message.includes('no such file or directory')) {
      console.log(`${chalk.red('ERROR')} - Required repository ${chalk.cyan('cwa-kotlin-jfn')} not found`)
      console.log(`> expected at ${chalk.gray(targetRootDir)}`)
    } else {
      throw err
    }
  }
}
main()
