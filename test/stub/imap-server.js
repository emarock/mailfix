const hoodiecrow = require('hoodiecrow-imap')
const store = require('../data/imap-store')

const server = hoodiecrow({
  plugins: ['ID', 'STARTTLS', 'SASL-IR', 'AUTH-PLAIN',
	    'NAMESPACE', 'IDLE', 'ENABLE', 'CONDSTORE',
	    'XTOYBIRD', 'LITERALPLUS', 'UNSELECT',
	    'SPECIAL-USE', 'CREATE-SPECIAL-USE'],
  id: {
    name: 'hoodiecrow',
    version: '0.1'
  },

  storage: store
})

module.exports = {
  start: (port, callback) => {
    server.listen(port, callback)
  },
  stop: () => {
    server.close()
  }
}
