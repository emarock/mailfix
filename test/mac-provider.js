const expect = require('chai').expect
const path = require('path')

describe('mac-provider', () => {

  let provider
  
  it ('should emit a ready event before any data', (done) => {
    provider = require('../lib/mac-provider')({
      path: path.join(__dirname, 'data', 'db.sqlite')
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
    provider = require('../lib/mac-provider')({
      path: path.join(__dirname, 'data', 'db.sqlite')
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
	expect(count).to.equal(14)
	done()
      } catch (err) {
	done(err)
      }
    })

  })

})
