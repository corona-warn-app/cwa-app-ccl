import fs from 'fs-extra'

// as we do string comparison and Android outputs dates a
// little bit different, we need to do some post
// processing.
// For that purpose, we replace `.000Z` by `Z` to remove
// milliseconds from ISO 8601 date-time representations.
const filenames = [
  'android-ccl-test-cases.gen.json',
  'android-ccl-test-cases.gen.json.chunk0',
  'android-ccl-test-cases.gen.json.chunk1',
  'android-ccl-test-cases.gen.json.chunk2'
]
filenames.forEach(filename => {
  const contents = fs.readFileSync(`./dist/${filename}`, 'utf-8')
  const newContents = contents.replace(/\.000Z/g, 'Z')
  fs.writeFileSync(`./dist/${filename}`, newContents)
})
