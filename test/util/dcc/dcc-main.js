import dccData from './dcc-data.js'
import dccDecode from './dcc-decode.js'
import dccEncode from './dcc-encode.js'
import dccUtil from './dcc-util.js'
import dccSignature from './dcc-signature.js'
import dccDsc from './dcc-dsc.js'
import dccGenerate from './dcc-generate.js'
import dccSeries from './dcc-series.js'

export default {
  data: { ...dccData },
  decode: {
    ...dccDecode
  },
  dsc: dccDsc,
  encode: {
    ...dccEncode
  },
  generate: dccGenerate,
  series: dccSeries,
  signature: {
    ...dccSignature
  },
  util: {
    ...dccUtil
  }
}
