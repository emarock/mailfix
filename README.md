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


### Anonymization

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
```


### Export the "All Mail" folder from Gmail

```
$ mailfix flow -p gmail --gmail-filter 'All Mail' -o /tmp/imap-gmail.csv
```


### Export the local Apple Mail archive

```
$ mailfix flow -p mac -o /tmp/mac-flow.csv
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

