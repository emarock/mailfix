const meta = require('../package')
const debug = require('debug')(`${meta.name}:imap-credentials`)
const _ = require('lodash')
const inquirer = require('inquirer')

const defaults = {
  output: process.stdout
}

module.exports = function (options) {
  options = _.defaultsDeep(options, defaults)

  const prompt = inquirer.createPromptModule(options)

  return {
    get: function (callback) {
      prompt([{
        type: 'string',
        name: 'user',
        message: 'Username:'
      }, {
	type: 'password',
        name: 'password',
        message: 'Password:'
      }]).then((answers) => {
      	return callback(null, answers)
      }).catch((err) => {
      	return callback(err)
      })
    }
  }
}
