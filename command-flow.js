const meta = require('./package')
const debug = require('debug')(meta.name + ':command-flow')
const expand = require('expand-tilde')
const _ = require('lodash')

exports.command = 'flow [options]'

exports.describe = 'Export flow information from an email archive'

exports.builder = (yargs) => {

  yargs.options({
    'provider': {},
    'secret': {},
    'user-words': {},
    'domain-words': {},
    'mac-index': {},
    'imap-host': {},
    'imap-port': {},
    'imap-tls': {},
    'imap-user': {},
    'imap-pass': {},
    'imap-filter': {},
    'imap-invert': {}
  })

  yargs.check((argv) => {
    switch (argv['provider']) {
    case 'imap':
      if (!argv['imap-host'])
	throw new Error('Missing required argument: imap-server')
      if (!argv['imap-user'])
	throw new Error('Missing required argument: imap-user')
      if (!argv['imap-pass'])
	throw new Error('Missing required argument: imap-pass')
    default:
      return true
    }    
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
  
  let provider

  switch (argv.provider) {
  case 'mac':
    provider = require('./lib/mac-provider')({
      path: expand(argv['mac-index'])
    })
    break
  case 'imap':
    provider = require('./lib/imap-provider')({
      imap: {
	host: argv['imap-host'],
	port: argv['imap-port'],
	user: argv['imap-user'],
	password: argv['imap-pass'],
	tls: argv['imap-tls']
      },
      filter: argv['imap-filter'] && new RegExp(argv['imap-filter']),
      invert: argv['imap-invert']
    })
    break
  }

  provider.on('data', (row) => {
    row.sender = anonymizer.map(row.sender)
    row.receiver = anonymizer.map(row.receiver)
    console.log(row)
  })

  provider.on('end', () => {
    // let conflicts = 0;
    // _.forEach(anonymizer.mappings.domains, (domains, mapped) => {
    //   debug('%j => %s', _.keys(domains), mapped)
    //   if (_.size(domains) > 1) debug(`conflicting domain on ${mapped}`)
    //   conflicts += _.size(domains) - 1
    // });
    // debug('found %d domain conflicts', conflicts)
    // conflicts = 0;
    // _.forEach(anonymizer.mappings.addresses, (addresses, mapped) => {
    //   debug('%j => %s', _.keys(addresses), mapped)
    //   if (_.size(addresses) > 1) debug(`conflicting address on ${mapped}`)
    //   conflicts += _.size(addresses) - 1
    // });
    // debug('found %d address conflicts', conflicts)

    console.error('domain anonymization produced %d conflicts',
		  anonymizer.conflicts.domains)
    console.error('address anonymizazion produced %d conflicts',
		  anonymizer.conflicts.addresses)
    if (anonymizer.conflicts.domains + anonymizer.conflicts.addresses > 0)
      console.error('you may want to increase user and domain words ' +
		    'to reduce conflicts')

  })
}
