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
    'output': {
      alias: 'o',
      nargs: 1,
      string: true,
      describe: 'Write data to file'
    },
    'save-mapping': {
      alias: ['mapping', 'm'],
      nargs: 1,
      string: true,
      describe: 'Write anonymization mapping to file'
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
    },
    'mac-index': {
      nargs: 1,
      string: true,
      describe: 'The index file path for "mac" provider',
      default: '~/Library/Mail/V5/MailData/Envelope\ Index'
    },
    'imap-host': {
      alias: 'H',
      nargs: 1,
      string: true,
      describe: 'The IMAP server host',
    },
    'imap-port': {
      nargs: 1,
      number: true,
      describe: 'The IMAP server port',
      default: 993
    },
    'imap-tls': {
      nargs: 1,
      boolean: true,
      describe: 'Enable TLS on the connection with the IMAP server',
      default: true
    },
    'imap-filter': {
      nargs: 1,
      string: true,
      describe: 'Only fetch in mailboxes matching the given regular expression'
    },
    'imap-invert': {
      nargs: 1,
      boolean: true,
      describe: 'Invert imap-filter matching'
    }
  })

  yargs.command(require('./command-flow'))
  yargs.command(require('./command-map'))

  yargs.help('h')
  yargs.alias('h', 'help')
  yargs.alias('v', 'version')
  yargs.env(meta.name.replace(/-/g, '').toUpperCase())

  yargs.demandCommand(1, `${meta.name}@${meta.version} ${__dirname}`)

  yargs.strict()
  
  const argv = yargs.argv

}
