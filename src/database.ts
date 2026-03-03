import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(__dirname, '..', 'bookbase.db'));

//skapa tabeller om dom inte redan finns
db.exec(`
  CREATE TABLE IF NOT EXISTS användare (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    namn TEXT NOT NULL,
    epost TEXT UNIQUE NOT NULL,
    losenord TEXT NOT NULL,
    skapadDatum TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
  );

  CREATE TABLE IF NOT EXISTS recensioner (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bokId TEXT NOT NULL,
    användareId INTEGER NOT NULL,
    text TEXT NOT NULL,
    betyg INTEGER NOT NULL CHECK(betyg >= 1 AND betyg <= 5),
    skapadDatum TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    FOREIGN KEY (användareId) REFERENCES användare(id) ON DELETE CASCADE
  );
`);

export default db;
