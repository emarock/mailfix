const meta = require('../package')
const debug = require('debug')(`${meta.name}:test:imap-provider`)
const expect = require('chai').expect
const _ = require('lodash')
const server = require('./stub/imap-server')

describe('imap-provider', () => {

  let provider

  before((done) => {
    server.start(1143, () => {
      done()
    })
  })

  after(() => {
    server.stop()
  })

  afterEach(() => {
    provider.close()
  })
  
  it('should emit a ready event when connected', (done) => {
    provider = require('../lib/imap-provider')({
      imap: {
	user: 'testuser',
	password: 'testpass',
	host: '127.0.0.1',
	port: 1143,
	tls: false
      }
    })

    provider.once('ready', () => {      
      done()
    })
  })

  it('should emit an error event if cannot authenticate', (done) => {
    provider = require('../lib/imap-provider')({
      imap: {
	user: 'testuser',
	password: 'wrongpass',
	host: '127.0.0.1',
	port: 1143,
	tls: false
      }
    })

    provider.once('error', () => {      
      done()
    })
  })

  it('should emit a mailboxes event with discovered mailboxes', (done) => {
    provider = require('../lib/imap-provider')({
      imap: {
	user: 'testuser',
	password: 'testpass',
	host: '127.0.0.1',
	port: 1143,
	tls: false
      }
    })

    let cnt = 0

    provider.on('mailboxes', (boxes) => {
      try {
	expect(_.size(boxes)).to.equal(9)
	done()
      } catch (err) {
	done(err)
      }
    })
  })

  it ('should emit a ready event before any data', (done) => {
    provider = require('../lib/imap-provider')({
      imap: {
	user: 'testuser',
	password: 'testpass',
	host: '127.0.0.1',
	port: 1143,
	tls: false
      }
    })

    let ready = false
    
    provider.once('ready', () => {
      ready = true
    })

    provider.once('data', () => {
      try {
	expect(ready).to.equal(true)
	done()
      } catch (err) {
	done(err)
      }
    })
  })


  it('should emit proper data events and then end', (done) => {
    provider = require('../lib/imap-provider')({
      imap: {
	user: 'testuser',
	password: 'testpass',
	host: '127.0.0.1',
	port: 1143,
	tls: false
      }
    })

    let count = 0

    provider.on('data', (data) => {
      try {
	expect(data.id).to.be.a('number')
	expect(data.date).to.be.an.instanceOf(Date)
	expect(data.sender).to.be.a('string')
	expect(data.receiver).to.be.a('string')
	expect(data.type).to.be.oneOf(['to', 'cc'])
	count++
      } catch (err) {
	done(err)
      }
    })

    provider.on('end', () => {
      try {
	expect(count).to.equal(8)
	done()
      } catch (err) {
	done(err)
      }
    })

  })

  it('should emit proper data events only for included boxes', (done) => {
    provider = require('../lib/imap-provider')({
      imap: {
	user: 'testuser',
	password: 'testpass',
	host: '127.0.0.1',
	port: 1143,
	tls: false
      },
      filter: /^Sent Messages/
    })

    let count = 0

    provider.on('data', (data) => {
      try {
	expect(data.id).to.be.a('number')
	expect(data.date).to.be.an.instanceOf(Date)
	expect(data.sender).to.be.a('string')
	expect(data.receiver).to.be.a('string')
	expect(data.type).to.be.oneOf(['to', 'cc'])
	count++
      } catch (err) {
	done(err)
      }
    })

    provider.on('end', () => {
      try {
	expect(count).to.equal(3)
	done()
      } catch (err) {
	done(err)
      }
    })

  })

  it('should not emit events for exluded boxes', (done) => {
    provider = require('../lib/imap-provider')({
      imap: {
	user: 'testuser',
	password: 'testpass',
	host: '127.0.0.1',
	port: 1143,
	tls: false
      },
      filter: /^Sent Messages/,
      invert: true
    })

    let count = 0

    provider.on('data', (data) => {
      try {
	expect(data.id).to.be.a('number')
	expect(data.date).to.be.an.instanceOf(Date)
	expect(data.sender).to.be.a('string')
	expect(data.receiver).to.be.a('string')
	expect(data.type).to.be.oneOf(['to', 'cc'])
	count++
      } catch (err) {
	done(err)
      }
    })

    provider.on('end', () => {
      try {
	expect(count).to.equal(5)
	done()
      } catch (err) {
	done(err)
      }
    })

  })

  it('should emit progress events till it is over', (done) => {
    provider = require('../lib/imap-provider')({
      imap: {
	user: 'testuser',
	password: 'testpass',
	host: '127.0.0.1',
	port: 1143,
	tls: false
      }
    })

    let count = 0
    
    provider.on('progress', (progress) => {
      count++
    })

    provider.on('end', () => {
      try {
	expect(count).to.equal(14)
	done()
      } catch (err) {
	done(err)
      }
    })

  })
  
})

