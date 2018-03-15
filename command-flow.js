const meta = require('./package')
const debug = require('debug')(meta.name + ':command-flow')
const expand = require('expand-tilde')
const _ = require('lodash')

exports.command = 'flow [options]'

exports.describe = 'Export flow information from an email archive'

exports.builder = {
  'provider': {},
  'secret': {},
  'user-words': {},
  'domain-words': {},
  'mac-index': {}
}

exports.handler = (argv) => {

  const anonymizer = require('./lib/anonymizer')({
    secret: argv['secret'],
    words: {
      user: argv['user-words'],
      domain: argv['domain-words']
    }
  })
  
  const provider = require('./lib/mac-provider')({
    path: expand(argv['mac-index'])
  })

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
