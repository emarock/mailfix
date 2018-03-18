const meta = require('../package')
const debug = require('debug')(`${meta.name}:imap-provider`)
const EventEmitter = require('events')
const async = require('async')
const _ = require('lodash')
const imap = require('imap')
const utils = require('./imap-utils')

const defaults = {
  imap: {
    user: undefined,
    password: undefined,
    xoauth2: undefined,
    host: undefined,
    port: undefined,
    tls: false
  },
  filter: undefined,
  invert: false
}

module.exports = function (options) {
  options = _.defaultsDeep(options, defaults)

  debug('initializing with options %O', options)

  if ((!options.imap.user || !options.imap.password) &&
      (!options.imap.xoauth2))
    throw new Error('no credentials provided')

  if (!options.imap.host || !options.imap.port)
    throw new Error('both host and port are required')

  const emitter = new EventEmitter()

  const client = imap(options.imap)

  emitter.close = () => {
    debug('shutting down')
    client.end()
  }

  client.on('error', (err) => {
    emitter.emit('error', err)
  })

  async.waterfall([
    (callback) => {
      debug('connecting to %O', options.imap)
      client.connect()
      client.on('ready', () => {
	debug('ready to start')
	emitter.emit('ready')
	return callback()
      })
    },
    (callback) => {
      client.getBoxes((err, boxes) => {
	if (err) return callback(err)
	debug('retrieved mailboxes %O', boxes)
	const boxnames = utils.list(boxes, options.filter, options.invert)
	emitter.emit('mailboxes', boxnames)
	return callback(null, boxnames)
      })
    },
    (names, callback) => {
      debug('counting messages')
      let total = 0
      async.mapSeries(names, (name, callback) => {
	client.openBox(name, true, (err, box) => {
	  if (err) return callback(err)
	  total += box.messages.total
	  return callback()
	})
      }, (err) => {
	return callback(err, names, total)
      })
    },
    (names, total, callback) => {
      debug('fetching %d messages from %d mailboxes', total, names.length)
      let cnt = 0
      async.mapSeries(names, (name, callback) => {
	async.waterfall([
	  (callback) => {
	    debug('opening mailbox %s', name)
	    client.openBox(name, true, callback)
	  },
	  (box, callback) => {
	    debug('fetching %d messages', box.messages.total)
	    if (box.messages.total < 1) return callback()
	    client.seq.fetch(`1:${box.messages.total}`, {
    	      bodies: 'HEADER.FIELDS (FROM TO CC DATE)',
    	      struct: true
	    }).on('error', (err) => {
	      return callback(err)
	    }).on('message', (msg) => {
	      msg.on('body', (stream) => {
		let buffer = ''
		stream.on('data', function(chunk) {
		  buffer += chunk.toString('utf8')
		}).on('error', (err) => {
		  return callback(err)
		}).on('end', function() {
		  debug('retrieved header: %s', buffer)
		  cnt++
		  debug('emitting progress %d/%d', cnt, total)
		  emitter.emit('progress', {
		    actual: cnt,
		    total: total
		  })
		  _.forEach(utils.split(buffer), (row) => {
		    row.id = cnt
		    debug('emitting %O', row)
		    emitter.emit('data', row)
		  })
		})
    	      })
	    }).on('end', () => {
	      return callback()
	    })
	  }
	], callback)
      }, callback)
    }
  ], (err) => {
    try {
      if (err) {
	emitter.emit('error', err)
      } else {
	emitter.emit('end')
      }
    } finally {
      client.end()
    }
    
  })

  return emitter
}
