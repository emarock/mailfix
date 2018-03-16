# Mailfix

> Email Flow Information Export


## Welcome

Mailfix is a commandline tool for exporting anonymized flow
information from mailbox formats. The primary intent is to assemble
large datasets for statistical and social network analysis.

Email flow information is exported in CSV format, with each row
consisting of the following fields:

 * id: the identifier for and email message, unique within the mailbox

 * date: the date and time

 * type: the receipient type, either `to` or `cc`

 * sender: the sender

 * receiver: the receiver


### Supported formats

Mailfix can currently export flow informations from:

 * An IMAP account

 * Apple Mail (successfully tested on version 11.2)


## Installation

```
$ npm install -g mailfix
```


## Usage

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
                                               [string] [choices: "mac", "imap"]
  --mac-index                    The index file path for "mac" provider
                 [string] [default: "~/Library/Mail/V5/MailData/Envelope Index"]
  --imap-host, -H                The IMAP server host                   [string]
  --imap-port                    The IMAP server port    [number] [default: 993]
  --imap-tls                     Enable TLS on the connection with the IMAP
                                 server                [boolean] [default: true]
  --imap-filter                  Only fetch in mailboxes matching the given
                                 regular expression                     [string]
  --imap-invert                  Invert imap-filter matching           [boolean]
  -h, --help                     Show help                             [boolean]
  -v, --version                  Show version number                   [boolean]

```

