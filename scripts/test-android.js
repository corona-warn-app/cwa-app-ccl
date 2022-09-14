import {
  $,
  argv,
  cd,
  chalk,
  fs,
  path,
  within
} from 'zx'

const TEST_CASE_CHUNK_SIZE = 250
const chunkify = (filepath, chunkSize) => {
  // chunkify reduces the size of a test case file that is passed
  // to gradle at once and thus reduces the risk of causing an out
  // of memory error in gradle
  const json = JSON.parse(fs.readFileSync(filepath).toString())
  const iterations = Math.ceil(json.testCases.length / chunkSize)
  const chunks = Array.from(new Array(iterations)).map((undef, idx) => {
    return {
      $comment: json.$comment,
      sourceHash: json.sourceHash,
      sourceTreeish: json.sourceTreeish,
      sourceFile: filepath,
      chunkIndex: idx,
      testCases: json.testCases.slice(idx * chunkSize, (idx + 1) * chunkSize)
    }
  })
  return chunks
}

const main = async () => {
  const cwd = process.cwd()
  const targetRootDir = path.resolve(cwd, './../cwa-kotlin-jfn')
  const targetFilepath = path.resolve(targetRootDir, './src/test/resources/jfn-common-test-cases.gen.json')
  const jfnTestCasesFilepath = path.resolve(cwd, './dist/android-jfn-test-cases.gen.json')
  const cclTestCasesFilepath = path.resolve(cwd, './dist/android-ccl-test-cases.gen.json')
  const testCasesChunkFilepath = path.resolve(cwd, './dist/android-test-cases-chunk.gen.json')

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
    if (testCcl) {
      const chunks = chunkify(cclTestCasesFilepath, TEST_CASE_CHUNK_SIZE)
      for (const chunk of chunks) {
        console.log(`Chunk ${chunk.chunkIndex + 1} of ${chunks.length}`)
        fs.writeFileSync(testCasesChunkFilepath, JSON.stringify(chunk))
        await copyAndTest(testCasesChunkFilepath)
      }
    }
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
