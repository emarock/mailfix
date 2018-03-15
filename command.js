const meta = require('./package')
const debug = require('debug')(meta.name + ':command')
const yargs = require('yargs')

module.exports = function () {

  yargs.usage('Usage: $0 <command> [options]')
  yargs.options({
    'secret': {
      alias: 's',
      nargs: 1,
      string: true,
      describe: 'The secret for email address anonymization',
      default: 'quite a boring secret'
    },
    'provider': {
      alias: 'p',
      nargs: 1,
      string: true,
      choices: [
	'mac',
	'imap'
      ],
      describe: 'The mailbox provider',
      demandOption: true
    },
    'mac-index': {
      nargs: 1,
      string: true,
      describe: 'The index file path for "mac" provider',
      default: '~/Library/Mail/V5/MailData/Envelope\ Index'
    },
    'user-words': {
      nargs: 1,
      number: true,
      describe: 'The number of words for anonymization of address usernames',
      default: 4
    },
    'domain-words': {
      nargs: 1,
      number: true,
      describe: 'The number of words for anonymization of address domains',
      default: 3
    }
  })

  yargs.command(require('./command-flow'))

  yargs.help('h')
  yargs.alias('h', 'help')
  yargs.alias('v', 'version')
  yargs.env(meta.name.replace(/-/g, '').toUpperCase())

  yargs.demandCommand(1, `${meta.name}@${meta.version} ${__dirname}`)

  yargs.strict()
  
  const argv = yargs.argv

}
