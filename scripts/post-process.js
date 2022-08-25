import fs from 'fs-extra'

// as we do string comparison and Android outputs dates a
// little bit different, we need to do some post
// processing.
// For that purpose, we replace `.000Z` by `Z` to remove
// milliseconds from ISO 8601 date-time representations.
const contents = fs.readFileSync('./dist/android-ccl-test-cases.gen.json', 'utf-8')
const newContents = contents.replace(/\.000Z/g, 'Z')
fs.writeFileSync('./dist/android-ccl-test-cases.gen.json', newContents)
