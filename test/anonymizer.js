const meta = require('../package')
const debug = require('debug')(`${meta.name}:test:anonymizer`)
const expect = require('chai').expect
const _ = require('lodash')
const proxyquire = require('proxyquire')
const hash = require('string-hash')

describe('anonymizer', () => {

  let anonymizer

  describe('#map()', () => {

    it('should return an output value that is different from input', () => {
      const secrets = ['test']
      const addresses = ['Test@test', 'test', 'Test']

      _.forEach(secrets, (secret) => {
	_.forEach(addresses, (address) => {
	  anonymizer = require('../lib/anonymizer')({
	    secret: secret
	  })

	  expect(address).to.not.equal(anonymizer.map(address))
	})
      })
    })

    it('should return lowercase input when initialized with no secret', () => {
      const secrets = [undefined, '', null]
      const addresses = ['Test@test', 'test@Test', 'test', 'Test']
      
      _.forEach(secrets, (secret) => {
	_.forEach(addresses, (address) => {
	  anonymizer = require('../lib/anonymizer')({
	    secret: secret
	  })
	  expect(address.toLowerCase()).to.equal(anonymizer.map(address))
	})
      })
    })

    it('should map domains consistently', () => {
      anonymizer = require('../lib/anonymizer')({
	secret: 'test'
      })

      const same = ['joe@example.com', 'john@example.com', 'jim@Example.com']
      const other = ['joe@example.org', 'john@example.net']
      
      expect(anonymizer.map(same[0]).match(/(.+)@(.+)/)[2])
	.to.equal(anonymizer.map(same[1]).match(/(.+)@(.+)/)[2])
      expect(anonymizer.map(same[1]).match(/(.+)@(.+)/)[2])
	.to.equal(anonymizer.map(same[2]).match(/(.+)@(.+)/)[2])
      expect(anonymizer.map(other[0]).match(/(.+)@(.+)/)[2])
	.to.not.equal(anonymizer.map(other[1]).match(/(.+)@(.+)/)[2])
    })

    it('should map addresses consistently', () => {
      anonymizer = require('../lib/anonymizer')({
	secret: 'test'
      })

      const mappings = {
	'Test@test': 'qui.quam.voluptas.quidem@et.klein.name',
	'test@Test': 'qui.quam.voluptas.quidem@et.klein.name',
	'test': 'et.eveniet.praesentium.deserunt@ab.mcdermott.com',
	'Test': 'et.eveniet.praesentium.deserunt@ab.mcdermott.com',
	'other': 'culpa.et.doloribus.quibusdam@autem.stokes.biz'
      }

      _.forEach(mappings, (dst, src) => {
	expect(dst).to.equal(anonymizer.map(src))
      })
    })

  })

  describe('#mappings', () => {

    it('should track address mappings consistently with secret', () => {
      anonymizer = require('../lib/anonymizer')({
	secret: 'test'
      })

      const addresses = ['test@test', 'Test@test', 'test@Test',
			 'test', 'Test', 'other']

      const mappings = {
	'qui.quam.voluptas.quidem@et.klein.name': {
	  'test@test': true
	},
	'et.eveniet.praesentium.deserunt@ab.mcdermott.com': {
	  'test': true
	},
	'culpa.et.doloribus.quibusdam@autem.stokes.biz': {
	  'other': true
	}
      }

      _.forEach(addresses, (address) => {
	  anonymizer.map(address)
      })
      
      expect(mappings).to.deep.equal(anonymizer.mappings.addresses)
    })

    it('should track domain mappings consistently with secret', () => {
      anonymizer = require('../lib/anonymizer')({
	secret: 'test'
      })

      const addresses = ['test@test', 'Test@test', 'test@Test',
			 'test', 'Test', 'other']

      const mappings = {
	'et.klein.name': {
	  'test': true
	},
	'ab.mcdermott.com': {
	  undefined: true
	},
	'autem.stokes.biz': {
	  undefined: true
	}
      }

      _.forEach(addresses, (address) => {
	  anonymizer.map(address)
      })
      
      expect(mappings).to.deep.equal(anonymizer.mappings.domains)
    })

    it('should track address mappings consistently without secret', () => {
      anonymizer = require('../lib/anonymizer')()

      const addresses = ['test@test', 'Test@test', 'test@Test',
			 'test', 'Test', 'other']

      const mappings = {
	'test@test': {
	  'test@test': true
	},
	'test': {
	  'test': true
	},
	'other': {
	  'other': true
	}
      }

      _.forEach(addresses, (address) => {
	anonymizer.map(address)
      })
      
      expect(mappings).to.deep.equal(anonymizer.mappings.addresses)
    })

    it('should track domain mappings consistently without secret', () => {
      anonymizer = require('../lib/anonymizer')()

      const addresses = ['test@test', 'Test@test', 'test@Test',
			 'test', 'Test', 'other']

      const mappings = {
	'test': {
	  'test': true
	},
	undefined: {
	  undefined: true
	}
      }

      _.forEach(addresses, (address) => {
	anonymizer.map(address)
      })
      
      expect(mappings).to.deep.equal(anonymizer.mappings.domains)
    })
  })

  describe('#conflicts', () => {

    it('should correctly count address conflicts', () => {
      const addresses = ['joe@example.com', 'john@example.com',
			 'jane@example.com', 'jim@example.net',
			 'jack@example.org', 'other']
      
      const hashmock = (s) => {
	if (s.match(/(joe|john)/)) {
	  debug('returning conflicting hash')
	  return 1234
	} else {
	  debug('returning actual hash')
	  return hash(s)
	}
      }

      anonymizer = proxyquire('../lib/anonymizer', {
	'string-hash': hashmock
      })({
	secret: 'test'
      })

      _.forEach(addresses, (address) => {
	anonymizer.map(address)
      })

      expect(anonymizer.conflicts.addresses).to.equal(1)
    
    })

    it('should correctly count domain conflicts', () => {
      const addresses = ['joe@example.com', 'john@example.com',
			 'jane@example.com', 'jim@example.net',
			 'jack@example.org', 'other']
      
      const hashmock = (s) => {
	if (s.match(/(example\.org|example\.net)/)) {
	  debug('returning conflicting hash')
	  return 1234
	} else {
	  debug('returning actual hash')
	  return hash(s)
	}
      }

      anonymizer = proxyquire('../lib/anonymizer', {
	'string-hash': hashmock
      })({
	secret: 'test'
      })

      _.forEach(addresses, (address) => {
	anonymizer.map(address)
      })

      expect(anonymizer.conflicts.domains).to.equal(1)
    
    })
    
  })

})
