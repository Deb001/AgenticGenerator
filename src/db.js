// src/db.js
// SQLite wrapper with promise‑based helpers and automatic DB initialization.

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Resolve database path (env var overrides default)
const DB_PATH = process.env.DB_PATH || path.resolve(process.cwd(), 'data', 'calculator.db');

// Ensure the directory for the DB file exists
const DB_DIR = path.dirname(DB_PATH);
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

/**
 * Wrapper around sqlite3.Database providing async helpers.
 */
class Database {
  /**
   * @param {string} filePath Path to the SQLite file.
   */
  constructor(filePath) {
    this._db = new sqlite3.Database(filePath, (err) => {
      if (err) {
        console.error('Failed to open SQLite database:', err);
        // Propagate the error to prevent silent failures
        throw err;
      }
    });
    // Force serialized execution to avoid race conditions
    this._db.serialize();
  }

  /**
   * Execute INSERT/UPDATE/DELETE statements.
   * @param {string} sql
   * @param {Array<any>} [params=[]]
   * @returns {Promise<{lastID: number, changes: number}>}
   */
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this._db.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  /**
   * Fetch a single row.
   * @param {string} sql
   * @param {Array<any>} [params=[]]
   * @returns {Promise<object|null>}
   */
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this._db.get(sql, params, (err, row) => {
        if (err) return reject(err);
        resolve(row || null);
      });
    });
  }

  /**
   * Fetch multiple rows.
   * @param {string} sql
   * @param {Array<any>} [params=[]]
   * @returns {Promise<Array<object>>}
   */
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this._db.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  /**
   * Close the underlying connection.
   * @returns {Promise<void>}
   */
  close() {
    return new Promise((resolve, reject) => {
      this._db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

// Singleton instance used throughout the app
const db = new Database(DB_PATH);

/**
 * Initialise the database schema.
 * Creates the `items` table if it does not exist.
 * @param {string} [dbPath=DB_PATH]
 * @returns {Promise<void>}
 */
async function initDb(dbPath = DB_PATH) {
  // The table definition matches the required data structure.
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `;
  // Use the singleton `db` instance; it will create the file automatically.
  await db.run(createTableSQL);
}

// Run initialization immediately; abort process on failure.
initDb().catch((err) => {
  console.error('Database initialisation failed:', err);
  process.exit(1);
});

module.exports = {
  db,
  run: db.run.bind(db),
  get: db.get.bind(db),
  all: db.all.bind(db),
  initDb,
  Database,
};