const meta = require('../package')
const debug = require('debug')(`${meta.name}:test:imap-provider`)
const expect = require('chai').expect
const _ = require('lodash')
const utils = require('../lib/imap-utils')
const mboxes = require('./data/mboxes')

describe('imap-utils', () => {

  describe('#list()', () => {

    it('should return selectable mailboxes in a flat array', () => {
      const boxes = utils.list(mboxes)
      expect(boxes).to.have.lengthOf(9)
    })

    it('should not return non-selectable mailboxes', () => {
      const boxes = utils.list(mboxes)
      expect(boxes).to.be.an('array').that.not.includes('[Gmail]')
      expect(boxes).to.be.an('array').that.not.includes('Lists')
      expect(boxes).to.be.an('array').that.not.includes('Sublists')
    })

    it('should return only matching mailboxes', () => {
      const boxes = utils.list(mboxes, /Sent/)
      _.forEach(boxes, (box) => {
	expect(box).to.match(/Sent/)
      })
      expect(boxes).to.have.lengthOf(2)
    })

    it('should return only non-matching mailboxes with invert', () => {
      const boxes = utils.list(mboxes, /Sent/, true)
      _.forEach(boxes, (box) => {
	expect(box).to.not.match(/Sent/)
      })
      expect(boxes).to.have.lengthOf(7)
    })
    
  })

  describe('#parse()', () => {

    it('should extract email addresses from header lines', () => {
      const header = '"Test" <test@example.com>, test@example.org; ' +
	    '<test@example.biz>, namewithnoaddress; ' +
	    'Test Test <test@example.net>;test'

      const addresses = utils.parse(header)

      expect(addresses).to.have.members([
	'test@example.com',
	'test@example.org',
	'test@example.biz',
	'test@example.net'
      ]).and.to.have.lengthOf(4)
    })
    
  })

  describe('#split()', () => {

    it('should split one 1-to-1 IMAP header into one mailfix entry', () => {
      const buffer = 'From: sender name <sender@example.com>\r\n' +
	    'To: Receiver name <receiver@example.com>\r\n' +
	    'Date: Fri, 13 Sep 2013 15:01:00 +0300\r\n'

      const entries = utils.split(buffer)

      expect(entries).to.deep.equal([{
	date: new Date('Fri, 13 Sep 2013 15:01:00 +0300'),
	sender: 'sender@example.com',
	receiver: 'receiver@example.com',
	type: 'to'
      }])
    })

    it('should set type correctly', () => {
      const buffer = 'From: sender name <sender@example.com>\r\n' +
	    'Cc: Receiver name <receiver@example.com>\r\n' +
	    'Date: Fri, 13 Sep 2013 15:01:00 +0300\r\n'

      const entries = utils.split(buffer)

      expect(entries[0].type).to.deep.equal('cc')
    })

    it('should split one 1-to-n IMAP header into n mailfix entries', () => {
      const buffer = 'From: sender name <sender@example.com>\r\n' +
	    'To: Receiver name <receiver@example.com>,test@example.net\r\n' +
	    'Date: Fri, 13 Sep 2013 15:01:00 +0300\r\n'

      const entries = utils.split(buffer)

      expect(entries).to.have.deep.members([{
	date: new Date('Fri, 13 Sep 2013 15:01:00 +0300'),
	sender: 'sender@example.com',
	receiver: 'receiver@example.com',
	type: 'to'
      }, {
	date: new Date('Fri, 13 Sep 2013 15:01:00 +0300'),
	sender: 'sender@example.com',
	receiver: 'test@example.net',
	type: 'to'
      }])

    })

    it('should split To and Cc into proper mailfix entries', () => {
      const buffer = 'From: sender name <sender@example.com>\r\n' +
	    'To: Receiver name <receiver@example.com>\r\n' +
	    'Cc: test@example.net\r\n' +
	    'Date: Fri, 13 Sep 2013 15:01:00 +0300\r\n'
      
      const entries = utils.split(buffer)

      expect(entries).to.have.deep.members([{
	date: new Date('Fri, 13 Sep 2013 15:01:00 +0300'),
	sender: 'sender@example.com',
	receiver: 'receiver@example.com',
	type: 'to'
      }, {
	date: new Date('Fri, 13 Sep 2013 15:01:00 +0300'),
	sender: 'sender@example.com',
	receiver: 'test@example.net',
	type: 'cc'
      }])
    
    })
    
    it('should return zero entries if sender is missing', () => {
      const buffer = 'To: Receiver name <receiver@example.com>\r\n' +
	    'Date: Fri, 13 Sep 2013 15:01:00 +0300\r\n'

      const entries = utils.split(buffer)

      expect(entries).to.be.an('array').of.lengthOf(0)
    })

    it('should return zero entries if receivers are missing', () => {
      const buffer = 'From: sender name <sender@example.com>\r\n' +
	    'Date: Fri, 13 Sep 2013 15:01:00 +0300\r\n'

      const entries = utils.split(buffer)

      expect(entries).to.be.an('array').of.lengthOf(0)
    })

    it('should return zero entries if date is missing', () => {
      const buffer = 'To: Receiver name <receiver@example.com>\r\n' +
	    'From: sender name <sender@example.com>\r\n'

      const entries = utils.split(buffer)

      expect(entries).to.be.an('array').of.lengthOf(0)
    })
    
  })
  
})
