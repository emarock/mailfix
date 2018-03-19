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
      debug('executing query for message counting')
      const q = 'SELECT count(*) as total FROM messages'
      db.get(q, {}, (err, res) => {
	return callback(err, db, res.total)
      })      
    },
    (db, total, callback) => {
      debug('executing query for data retrievial')
      debug('total: %O', total)
      const q =
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

      const statement = db.prepare(q, {}, (err) => {
	return callback(err, db, statement, total)
      })
    },
    (db, statement, total, callback) => {
      let id, cnt = 0
      async.doUntil((callback) => {
	statement.get({}, (err, row) => {
	  if (err)
	    return callback(err)
	  else if (row) {
	    if (row.id !== id) {
	      id = row.id
	      cnt++
	      debug('emitting progress %d/%d', cnt, total)
	      emitter.emit('progress', {
		actual: cnt,
		total: total
	      })
	    }
	    debug('retrieved row')
	    emitter.emit('data', {
	      id: row.id,
	      date: new Date(row.date),
	      sender: row.sender,
	      receiver: row.receiver,
	      type: (row.type === 0 ? 'to' :
		     (row.type === 1 ? 'cc' : undefined))
	    })
	  }
	  return callback(null, row)
	})
      }, (row) => {
	return !row
      }, (err) => {
	return callback(err, db, statement)
      })
    },
    (db, statement, callback) => {
      statement.finalize((err) => {
	return callback(err, db)
      })
    }
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
