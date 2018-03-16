const meta = require('./package')
const debug = require('debug')(meta.name + ':command-map')

exports.command = 'map <address>'

exports.describe = 'Map an email address to its anonymized form'

exports.builder = (yargs) => {

  yargs.options({
    'secret': {},
    'user-words': {},
    'domain-words': {}
  })
}

exports.handler = (argv) => {

  const anonymizer = require('./lib/anonymizer')({
    secret: argv['secret'],
    words: {
      user: argv['user-words'],
      domain: argv['domain-words']
    }
  })

  console.log(anonymizer.map(argv.address))
  
}
