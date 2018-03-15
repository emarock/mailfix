const meta = require('../package');
const debug = require('debug')(`${meta.name}:anonymizer`);
const _ = require('lodash')
const hash = require('string-hash');
const casual = require('casual');

const defaults = {
  secret: undefined,
  words: {
    user: 4,
    domain: 3
  }
}

module.exports = function (options) {
  options = _.defaultsDeep(options, defaults)

  if (options.words.domain < 2)
    throw new Error('domain must be at least two words')

  if (options.words.user < 1)
    throw new Error('user must be at least one word')

  const mappings = {
    addresses: {},
    domains: {}
  }

  const conflicts = {
    addresses: 0,
    domains: 0
  }

  function anonymize(user, domain) {

    casual.seed(hash(options.secret + (domain || user + '!')))
    const extra = (options.words.domain > 2 ?
		   casual.array_of_words(options.words.domain - 2).join('.') +
		   '.' : '')

    const adomain = `${extra}${casual.domain}`

    casual.seed(hash(options.secret + user + (domain || '')))
    const auser = casual.array_of_words(options.words.user).join('.')
    
    return {
      user: auser.toLowerCase(),
      domain: adomain.toLowerCase()
    }
  }

  function map(address) {

    address = address.toLowerCase()
    const fields = address.match(/(.+)@(.+)/)
    const user = fields ? fields[1] : address
    const domain = fields ? fields[2] : undefined
    
    const mapped = (options.secret ?
		    anonymize(user, domain) : {
		      user: user,
		      domain: domain
		    })
		    
    
    const ret = mapped.user + (mapped.domain ? `@${mapped.domain}` : '')
    
    mappings.domains[mapped.domain] = mappings.domains[mapped.domain] || {}
    if (_.keys(mappings.domains[mapped.domain]).length > 0 &&
	!mappings.domains[mapped.domain][domain])
      conflicts.domains++
    mappings.domains[mapped.domain][domain] = true
  
    mappings.addresses[ret] = mappings.addresses[ret] || {}
    if (_.keys(mappings.addresses[ret]).length > 0 &&
	!mappings.addresses[ret][address])
      conflicts.addresses++
    mappings.addresses[ret][address] = true

    return ret
  }

  return {
    map,
    mappings,
    conflicts
  }  
}
