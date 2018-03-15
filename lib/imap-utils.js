const meta = require('../package')
const debug = require('debug')(`${meta.name}:imap-utils`)
const _ = require('lodash')
const parser = require('addressparser')
const imap = require('imap')

function list(boxes, filter, inverse) {

  const ret = []

  _.forEach(boxes, (box, name) => {
    debug('processing box %s', name)
    if (box.attribs.indexOf('\\Noselect') < 0 &&
	(!filter || (!name.match(filter) ^ !inverse))) {
      ret.push(name)
    }
    if (box.children) {
      debug('processing children of %s', name)
      _.forEach(list(box.children, filter, inverse), (child) => {
	ret.push(name + box.delimiter + child)
      })
    }
  })

  debug('returning %O', ret)
  return ret  
}

function parse(line) {
  const addresses = []
  _.forEach(parser(line), (addr) => {
    addr.address && addresses.push(addr.address)
  })
  debug('%s parses to %O', line, addresses)
  return addresses
}

function split(buffer) {
  const entries = []
  const header = imap.parseHeader(buffer)
  const from = _.size(header.from) && parse(header.from[0])[0]
  const date = _.size(header.date) && new Date(header.date)
  
  debug('buffer:\n%s\nparsed to:\n%O', buffer, header)
  debug('from: %O', from)
  debug('date: %O', date)
  
  if (from && date && (header.to || header.cc)) {
    _.forEach(parse(header.to), (address) => {
      entries.push({
	sender: from,
	receiver: address,
	date: date,
	type: 'to'
      })
    })
    _.forEach(parse(header.cc), (address) => {
      entries.push({
	sender: from,
	receiver: address,
	date: date,
	type: 'cc'
      })
    })
  }
  return entries
}

module.exports = {
  list: list,
  parse: parse,
  split: split
}
