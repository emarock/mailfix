const meta = require('../package');
const debug = require('debug')(`${meta.name}:mac-provider`);
const EventEmitter = require('events')
const async = require('async')
const sql = require('sqlite3').verbose()
const _ = require('lodash')

const defaults = {
  path: undefined
}

module.exports = function (options) {
  options = _.defaultsDeep(options, defaults)

  if (!options.path)
    throw new Error('path to "Envelope Index" file is required')

  const emitter = new EventEmitter()

  async.waterfall([
    (callback) => {
      debug('opening database connection')
      const db = new sql.Database(options.path, sql.OPEN_READONLY, (err) => {
	emitter.emit('ready')
	return callback(err, db);
      })
    },
    (db, callback) => {
      debug('executing query')
      var q =
	  'SELECT ' +
          'm.ROWID as id, ' +
          'datetime(m.date_sent, "unixepoch") as date, ' +
          'f.address as sender, ' +
          't.address as receiver, ' +
          'r.type as type ' +
          'FROM ' +
          'recipients as r, messages as m, addresses as f, addresses as t ' +
          'WHERE ' +
          'r.message_id = m.ROWID and ' +
          'm.sender = f.ROWID and ' +
          'r.address_id = t.ROWID'
	  // + ' and m.date_sent > strftime("%s", "2018-01-01")'
      	  // + ' and m.date_sent > strftime("%s", "2015-06-01")'
      db.each(q, {}, (err, row) => {
	if (err) return callback(err, db);
	debug('retrieved row')
	emitter.emit('data', {
	  id: row.id,
	  date: new Date(row.date),
	  sender: row.sender,
	  receiver: row.receiver,
	  type: (row.type === 0 ? 'to' : (row.type === 1 ? 'cc' : undefined))
	})
      }, () => {
	return callback(null, db)
      });
    },
  ], (err, db) => {
    if (err) {
      debug('cannot complete query', err)
      emitter.emit('error', err)
    } else {
      debug('query complete')
      emitter.emit('end')
    }
    try {
      db.close()
    } catch (err) {
      debug('cannot close database connection', err)
    }

  })

  return emitter
}