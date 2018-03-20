# Mailfix

> Email Flow Information Export


## Welcome

Mailfix is a command-line tool for exporting anonymized flow
information from email archives. The primary intent is to assemble
personal datasets for statistical and social network analysis.

Email flow information is exported in CSV format, with each row
consisting of the following fields:

 * id: the email message identifier, unique within the mailbox

 * date: the date and time

 * type: the receipient type, either `to` or `cc`

 * sender: the anonymized sender

 * receiver: the anonymized receiver


### Supported formats

Mailfix can currently export flow informations from:

 * GMAIL accounts

 * IMAP accounts

 * Apple Mail on Mac OS X (successfully tested on version 11.2)


## Anonymization

Email flow information is extremely sensitive and, in order to
preserve everyone's privacy, it should never be shared in
clear.

Mailfix supports deterministic anonymization that can be controlled by
providing a secret phrase through the `--secret` command-line
option.

Anonymization will map domains consistently, but not user names:

```
$ mailfix map alice@example.com
et.pariatur.rem.aut@doloribus.peggie.ca

$ mailfix map bob@example.com
perferendis.sapiente.voluptatibus.doloremque@doloribus.peggie.ca

$ mailfix map bob@example.net
quis.sit.minus.eveniet@deleniti.powlowski.biz

```

Anonymization is enabled by default with a pre-defined secret; it can
be disabled by providing an empty string.


## Installation

```
$ npm install -g mailfix
```


## Quick Start


### Export from an IMAP account

```
$ mailfix flow -p imap -H imap.example.com -o /tmp/imap-flow.csv
? Username: imapuser
? Password: [hidden]
domain anonymization produced 0 conflicts
address anonymizazion produced 0 conflicts

$ head /tmp/imap-flow.csv 
id,date,type,sender,receiver
1,2006-05-05T09:09:11.000Z,to,necessitatibus.iusto.ipsa.praesentium@vel.pfannerstill.biz,omnis.est.quo.explicabo@vel.pfannerstill.biz
1,2006-05-05T09:09:11.000Z,to,necessitatibus.iusto.ipsa.praesentium@vel.pfannerstill.biz,dolores.eum.sint.vitae@vel.pfannerstill.biz
1,2006-05-05T09:09:11.000Z,to,necessitatibus.iusto.ipsa.praesentium@vel.pfannerstill.biz,porro.quia.qui.suscipit@vel.pfannerstill.biz
```


### Export the "All Mail" folder from Gmail

```
$ mailfix flow -p gmail --gmail-filter 'All Mail' -o /tmp/imap-gmail.csv
Authorize access by visiting this url: https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%2Fmail.google.com%2F&response_type=code&client_id=327407735637-6fa6a0m8rh2dsau0krqv7unvcoehefol.apps.googleusercontent.com&redirect_uri=urn%3Aietf%3Awg%3Aoauth%3A2.0%3Aoob
? Enter the code from that page here: 4/AADV636PXBDv-oGnF6vXoT82ry-uJVB_L5Eo1M7V9Qjt0JV4kZWbPb4
domain anonymization produced 0 conflicts
address anonymizazion produced 0 conflicts

$ head /tmp/gmail-flow.csv
id,date,type,sender,receiver
26,2010-07-14T09:17:56.000Z,cc,necessitatibus.iusto.ipsa.praesentium@vel.pfannerstill.biz,atque.sed.molestiae.debitis@dignissimos.beier.net
26,2010-07-14T09:17:56.000Z,cc,necessitatibus.iusto.ipsa.praesentium@vel.pfannerstill.biz,in.expedita.nisi.nihil@ut.braun.biz
26,2010-07-14T09:17:56.000Z,cc,necessitatibus.iusto.ipsa.praesentium@vel.pfannerstill.biz,iusto.consequatur.sint.deleniti@culpa.makenzie.name
```


### Export the local Apple Mail archive

```
$ mailfix flow -p mac -o /tmp/mac-flow.csv
domain anonymization produced 0 conflicts
address anonymizazion produced 0 conflicts

$ head /tmp/mac-flow.csv
45,2016-09-28T08:20:35.000Z,cc,necessitatibus.iusto.ipsa.praesentium@vel.pfannerstill.biz,cum.qui.voluptate.ex@vel.pfannerstill.biz
46,2016-09-30T07:47:44.000Z,to,necessitatibus.iusto.ipsa.praesentium@vel.pfannerstill.biz,voluptatem.tempore.quia.ipsum@vel.pfannerstill.biz
46,2016-09-30T07:47:44.000Z,to,necessitatibus.iusto.ipsa.praesentium@vel.pfannerstill.biz,cum.qui.voluptate.ex@vel.pfannerstill.biz
```


## Command-line Options

```
$ mailfix -h
Usage: mailfix <command> [options]

Commands:
  mailfix flow [options]  Export flow information from an email archive
  mailfix map <address>   Map an email address to its anonymized form

Options:
  --secret, -s                   The secret for email address anonymization
                                     [string] [default: "quite a boring secret"]
  --output, -o                   Write data to file                     [string]
  --save-mapping, --mapping, -m  Write anonymization mapping to file    [string]
  --user-words                   The number of words for anonymization of
                                 address usernames         [number] [default: 4]
  --domain-words                 The number of words for anonymization of
                                 address domains           [number] [default: 3]
  --provider, -p                 The mailbox provider
                                      [string] [choices: "mac", "imap", "gmail"]
  --mac-index                    The index file path for "mac" provider
                 [string] [default: "~/Library/Mail/V5/MailData/Envelope Index"]
  --imap-host, -H                The IMAP server host                   [string]
  --imap-port                    The IMAP server port    [number] [default: 993]
  --imap-tls                     Enable TLS on the connection with the IMAP
                                 server                [boolean] [default: true]
  --imap-filter, --gmail-filter  Only fetch in mailboxes matching the given
                                 regular expression                     [string]
  --imap-invert, --gmail-invert  Invert filter matching                [boolean]
  -h, --help                     Show help                             [boolean]
  -v, --version                  Show version number                   [boolean]

```

