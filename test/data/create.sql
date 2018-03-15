-- Apple Mail 11.2 (3445.5.20) Envelope Index schema

CREATE TABLE subjects(
  ROWID INTEGER PRIMARY KEY,
  subject COLLATE RTRIM,
  normalized_subject COLLATE RTRIM
);
CREATE TABLE addresses(
  ROWID INTEGER PRIMARY KEY,
  address COLLATE NOCASE,
  comment,
  UNIQUE(address, comment)
);
CREATE TABLE properties(ROWID INTEGER PRIMARY KEY, key, value, UNIQUE(key));
CREATE TABLE "messages"(
  ROWID INTEGER PRIMARY KEY AUTOINCREMENT,
  message_id,
  document_id BLOB,
  in_reply_to,
  remote_id INTEGER,
  sender INTEGER,
  subject_prefix,
  subject INTEGER,
  date_sent INTEGER,
  date_received INTEGER,
  date_created INTEGER,
  date_last_viewed INTEGER,
  mailbox INTEGER,
  remote_mailbox INTEGER,
  flags INTEGER,
  read,
  flagged,
  size INTEGER,
  color,
  type INTEGER,
  conversation_id INTEGER DEFAULT -1,
  snippet TEXT DEFAULT NULL,
  fuzzy_ancestor INTEGER DEFAULT NULL,
  automated_conversation INTEGER DEFAULT 0,
  root_status INTEGER DEFAULT -1,
  conversation_position INTEGER DEFAULT -1,
  deleted INTEGER DEFAULT 0
);
CREATE TABLE "mailboxes"(
  ROWID INTEGER PRIMARY KEY AUTOINCREMENT,
  url UNIQUE,
  total_count INTEGER DEFAULT 0,
  unread_count INTEGER DEFAULT 0,
  unseen_count INTEGER DEFAULT 0,
  deleted_count INTEGER DEFAULT 0,
  unread_count_adjusted_for_duplicates INTEGER DEFAULT 0,
  change_identifier,
  source INTEGER,
  alleged_change_identifier
);
CREATE TABLE imap_messages(
  ROWID INTEGER PRIMARY KEY AUTOINCREMENT,
  message INTEGER REFERENCES messages(ROWID) ON DELETE SET NULL,
  mailbox INTEGER REFERENCES mailboxes(ROWID) ON DELETE CASCADE,
  flags INTEGER,
  uid INTEGER
);
CREATE TABLE local_message_actions(
  ROWID INTEGER PRIMARY KEY AUTOINCREMENT,
  mailbox INTEGER REFERENCES mailboxes(ROWID) ON DELETE CASCADE,
  action_type INTEGER,
  activity_type INTEGER,
  user_initiated BOOL,
  flags INTEGER,
  mask INTEGER
);
CREATE TABLE action_imap_messages(
  ROWID INTEGER PRIMARY KEY,
  action INTEGER REFERENCES local_message_actions(ROWID) ON DELETE CASCADE,
  imap_uid INTEGER,
  date_seen REAL
);
CREATE TABLE action_messages(
  ROWID INTEGER PRIMARY KEY,
  action INTEGER REFERENCES local_message_actions(ROWID) ON DELETE CASCADE,
  message INTEGER REFERENCES messages(ROWID) ON DELETE SET NULL
);
CREATE TABLE action_labels(
  ROWID INTEGER PRIMARY KEY,
  action INTEGER REFERENCES local_message_actions(ROWID) ON DELETE CASCADE,
  do_add INTEGER,
  label INTEGER REFERENCES mailboxes(ROWID) ON DELETE CASCADE
);
CREATE TABLE imap_copy_action_messages(
  ROWID INTEGER PRIMARY KEY,
  action INTEGER REFERENCES local_message_actions(ROWID) ON DELETE CASCADE,
  source_message_uid INTEGER,
  source_message INTEGER REFERENCES messages(ROWID) ON DELETE SET NULL,
  destination_message INTEGER REFERENCES messages(ROWID) ON DELETE CASCADE
);
CREATE TABLE mailbox_actions(
  ROWID INTEGER PRIMARY KEY AUTOINCREMENT,
  account_identifier TEXT,
  action_type INTEGER,
  mailbox_name TEXT
);
CREATE TABLE action_ews_messages(
  ROWID INTEGER PRIMARY KEY,
  action INTEGER REFERENCES local_message_actions(ROWID) ON DELETE CASCADE,
  ews_item_id TEXT
);
CREATE TABLE ews_copy_action_messages(
  ROWID INTEGER PRIMARY KEY,
  action INTEGER REFERENCES local_message_actions(ROWID) ON DELETE CASCADE,
  source_ews_item_id TEXT,
  source_message INTEGER REFERENCES messages(ROWID) ON DELETE SET NULL,
  destination_message INTEGER REFERENCES messages(ROWID) ON DELETE CASCADE
);
CREATE TABLE "labels"(
  message_id INTEGER REFERENCES messages(ROWID) ON DELETE CASCADE,
  mailbox_id INTEGER REFERENCES mailboxes(ROWID) ON DELETE CASCADE,
  PRIMARY KEY(message_id, mailbox_id)
) WITHOUT ROWID;
CREATE TABLE "threads"(
  ROWID INTEGER PRIMARY KEY,
  message_id INTEGER NOT NULL REFERENCES messages(ROWID) ON DELETE CASCADE,
  reference TEXT,
  is_originator DEFAULT 0
);
CREATE TABLE "attachments"(
  ROWID INTEGER PRIMARY KEY,
  message_id INTEGER NOT NULL REFERENCES messages(ROWID) ON DELETE CASCADE,
  name TEXT,
  UNIQUE(message_id, name)
);
CREATE TABLE "recipients"(
  ROWID INTEGER PRIMARY KEY,
  message_id INTEGER NOT NULL REFERENCES messages(ROWID) ON DELETE CASCADE,
  type INTEGER,
  address_id INTEGER NOT NULL REFERENCES addresses(ROWID) ON DELETE CASCADE,
  position INTEGER
);
CREATE TABLE "events"(
  ROWID INTEGER PRIMARY KEY AUTOINCREMENT,
  message_id INTEGER NOT NULL REFERENCES messages(ROWID) ON DELETE CASCADE,
  start_date INTEGER,
  end_date INTEGER,
  location TEXT,
  out_of_date INTEGER DEFAULT 0,
  processed INTEGER DEFAULT 0,
  is_all_day INTEGER DEFAULT 0,
  associated_id_string TEXT,
  original_receiving_account TEXT,
  ical_uid TEXT,
  is_response_requested INTEGER DEFAULT 0
);
CREATE TABLE "duplicates_unread_count"(
  ROWID INTEGER PRIMARY KEY,
  message_id TEXT NOT NULL ON CONFLICT IGNORE,
  mailbox_id INTEGER NOT NULL REFERENCES mailboxes(ROWID) ON DELETE CASCADE,
  unread_count INTEGER DEFAULT 0,
  UNIQUE(message_id, mailbox_id)
);
CREATE TABLE "ews_folders"(
  ROWID INTEGER PRIMARY KEY,
  folder_id TEXT UNIQUE ON CONFLICT REPLACE,
  mailbox_id INTEGER NOT NULL UNIQUE ON CONFLICT REPLACE REFERENCES mailboxes(ROWID) ON DELETE CASCADE,
  sync_state TEXT
);
CREATE TABLE last_spotlight_check_date(
  message_id INTEGER NOT NULL UNIQUE ON CONFLICT REPLACE REFERENCES messages(ROWID) ON DELETE CASCADE,
  date INTEGER,
  PRIMARY KEY(message_id)
) WITHOUT ROWID;
