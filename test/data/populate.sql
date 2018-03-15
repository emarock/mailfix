INSERT OR REPLACE INTO addresses (ROWID, address)
VALUES
  (1, 'joe@example.com'),
  (2, 'john@example.com'),
  (3, 'jim@example.net'),
  (4, 'jane@example.org'),
  (5, 'jack');

INSERT OR REPLACE INTO messages (ROWID, date_sent, sender)
VALUES
  (1, 1514764800, 1),
  (2, 1517443200, 2),
  (3, 1519862400, 3),
  (4, 1519862400, 5);

INSERT OR REPLACE INTO recipients (message_id, address_id, type)
VALUES
  (1, 2, 0),
  (1, 3, 1),
  (1, 4, 1),
  (1, 5, 1),
  (2, 1, 0),
  (2, 3, 1),
  (2, 4, 1),
  (3, 1, 0),
  (3, 2, 0),
  (4, 1, 1),
  (4, 2, 1),
  (4, 3, 1),
  (4, 4, 1),
  (4, 5, 1);
