require('dotenv').config();

const path = require('path');
const Database = require('better-sqlite3');

const dbFile = process.env.DB_FILE
    ? path.resolve(process.env.DB_FILE)
    : path.join(__dirname, 'student_tasks.db');

const db = new Database(dbFile);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

module.exports = db;
