const meta = require('../package')
const debug = require('debug')(`${meta.name}:gmail-credentials`)
const _ = require('lodash')
const async = require('async')
const gal = require('google-auth-library')
const inquirer = require('inquirer')
const chalk = require('chalk')
const printf = require('printf')

// Google does the same, so let's pretend it's fine:
// https://github.com/googlesamples/oauth-apps-for-windows/

const defaults = {
  output: process.stdout,
  id: '327407735637-6fa6a0m8rh2dsau0krqv7unvcoehefol.apps.googleusercontent.com',
  secret: 'nSD1aeWNbnlN-8SDBvihTzJu',
  uri: 'urn:ietf:wg:oauth:2.0:oob'
}

module.exports = function(options) {
  options = _.defaultsDeep(options, defaults)

  const prompt = inquirer.createPromptModule(options)

  const client = new gal.OAuth2Client(options.id, options.secret, options.uri)
  return {
    get: function (callback) {
      async.waterfall([
	(callback) => {
	  debug('retrieving code')
	  const url = client.generateAuthUrl({
	    access_type: 'offline',
	    scope: 'https://mail.google.com/'
	  })
	  
	  printf(options.output,
	  	 chalk.bold('Authorize access by visiting this url: %s\n'),
		 chalk.reset.underline(url))

	  prompt({
	    type: 'string',
	    name: 'code',
	    message: 'Enter the code from that page here:'
	  }).then((input) => {
	    debug('input received: %O', input)
	    return callback(null, input.code)
	  }).catch(callback)
	},
	(code, callback) => {
	  debug('retrieving token with code %O', code)
	  client.getToken(code).then((res) => {
	    debug('tokens received: %O', res.tokens)
	    return callback(null, res.tokens)
	  }).catch(callback)
	},
	(tokens, callback) => {
	  debug('setting credentials')
	  client.setCredentials(tokens)
	  return callback(null, client)
	},
	(client, callback) => {
	  debug('retrieving profile')
	  const url = 'https://www.googleapis.com/gmail/v1/users/me/profile'
	  client.request({
	    url: url
	  }).then((res) => {
	    debug('profile retrieved: %O', res.data)
	    return callback(null, client.credentials, res.data.emailAddress)
	  }).catch(callback)
	},
	(credentials, address, callback) => {
	  const src = `user=${address}\x01` +
		`auth=Bearer ${credentials.access_token}\x01\x01`
	  debug('cleartext xouauth2: %s', src)
	  const enc = Buffer.from(src).toString('base64')
	  debug('encoded xouauth2: %s', enc)
	  return callback(null, {
	    xoauth2: enc
	  })
	}
      ], callback)
    }
  }
}
