const meta = require('./package')
const debug = require('debug')(meta.name + ':command-flow')
const tty = require('tty')
const fs = require('fs')
const _ = require('lodash')
const async = require('async')
const expand = require('expand-tilde')
const chalk = require('chalk')
const printf = require('printf')

exports.command = 'flow [options]'

exports.describe = 'Export flow information from an email archive'

exports.builder = (yargs) => {

  yargs.options({
    'provider': {},
    'secret': {},
    'output': {},
    'user-words': {},
    'domain-words': {},
    'mac-index': {},
    'imap-host': {},
    'imap-port': {},
    'imap-tls': {},
    'imap-filter': {},
    'imap-invert': {}
  })

  yargs.check((argv) => {
    switch (argv['provider']) {
    case 'imap':
      if (!argv['imap-host'])
	throw new Error('Missing required argument: imap-server')
    default:
      return true
    }    
  })

}

exports.handler = (argv) => {

  const streams = {
    info: tty.isatty(process.stdout.fd) ? process.stdout : process.stderr,
    data: argv.output ? fs.createWriteStream(argv.output) : process.stdout,
    mapping: argv.mapping && fs.createWriteStream(argv.mapping)
  }

  const anonymizer = require('./lib/anonymizer')({
    secret: argv['secret'],
    words: {
      user: argv['user-words'],
      domain: argv['domain-words']
    }
  })
  
  async.waterfall([
    (callback) => {
      let credentials
      switch (argv.provider) {
      case 'mac':
	return callback(null, null)
      case 'imap':
	credentials = require('./lib/imap-credentials')({
	  output: streams.info
	})
	return credentials.get(callback)
      }
    },
    (credentials, callback) => {
      let provider
      switch (argv.provider) {
      case 'mac':
	provider = require('./lib/mac-provider')({
	  path: expand(argv['mac-index'])
	})
	return callback(null, provider)
      case 'imap':
	provider = require('./lib/imap-provider')({
	  imap: {
	    host: argv['imap-host'],
	    port: argv['imap-port'],
	    user: credentials.user,
	    password: credentials.password,
	    tls: argv['imap-tls']
	  },
	  filter: argv['imap-filter'] && new RegExp(argv['imap-filter']),
	  invert: argv['imap-invert']
	})
	return callback(null, provider)
      }
    },
    (provider, callback) => {
      provider.on('data', (row) => {
	row.sender = anonymizer.map(row.sender)
	row.receiver = anonymizer.map(row.receiver)
	printf(streams.data, '%O\n', row)
      })
      provider.on('end', callback)
      provider.on('error', callback)
    },
    (callback) => {
      if (streams.mapping) {
	_.forEach(anonymizer.mappings.addresses, (reals, fake) => {
	  _.forEach(reals, (bool, real) => {
	    printf(streams.mapping, '%O\n', {fake, real})
	  })
	})
      }
      return callback()
    }
  ], (err) => {
    if (err) throw err
    printf(streams.info,
	   chalk.bold('domain anonymization produced %d conflicts\n'),
	   anonymizer.conflicts.domains)
    printf(streams.info,
	   chalk.bold('address anonymizazion produced %d conflicts\n'),
	   anonymizer.conflicts.addresses)
    if (anonymizer.conflicts.domains + anonymizer.conflicts.addresses > 0)
      printf(streams.info,
	     chalk.bold('you may want to increase user and domain words',
			'to reduce conflicts\n'))
  })
}
